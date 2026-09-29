import io
import csv
import openpyxl
from django.db import transaction
from api.models import (
    Recipient,
    RecipientChannelPreference,
    Language,
    Occupation,
    State,
    Country,
    District
)


def parse_tabular_file(uploaded_file):
    """
    Parses an uploaded CSV or XLSX file and yields rows as dictionaries.
    """
    filename = uploaded_file.name.lower()
    rows = []

    if filename.endswith('.csv'):
        content = uploaded_file.read().decode('utf-8-sig', errors='replace')
        reader = csv.DictReader(io.StringIO(content))
        for row in reader:
            cleaned = {k.strip().lower().replace(' ', '_'): (v.strip() if v else '') for k, v in row.items() if k}
            rows.append(cleaned)
    elif filename.endswith('.xlsx') or filename.endswith('.xls'):
        wb = openpyxl.load_workbook(uploaded_file, data_only=True)
        sheet = wb.active
        headers = []
        for idx, row in enumerate(sheet.iter_rows(values_only=True)):
            if idx == 0:
                headers = [str(cell).strip().lower().replace(' ', '_') if cell is not None else f'col_{i}' for i, cell in enumerate(row)]
            else:
                if any(row): # not empty row
                    row_dict = {}
                    for h, val in zip(headers, row):
                        row_dict[h] = str(val).strip() if val is not None else ''
                    rows.append(row_dict)
    else:
        raise ValueError("Unsupported file format. Please upload a .csv or .xlsx file.")

    return rows


