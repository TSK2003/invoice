import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { SkipLink } from '../ui/SkipLink';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { hasLegacyDataToMigrate, migrateLegacyData } from '../../services/firebase/migration';
import { useToast } from '../../app/providers/ToastProvider';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasLegacyDataToMigrate()) {
      setShowMigrationBanner(true);
    }
  }, []);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const summary = await migrateLegacyData();
      showSuccess(
        'Migration Complete!',
        `Successfully imported ${summary.documentsCount} documents and ${summary.customersCount} customer profiles to Firestore.`
      );
      setShowMigrationBanner(false);
      navigate('/dashboard');
    } catch (err: any) {
      showError('Migration Failed', err.message || 'Error occurred during data migration.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors antialiased selection:bg-brand-100 selection:text-brand-900">
      <SkipLink />

      {/* Migration Notice Banner */}
      {showMigrationBanner && (
        <div className="bg-gradient-to-r from-brand-600 via-brand to-cyan-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium z-50">
          <div className="flex items-center gap-2 max-w-4xl">
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
            <span>
              Local draft data detected from your previous session. Import your data to your cloud Firestore database now.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleMigrate}
              disabled={isMigrating}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white text-brand-900 hover:bg-white/90 font-bold shadow-xs transition-colors"
            >
              {isMigrating ? 'Importing...' : 'Import to Cloud'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowMigrationBanner(false)}
              aria-label="Dismiss banner"
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Header />

      <main id="main-content" className="flex-1 w-full flex flex-col focus:outline-hidden">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
