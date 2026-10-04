import React, { useState } from 'react';
import {
  X,
  Sliders,
  AlertTriangle,
  Check,
  Percent,
  TrendingUp,
  DollarSign,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { CategoryType, EventItem, Expense } from '../types';
import { ALL_CATEGORIES, CATEGORIES_CONFIG } from '../utils/categories';
import {
  formatCurrency,
  getCategoryAllocatedBudget,
  getCategoryThresholdAlerts,
} from '../utils/calculations';

interface CategoryThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  expenses: Expense[];
  onSave: (updatedEvent: EventItem) => void;
}

export const CategoryThresholdModal: React.FC<CategoryThresholdModalProps> = ({
  isOpen,
  onClose,
  event,
  expenses,
  onSave,
}) => {
  const [thresholdPercent, setThresholdPercent] = useState<number>(
    event.categoryThresholdPercent ?? 80
  );

  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const cat of ALL_CATEGORIES) {
      map[cat] = getCategoryAllocatedBudget(event, cat);
    }
    return map;
  });

  if (!isOpen) return null;

  const eventExpenses = expenses.filter((e) => e.eventId === event.id);

  // Compute total of allocated category budgets
  const sumAllocated = Object.values(categoryBudgets).reduce((acc, curr) => acc + (curr || 0), 0);
  const diffFromTotalBudget = event.totalBudget - sumAllocated;

  const handleBudgetChange = (cat: CategoryType, val: string) => {
    const num = parseFloat(val);
    setCategoryBudgets((prev) => ({
      ...prev,
      [cat]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const handleResetToProportional = () => {
    const map: Record<string, number> = {};
    const defaultWeights: Record<CategoryType, number> = {
      'Restauration & Boissons': 0.30,
      'Lieu & Salle': 0.25,
      'Technique & Matériel': 0.15,
      'Hébergement': 0.10,
      'Activités & Divertissement': 0.08,
      'Décoration & Fleurs': 0.05,
      'Communication & Print': 0.04,
      'Transport & Logistique': 0.03,
      'Autre': 0.05,
    };
    for (const cat of ALL_CATEGORIES) {
      map[cat] = Math.round(event.totalBudget * (defaultWeights[cat] || 0.05));
    }
    setCategoryBudgets(map);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EventItem = {
      ...event,
      categoryThresholdPercent: thresholdPercent,
      categoryBudgets: categoryBudgets as Partial<Record<CategoryType, number>>,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Seuils &amp; Budgets par Catégorie
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {event.title} • Déclenchement d'alertes visuelles et mails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* Threshold Percentage Slider */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                  Seuil d'alerte critique
                </label>
                <p className="text-[11px] text-amber-800">
                  Déclenche une notification par e-mail aux organisateurs dès qu'une catégorie atteint ce pourcentage.
                </p>
              </div>
              <span className="text-lg font-black text-amber-900 px-3 py-1 rounded-xl bg-white border border-amber-200 shadow-2xs">
                {thresholdPercent} %
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-amber-800">50%</span>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={thresholdPercent}
                onChange={(e) => setThresholdPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-xs font-bold text-amber-800">95%</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-medium pt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>
                Recommandation standard : <strong>80%</strong> pour anticiper les dépassements avant la fin de l'événement.
              </span>
            </div>
          </div>

          {/* Allocation summary banner */}
          <div className="flex items-center justify-between text-xs px-1">
            <div>
              <span className="text-slate-500 font-medium">Budget global de l'événement : </span>
              <strong className="text-slate-900 font-bold">{formatCurrency(event.totalBudget, event.currency)}</strong>
            </div>
            <button
              type="button"
              onClick={handleResetToProportional}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser par défaut</span>
            </button>
          </div>

          {/* Category Budgets Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Allocation budgétaire personnalisée par catégorie
            </label>

            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORIES_CONFIG[cat];
              const allocated = categoryBudgets[cat] || 0;
              const spent = eventExpenses
                .filter((e) => e.category === cat)
                .reduce((sum, e) => sum + e.amount, 0);

              const percentUsed = allocated > 0 ? (spent / allocated) * 100 : spent > 0 ? 100 : 0;
              const isOverThreshold = percentUsed >= thresholdPercent;
              const isExceeded = percentUsed >= 100;

              return (
                <div
                  key={cat}
                  className={`p-3 rounded-xl border transition ${
                    isExceeded
                      ? 'border-rose-300 bg-rose-50/50'
                      : isOverThreshold
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Category Title & Status */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{cat}</p>
                        <p className="text-[11px] text-slate-500">
                          Engagé : <strong>{formatCurrency(spent, event.currency)}</strong>
                          {allocated > 0 && (
                            <span> ({percentUsed.toFixed(0)}% consommé)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Input for allocated budget */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isOverThreshold && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isExceeded
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isExceeded ? 'DÉPASSÉ !' : `SEUIL ${thresholdPercent}% ATTEINT`}
                        </span>
                      )}

                      <div className="relative w-32">
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={allocated}
                          onChange={(e) => handleBudgetChange(cat, e.target.value)}
                          className="w-full pr-7 pl-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">
                          {event.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual gauge bar */}
                  {allocated > 0 && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isOverThreshold
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Allocation balance warning if sum != totalBudget */}
          {Math.abs(diffFromTotalBudget) > 1 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Somme des catégories : <strong>{formatCurrency(sumAllocated, event.currency)}</strong></span>
              <span className={diffFromTotalBudget > 0 ? 'text-indigo-600 font-bold' : 'text-amber-600 font-bold'}>
                {diffFromTotalBudget > 0
                  ? `+${formatCurrency(diffFromTotalBudget, event.currency)} non alloués`
                  : `${formatCurrency(diffFromTotalBudget, event.currency)} au-delà du budget initial`}
              </span>
            </div>
          )}

          {/* Save button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les seuils et budgets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