def process_import_rows(rows, mode='preview', duplicate_choice='SKIP'):
    """
    Validates, detects duplicates, and previews or imports rows.
    duplicate_choice: 'SKIP' | 'UPDATE' | 'CREATE_NEW'
    """
    total = len(rows)
    valid_rows = []
    invalid_rows = []
    duplicates = []
    row_errors = []

    # Cache lookup dictionaries for performance
    languages = {l.name.lower(): l for l in Language.objects.all()}
    languages.update({l.code.lower(): l for l in Language.objects.all()})

    occupations = {o.title.lower(): o for o in Occupation.objects.all()}
    states = {s.name.lower(): s for s in State.objects.all()}
    india, _ = Country.objects.get_or_create(name='India', defaults={'code': 'IN'})

    # Pre-fetch existing identifiers
    existing_emails = {r.email.lower(): r for r in Recipient.objects.filter(email__isnull=False).exclude(email='')}
    existing_phones = {r.phone: r for r in Recipient.objects.filter(phone__isnull=False).exclude(phone='')}
    existing_ext_ids = {r.external_reference_id: r for r in Recipient.objects.filter(external_reference_id__isnull=False).exclude(external_reference_id='')}

    parsed_records = []

    for idx, r in enumerate(rows, start=1):
        first_name = r.get('first_name') or r.get('name') or r.get('fullname') or ''
        last_name = r.get('last_name') or ''
        email = (r.get('email') or '').lower()
        phone = r.get('phone') or r.get('phone_number') or r.get('mobile') or ''
        ext_id = r.get('external_reference_id') or r.get('external_id') or r.get('id') or ''
        lang_str = (r.get('language') or r.get('preferred_language') or 'English').lower()
        state_str = (r.get('state') or '').lower()
        district_str = r.get('district') or ''
        city = r.get('city') or ''
        occ_str = (r.get('occupation') or '').lower()
        gender = (r.get('gender') or 'OTHER').upper()
        if gender not in ['MALE', 'FEMALE', 'OTHER']:
            gender = 'OTHER'

        errors = []
        if not first_name:
            errors.append("First Name / Name is required.")
        if not email and not phone:
            errors.append("At least one contact method (email or phone) is required.")

        if errors:
            invalid_rows.append(idx)
            row_errors.append({"row": idx, "errors": errors, "data": r})
            continue

        # Duplicate detection: match email OR phone OR external_ref_id
        matched_recipient = None
        dup_reason = None
        if email and email in existing_emails:
            matched_recipient = existing_emails[email]
            dup_reason = f"Duplicate email: {email}"
        elif phone and phone in existing_phones:
            matched_recipient = existing_phones[phone]
            dup_reason = f"Duplicate phone: {phone}"
        elif ext_id and ext_id in existing_ext_ids:
            matched_recipient = existing_ext_ids[ext_id]
            dup_reason = f"Duplicate external ID: {ext_id}"

        # Resolve relations
        lang_obj = languages.get(lang_str)
        occ_obj = occupations.get(occ_str)
        state_obj = states.get(state_str)
        dist_obj = None
        if state_obj and district_str:
            dist_obj, _ = District.objects.get_or_create(name=district_str, state=state_obj)

        record_data = {
            'row_idx': idx,
            'first_name': first_name,
            'last_name': last_name,
            'email': email or None,
            'phone': phone or None,
            'external_reference_id': ext_id or None,
            'preferred_language': lang_obj,
            'language': lang_obj,
            'occupation': occ_obj,
            'state': state_obj,
            'district': dist_obj,
            'country': india,
            'city': city,
            'gender': gender,
            'is_duplicate': matched_recipient is not None,
            'duplicate_reason': dup_reason,
            'matched_recipient': matched_recipient
        }

        if matched_recipient:
            duplicates.append(idx)

        valid_rows.append(idx)
        parsed_records.append(record_data)

    if mode == 'preview':
        sample_preview = [
            {
                "row": rec['row_idx'],
                "name": f"{rec['first_name']} {rec['last_name']}".strip(),
                "email": rec['email'] or '',
                "phone": rec['phone'] or '',
                "language": rec['preferred_language'].name if rec['preferred_language'] else 'Default',
                "state": rec['state'].name if rec['state'] else '',
                "district": rec['district'].name if rec['district'] else '',
                "occupation": rec['occupation'].title if rec['occupation'] else '',
                "is_duplicate": rec['is_duplicate'],
                "duplicate_reason": rec['duplicate_reason'] or ''
            }
            for rec in parsed_records[:10]
        ]
        return {
            "mode": "preview",
            "total_rows": total,
            "valid_count": len(valid_rows),
            "invalid_count": len(invalid_rows),
            "duplicate_count": len(duplicates),
            "preview_samples": sample_preview,
            "errors": row_errors[:20]
        }

    # mode == 'confirm': Execute import
    imported_count = 0
    updated_count = 0
    skipped_count = 0

    with transaction.atomic():
        for rec in parsed_records:
            if rec['is_duplicate']:
                if duplicate_choice == 'SKIP':
                    skipped_count += 1
                    continue
                elif duplicate_choice == 'UPDATE':
                    target = rec['matched_recipient']
                    target.first_name = rec['first_name']
                    if rec['last_name']: target.last_name = rec['last_name']
                    if rec['preferred_language']: target.preferred_language = rec['preferred_language']
                    if rec['occupation']: target.occupation = rec['occupation']
                    if rec['state']: target.state = rec['state']
                    if rec['district']: target.district = rec['district']
                    if rec['city']: target.city = rec['city']
                    target.save()
                    updated_count += 1
                    continue
                elif duplicate_choice == 'CREATE_NEW':
                    # Create new with distinct reference
                    rec_inst = Recipient.objects.create(
                        first_name=rec['first_name'],
                        last_name=rec['last_name'],
                        email=rec['email'],
                        phone=rec['phone'],
                        preferred_language=rec['preferred_language'],
                        language=rec['preferred_language'],
                        occupation=rec['occupation'],
                        country=rec['country'],
                        state=rec['state'],
                        district=rec['district'],
                        city=rec['city'],
                        gender=rec['gender'],
                    )
                    imported_count += 1
            else:
                rec_inst = Recipient.objects.create(
                    first_name=rec['first_name'],
                    last_name=rec['last_name'],
                    email=rec['email'],
                    phone=rec['phone'],
                    external_reference_id=rec['external_reference_id'],
                    preferred_language=rec['preferred_language'],
                    language=rec['preferred_language'],
                    occupation=rec['occupation'],
                    country=rec['country'],
                    state=rec['state'],
                    district=rec['district'],
                    city=rec['city'],
                    gender=rec['gender'],
                )
                imported_count += 1

    return {
        "mode": "confirm",
        "total_rows": total,
        "imported_count": imported_count,
        "updated_count": updated_count,
        "skipped_count": skipped_count,
        "errors": row_errors
    }
