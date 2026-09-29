from django.core.management.base import BaseCommand, CommandError
from api.models import User
import os

class Command(BaseCommand):
    help = 'Safely create or update an Admin seed user for development or initial deployment.'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for the admin user')
        parser.add_argument('--email', type=str, help='Email address for the admin user')
        parser.add_argument('--password', type=str, help='Password for the admin user')
        parser.add_argument('--first-name', type=str, default='Platform', help='First name')
        parser.add_argument('--last-name', type=str, default='Administrator', help='Last name')

    def handle(self, *args, **options):
        username = options['username'] or os.getenv('SEED_ADMIN_USERNAME', 'Lokesh')
        email = options['email'] or os.getenv('SEED_ADMIN_EMAIL', 'lokesh@example.com')
        password = options['password'] or os.getenv('SEED_ADMIN_PASSWORD', 'lokesh@123')
        first_name = options['first_name'] or 'Lokesh'
        last_name = options['last_name'] or 'Admin'

        if not password:
            raise CommandError("A secure password must be supplied via --password argument or SEED_ADMIN_PASSWORD env var.")

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': User.RoleChoices.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )

        user.set_password(password)
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.role = User.RoleChoices.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

        action_str = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(
            f"Successfully {action_str} Admin user: '{username}' ({email}) with role: '{user.role}'"
        ))
