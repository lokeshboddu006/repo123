import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { recipientsApi } from '../../api/recipients';

export const ImportRecipients = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [duplicateChoice, setDuplicateChoice] = useState('SKIP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Results from preview and final import
  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const steps = [
    { num: 1, title: 'Upload File' },
    { num: 2, title: 'Validation' },
    { num: 3, title: 'Data Preview' },
    { num: 4, title: 'Duplicates' },
    { num: 5, title: 'Confirm' },
    { num: 6, title: 'Success' },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      'first_name,last_name,email,phone,language,state,district,city,occupation,gender\n' +
      'Anil,Kumar,anil.kumar@example.com,+919848123456,Telugu,Andhra Pradesh,Visakhapatnam,Visakhapatnam,Student,MALE\n' +
      'Deepa,Sharma,deepa.s@example.com,+919848234567,Telugu,Andhra Pradesh,Vijayawada,Vijayawada,Student,FEMALE\n' +
      'Mohan,Das,mohan.das@example.com,+919848345678,English,Karnataka,Bengaluru Urban,Bengaluru,Engineer,MALE\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'recipients_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runPreviewValidation = async () => {
    if (!file) {
      setError('Please select a CSV or XLSX file first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'preview');
    formData.append('duplicate_choice', duplicateChoice);

    try {
      const data = await recipientsApi.importFile(formData);
      setPreviewData(data);
      setCurrentStep(3); // Go to Preview
    } catch (err) {
      setError(err.response?.data?.error || 'Validation failed. Please verify headers.');
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'confirm');
    formData.append('duplicate_choice', duplicateChoice);

    try {
      const data = await recipientsApi.importFile(formData);
      setImportResult(data);
      setCurrentStep(6); // Success
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Header
        title="Recipient Import Wizard"
        subtitle="Bulk import citizen directory records using CSV or Microsoft Excel spreadsheets"
        actions={
          <Link
            to="/recipients"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white"
          >
            &larr; Back to Directory
          </Link>
        }
      />

      {/* Progress Step Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-medium mt-1.5 ${
                    currentStep >= s.num ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full mx-1 ${
                    currentStep > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        {/* STEP 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-6 text-center">
            <div className="max-w-md mx-auto p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-brand-500 transition-colors bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Choose CSV or Excel Spreadsheet
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Supported formats: .csv, .xlsx, .xls
              </p>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                Browse Files
              </label>
              {file && (
                <div className="mt-4 p-2 bg-white rounded-lg border border-slate-200 inline-flex items-center gap-2 text-xs text-slate-700">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 hover:underline font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample CSV Template
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                disabled={!file}
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <span>Continue to Validation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Validation */}
        {currentStep === 2 && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Header & Schema Check</h4>
              <p className="text-slate-500">
                The platform will parse your file columns, check required contact attributes, and verify locations and language codes against Master Data.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>File Selected: {file?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Required Fields: first_name, email/phone</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={runPreviewValidation}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Run Validation & Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview */}
        {currentStep === 3 && previewData && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-slate-500 font-medium">Total Rows</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">{previewData.total_rows}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-emerald-700 font-medium">Valid Records</span>
                <p className="text-2xl font-bold text-emerald-800 mt-1">{previewData.valid_count}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-amber-700 font-medium">Detected Duplicates</span>
                <p className="text-2xl font-bold text-amber-800 mt-1">{previewData.duplicate_count}</p>
              </div>
            </div>

            {/* Sample Table */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Sample Parsed Rows (First 10)</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px] text-slate-600">
                  <thead className="bg-slate-50 font-semibold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Language</th>
                      <th className="px-3 py-2">State</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.preview_samples?.map((s, idx) => (
                      <tr key={idx} className={s.is_duplicate ? 'bg-amber-50/40' : ''}>
                        <td className="px-3 py-2 font-mono">{s.row}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                        <td className="px-3 py-2">{s.email || '-'}</td>
                        <td className="px-3 py-2">{s.phone || '-'}</td>
                        <td className="px-3 py-2">{s.language}</td>
                        <td className="px-3 py-2">{s.state}</td>
                        <td className="px-3 py-2">
                          {s.is_duplicate ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                              Duplicate
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              New
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Change File
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Configure Duplicate Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Duplicates */}
        {currentStep === 4 && (
          <div className="space-y-6 text-xs">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Select Duplicate Resolution Strategy
              </h4>
              <p className="text-slate-500">
                Choose how existing records (matching on Email, Phone, or External Reference ID) should be handled:
              </p>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  duplicateChoice === 'SKIP'
                    ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="dup"
                  value="SKIP"
                  checked={duplicateChoice === 'SKIP'}
                  onChange={() => setDuplicateChoice('SKIP')}
                  className="mt-0.5 text-brand-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">SKIP (Recommended)</span>
                  <span className="text-slate-500">
                    Skip duplicate rows and preserve current database records without modification.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  duplicateChoice === 'UPDATE'
                    ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="dup"
                  value="UPDATE"
                  checked={duplicateChoice === 'UPDATE'}
                  onChange={() => setDuplicateChoice('UPDATE')}
                  className="mt-0.5 text-brand-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">UPDATE</span>
                  <span className="text-slate-500">
                    Update existing matching recipient records with latest demographic and location fields.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  duplicateChoice === 'CREATE_NEW'
                    ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="dup"
                  value="CREATE_NEW"
                  checked={duplicateChoice === 'CREATE_NEW'}
                  onChange={() => setDuplicateChoice('CREATE_NEW')}
                  className="mt-0.5 text-brand-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">CREATE_NEW</span>
                  <span className="text-slate-500">
                    Create duplicate entries as independent entries with new primary identifiers.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Preview
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Confirm */}
        {currentStep === 5 && (
          <div className="space-y-6 text-xs text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Ready to Execute Database Import
              </h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                File: <strong className="text-slate-700">{file?.name}</strong> | Strategy:{' '}
                <strong className="text-slate-700">{duplicateChoice}</strong>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={executeImport}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Start Final Import</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Success */}
        {currentStep === 6 && importResult && (
          <div className="space-y-6 text-center text-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Import Successfully Completed!
              </h3>
              <p className="text-slate-500 mt-1">
                Records have been inserted into PostgreSQL database.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-emerald-700 font-semibold">New Records Added</span>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {importResult.imported_count}
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="text-blue-700 font-semibold">Updated Existing</span>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {importResult.updated_count}
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-600 font-semibold">Skipped Duplicates</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {importResult.skipped_count}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-center gap-4">
              <button
                onClick={() => {
                  setFile(null);
                  setCurrentStep(1);
                  setPreviewData(null);
                  setImportResult(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                Import Another File
              </button>
              <button
                onClick={() => navigate('/recipients')}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm"
              >
                View Recipient Directory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
