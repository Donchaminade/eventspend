import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  BarChart3,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Mail,
  ChevronRight,
  Sliders,
  History,
} from 'lucide-react';
import { EventItem, Expense } from '../types';
import { calculateEventBudgetStatus, formatCurrency, getCategoryThresholdAlerts } from '../utils/calculations';
import { exportEventToCSV, exportEventToPDF } from '../utils/exportUtils';

interface EventCardProps {
  event: EventItem;
  expenses: Expense[];
  onSelectEvent: (eventId: string) => void;
  onOpenNewExpense: (eventId: string) => void;
  onOpenAnalytics: (eventId: string) => void;
  onOpenThresholdModal?: (eventId: string) => void;
  onOpenAudit?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  expenses,
  onSelectEvent,
  onOpenNewExpense,
  onOpenAnalytics,
  onOpenThresholdModal,
  onOpenAudit,
}) => {
  const budgetStatus = calculateEventBudgetStatus(event, expenses);
  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const thresholdAlerts = getCategoryThresholdAlerts(event, expenses);
  const thresholdPercent = event.categoryThresholdPercent ?? 80;

  // Health color classes
  let barColor = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let StatusIcon = CheckCircle2;

  if (budgetStatus.isOverBudget) {
    barColor = 'bg-rose-500';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
    StatusIcon = AlertCircle;
  } else if (budgetStatus.isWarning) {
    barColor = 'bg-amber-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    StatusIcon = AlertTriangle;
  }

  const cappedPercentage = Math.min(budgetStatus.percentage, 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-4 sm:p-5 relative flex flex-col justify-between group">
      <div>
        {/* Top row: Category, Status badge & Quick export */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {event.category}
          </span>

          <div className="flex items-center gap-1.5">
            {thresholdAlerts.length > 0 && (
              <span
                onClick={() => onOpenThresholdModal?.(event.id)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer hover:bg-amber-100 transition animate-pulse"
                title={`${thresholdAlerts.length} catégorie(s) dépassent le seuil de ${thresholdPercent}%`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>{thresholdAlerts.length} seuil{thresholdAlerts.length > 1 ? 's' : ''} ≥ {thresholdPercent}%</span>
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeBg}`}
            >
              <StatusIcon className="w-3 h-3" />
              <span>{budgetStatus.percentage.toFixed(0)}%</span>
            </span>

            {/* Quick Export Menu Buttons */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exportEventToPDF(event, expenses);
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Exporter le rapport PDF"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exportEventToCSV(event, expenses);
                }}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Exporter le fichier CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelectEvent(event.id)}
          className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition cursor-pointer"
        >
          {event.title}
        </h3>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5 font-medium">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              {' - '}
              {new Date(event.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[140px]">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{event.participants.length} participants</span>
          </div>
        </div>

        {/* Real-time Budget Balance Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Dépensé en direct
              </span>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(budgetStatus.totalSpent, event.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Budget Prévu
              </span>
              <span className="text-xs font-bold text-slate-600">
                {formatCurrency(event.totalBudget, event.currency)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${cappedPercentage}%` }}
            />
          </div>

          {/* Status subtext */}
          <div className="flex items-center justify-between text-[11px] font-semibold mt-2">
            <span
              className={
                budgetStatus.isOverBudget
                  ? 'text-rose-600'
                  : budgetStatus.isWarning
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }
            >
              {budgetStatus.statusText}
            </span>
            <span className="text-slate-500">
              {eventExpenses.length} dépense{eventExpenses.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Organizers notification badge */}
        {event.organizers.length > 0 && (
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-indigo-500" />
              <span>
                Alertes mail :{' '}
                <strong className="text-slate-700 font-semibold">
                  {event.organizers.filter((o) => o.notifyOnExpense).length} organisateur(s)
                </strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Seuil : {thresholdPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onOpenNewExpense(event.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Transaction</span>
        </button>

        {onOpenThresholdModal && (
          <button
            onClick={() => onOpenThresholdModal(event.id)}
            className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title={`Configurer les seuils budgétaires (${thresholdPercent}%)`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seuils</span>
          </button>
        )}

        <button
          onClick={() => onOpenAnalytics(event.id)}
          className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition cursor-pointer"
          title="Consulter les graphiques et le tableau de bord"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Analytique</span>
        </button>

        {onOpenAudit && (
          <button
            onClick={() => onOpenAudit(event.id)}
            className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Consulter le journal d'audit de cet événement"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audit</span>
          </button>
        )}

        <button
          onClick={() => onSelectEvent(event.id)}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Voir la vue détail et dépenses"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
