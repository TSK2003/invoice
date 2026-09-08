import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  Building2, 
  Palette, 
  Database, 
  LogOut, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';
import { LOGO_BASE64 } from '../../constants/imageAssets';
import { useAuth } from '../../app/providers/AuthProvider';
import { useCompany } from '../../app/providers/CompanyProvider';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/company', label: 'Company', icon: Building2 },
    { to: '/templates', label: 'Templates', icon: Palette },
    { to: '/settings/data', label: 'Data & Backup', icon: Database },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="no-print print:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between">
        
        {/* Left: AESCION Branding */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 cursor-pointer select-none focus:outline-hidden"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard')}
        >
          <img
            src={company.logoUrl || LOGO_BASE64}
            alt="AESCION Logo"
            className="h-8 sm:h-9 w-auto object-contain"
          />
          <div className="hidden sm:flex flex-col pl-3 border-l border-slate-200">
            <span className="text-xs font-black tracking-wider text-slate-900 uppercase leading-none">
              AESCION
            </span>
            <span className="text-[10px] font-semibold text-brand tracking-widest uppercase mt-0.5">
              Document Studio
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Actions & User Info */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <button
            type="button"
            onClick={() => navigate('/documents/new/quotation')}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Document</span>
            <span className="sm:hidden">New</span>
          </button>

          {user && (
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-50 text-brand flex items-center justify-center font-bold text-xs border border-brand-200">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-800 truncate max-w-[140px]">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out of session"
            className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
