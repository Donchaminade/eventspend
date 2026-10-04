import React from 'react';
import { Plus, Mail, Sparkles, Calendar, Layers } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface NavbarProps {
  onOpenNewExpense: () => void;
  onOpenNewEvent: () => void;
  notificationCount: number;
  onNavigateToNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewExpense,
  onOpenNewEvent,
  notificationCount,
  onNavigateToNotifications,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
      <OfflineIndicator />
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
            <span className="font-extrabold text-sm tracking-tight">ES</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                EventSpend
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-block">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden xs:block">
              Suivi budgétaire en temps réel
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button (renders if installable or iOS) */}
          <PWAInstallButton />

          {/* New Event Button (desktop) */}
          <button
            onClick={onOpenNewEvent}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>+ Événement</span>
          </button>

          {/* Mail Notifications Icon */}
          <button
            onClick={onNavigateToNotifications}
            className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition"
            title="Consulter les alertes mails"
          >
            <Mail className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {/* Primary Quick Expense Button */}
          <button
            onClick={onOpenNewExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dépense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
