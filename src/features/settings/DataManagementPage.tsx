import React, { useState } from 'react';
import { 
  fetchDocuments, 
  fetchCustomers, 
  fetchPayments, 
  fetchCompanyProfile, 
  fetchTemplateConfig,
  saveDocumentToFirestore,
  saveCustomerToFirestore,
  saveCompanyProfileToFirestore,
  saveTemplateConfigToFirestore
} from '../../services/firebase/firestore';
import { hasLegacyDataToMigrate, migrateLegacyData, clearLegacyLocalStorage } from '../../services/firebase/migration';
import { useToast } from '../../app/providers/ToastProvider';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { 
  Database, 
  Download, 
  Upload, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const DataManagementPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const [documents, customers, payments, company, template] = await Promise.all([
        fetchDocuments(),
        fetchCustomers(),
        fetchPayments(),
        fetchCompanyProfile(),
        fetchTemplateConfig(),
      ]);

      const backupData = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        company,
        template,
        documents,
        customers,
        payments,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AESCION_Studio_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Backup exported successfully!');
    } catch (err: any) {
      showError('Export failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.documents && !data.customers && !data.company) {
        throw new Error('Invalid backup file format. Expected documents or customer data.');
      }

      let docCount = 0;
      let custCount = 0;

      if (Array.isArray(data.documents)) {
        for (const doc of data.documents) {
          await saveDocumentToFirestore(doc);
          docCount++;
        }
      }

      if (Array.isArray(data.customers)) {
        for (const cust of data.customers) {
          await saveCustomerToFirestore(cust);
          custCount++;
        }
      }

      if (data.company) {
        await saveCompanyProfileToFirestore(data.company);
      }

      if (data.template) {
        await saveTemplateConfigToFirestore(data.template);
      }

      showSuccess(
        'Restore Complete!',
        `Restored ${docCount} documents and ${custCount} customer profiles.`
      );
    } catch (err: any) {
      showError('Restore failed', err.message);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleManualMigrate = async () => {
    setIsMigrating(true);
    try {
      const summary = await migrateLegacyData();
      showSuccess(
        'Migration Successful!',
        `Imported ${summary.documentsCount} documents and ${summary.customersCount} customer profiles.`
      );
    } catch (err: any) {
      showError('Migration failed', err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearLegacyConfirmed = () => {
    clearLegacyLocalStorage();
    setShowClearConfirm(false);
    showSuccess('Legacy localStorage keys cleared.');
  };

  const hasLegacy = hasLegacyDataToMigrate();

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Database className="w-6 h-6 text-brand" />
          Data Management & Cloud Backups
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export secure JSON snapshots, import historical datasets, and administer cloud database records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Card 1: Cloud Backup Export */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Export Full System Backup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Download a complete offline JSON archive containing all quotation, invoice, customer, payment, and business profile records.
            </p>
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Preparing Archive...' : 'Download JSON Backup'}</span>
          </button>
        </div>

        {/* Card 2: Restore from JSON */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Restore Data from JSON</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload a previously exported AESCION Document Studio backup to restore or merge records into Firestore.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer">
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isImporting ? 'Restoring Data...' : 'Choose JSON File'}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>

        {/* Card 3: Cloud Migration */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Browser localStorage Migration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {hasLegacy
                ? 'Local draft documents and settings from your browser were detected. Click below to synchronize them into cloud Firestore.'
                : 'All local browser documents and settings have already been migrated to your Firestore database.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isMigrating || !hasLegacy}
              onClick={handleManualMigrate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-600 text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isMigrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isMigrating ? 'Migrating...' : hasLegacy ? 'Run Migration' : 'Migration Up to Date'}</span>
            </button>
          </div>
        </div>

        {/* Card 4: Local Storage Cleanup */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Purge Browser Offline Cache</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Safely clean up old localStorage cache keys after verifying your cloud database contains all necessary documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-lg shadow-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Local Storage</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearLegacyConfirmed}
        title="Purge Browser Storage Cache"
        message="Are you sure you want to delete legacy offline documents stored in this browser's localStorage? Ensure you have verified your Firestore records before proceeding."
        confirmText="Yes, Purge Local Storage"
        variant="danger"
      />
    </div>
  );
};
