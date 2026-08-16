import React, { useState } from 'react';
import { Plus, LayoutDashboard, Settings, Building2, FileText, CheckCircle2, LogOut, Menu, X } from 'lucide-react';
import { LOGO_BASE64 } from '../../constants/imageAssets';

interface HeaderProps {
  currentView: 'dashboard' | 'builder' | 'company' | 'template';
  onNavigate: (view: 'dashboard' | 'builder' | 'company' | 'template') => void;
  onCreateNew: () => void;
  onLogout?: () => void;
  autoSaveTime?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onCreateNew,
  onLogout,
  autoSaveTime,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'dashboard' | 'builder' | 'company' | 'template') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder' as const, label: 'Document Builder', icon: FileText },
    { id: 'company' as const, label: 'Company Profile', icon: Building2 },
    { id: 'template' as const, label: 'Template Settings', icon: Settings },
  ];

  return (
    <header className="no-print print:hidden sticky top-0 z-40 bg-surface border-b border-line shadow-subtle">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Left: AESCION Branding */}
        <div
          className="flex items-center space-x-3.5 cursor-pointer select-none"
          onClick={() => handleNavClick('dashboard')}
        >
          <img
            src={LOGO_BASE64}
            alt="AESCION Logo"
            className="h-9 sm:h-10 w-auto object-contain"
          />
          <div className="hidden sm:flex items-center pl-3.5 border-l-2 border-line">
            <span className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase">
              Document Studio
            </span>
          </div>
        </div>

        {/* Center: Clean Enterprise Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand text-white font-semibold shadow-subtle'
                    : 'text-secondary hover:text-primary hover:bg-page'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Autosave status & Create New Button & Logout & Mobile Toggle */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {autoSaveTime && currentView === 'builder' && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-secondary font-medium px-2.5 py-1.5 bg-page rounded-xs border border-line">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
              <span>Draft saved {autoSaveTime}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onCreateNew();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-600 text-white px-3.5 sm:px-4 py-2 rounded-sm text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Document</span>
            <span className="sm:hidden">New</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Log out of session"
              className="flex items-center gap-1.5 text-secondary hover:text-primary hover:bg-page border border-line px-2.5 sm:px-3 py-2 rounded-sm text-xs font-medium transition-colors shadow-subtle"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-sm border border-line text-secondary hover:text-primary hover:bg-page transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-line px-4 py-3 space-y-1.5 shadow-subtle">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white font-semibold shadow-subtle'
                    : 'text-secondary hover:text-primary hover:bg-page'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};




