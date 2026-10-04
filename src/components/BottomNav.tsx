import React from 'react';
import { Calendar, BarChart3, Receipt, Mail, Plus } from 'lucide-react';

export type NavTab = 'events' | 'analytics' | 'expenses' | 'notifications';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewExpense: () => void;
  notificationCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenNewExpense,
  notificationCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 sm:hidden shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Événements */}
        <button
          onClick={() => onTabChange('events')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'events'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Événements</span>
        </button>

        {/* Tab 2: Analytique */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'analytics'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Analytique</span>
        </button>

        {/* Floating Quick Action */}
        <button
          onClick={onOpenNewExpense}
          className="-mt-5 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 active:scale-95 transition"
          title="Ajouter une dépense"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Tab 3: Dépenses */}
        <button
          onClick={() => onTabChange('expenses')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
            activeTab === 'expenses'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Dépenses</span>
        </button>

        {/* Tab 4: Notifications */}
        <button
          onClick={() => onTabChange('notifications')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition relative ${
            activeTab === 'notifications'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Mail className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Alertes</span>
          {notificationCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          )}
        </button>
      </div>
    </div>
  );
};
