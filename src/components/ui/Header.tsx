import React from 'react';
import { Plus, LayoutDashboard, Settings, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { LOGO_BASE64 } from '../../constants/imageAssets';

interface HeaderProps {
  currentView: 'dashboard' | 'builder' | 'company' | 'template';
  onNavigate: (view: 'dashboard' | 'builder' | 'company' | 'template') => void;
  onCreateNew: () => void;
  autoSaveTime?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onCreateNew,
  autoSaveTime,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-line shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Left: AESCION Branding */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => onNavigate('dashboard')}
        >
          <img
            src={LOGO_BASE64}
            alt="AESCION Logo"
            className="h-7 w-auto object-contain"
          />
          <div className="hidden sm:flex items-center pl-3 border-l border-line">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">
              Document Studio
            </span>
          </div>
        </div>

        {/* Center: Clean Enterprise Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-brand-50 text-brand font-semibold border border-brand-200'
                : 'text-secondary hover:text-primary hover:bg-page'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => onNavigate('builder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              currentView === 'builder'
                ? 'bg-brand-50 text-brand font-semibold border border-brand-200'
                : 'text-secondary hover:text-primary hover:bg-page'
            }`}
          >
            <FileText className="w-4 h-4" />
            Document Builder
          </button>

          <button
            onClick={() => onNavigate('company')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              currentView === 'company'
                ? 'bg-brand-50 text-brand font-semibold border border-brand-200'
                : 'text-secondary hover:text-primary hover:bg-page'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Profile
          </button>

          <button
            onClick={() => onNavigate('template')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
              currentView === 'template'
                ? 'bg-brand-50 text-brand font-semibold border border-brand-200'
                : 'text-secondary hover:text-primary hover:bg-page'
            }`}
          >
            <Settings className="w-4 h-4" />
            Template Settings
          </button>
        </nav>

        {/* Right: Autosave status & Create New Button */}
        <div className="flex items-center space-x-3">
          {autoSaveTime && currentView === 'builder' && (
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-secondary font-medium px-2 py-1 bg-page rounded-xs border border-line">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
              <span>Draft saved {autoSaveTime}</span>
            </div>
          )}

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-sm text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Document
          </button>
        </div>
      </div>
    </header>
  );
};

