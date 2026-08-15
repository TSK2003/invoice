import React from 'react';
import { PlusCircle, LayoutDashboard, Settings, Building2, FileText, CheckCircle2 } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-navy text-white shadow-md border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Official AESCION Logo Branding without inverted color filters */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="bg-white px-2.5 py-1 rounded-lg flex items-center justify-center shadow-xs">
            <img
              src={LOGO_BASE64}
              alt="AESCION Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block border-l border-navy-700 pl-3">
            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-cyan-400/30">
              DOCUMENT STUDIO
            </span>
            <p className="text-[10px] text-slate-300 tracking-wide mt-0.5">Enterprise Quotations & Invoicing</p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-navy-900/80 p-1 rounded-xl border border-navy-700">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-blue-brand text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => onNavigate('builder')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'builder'
                ? 'bg-blue-brand text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Document Builder
          </button>

          <button
            onClick={() => onNavigate('company')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'company'
                ? 'bg-blue-brand text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Profile
          </button>

          <button
            onClick={() => onNavigate('template')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'template'
                ? 'bg-blue-brand text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            Template Settings
          </button>
        </nav>

        {/* Right: Autosave status & Create New Button */}
        <div className="flex items-center space-x-3">
          {autoSaveTime && currentView === 'builder' && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Draft saved ({autoSaveTime})</span>
            </div>
          )}

          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-orange-brand hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create Document
          </button>
        </div>
      </div>
    </header>
  );
};
