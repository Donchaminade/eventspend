import React from 'react';
import { AlertTriangle, AlertCircle, Mail, Sliders, ChevronRight } from 'lucide-react';
import { CategoryThresholdAlert, EventItem } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ThresholdAlertBannerProps {
  alerts: CategoryThresholdAlert[];
  event: EventItem;
  onOpenThresholdModal: () => void;
  onTriggerMailAlert?: (alert: CategoryThresholdAlert) => void;
}

export const ThresholdAlertBanner: React.FC<ThresholdAlertBannerProps> = ({
  alerts,
  event,
  onOpenThresholdModal,
  onTriggerMailAlert,
}) => {
  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter((a) => a.isExceeded).length;
  const warningCount = alerts.length - criticalCount;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border border-amber-300 dark:border-amber-700/50 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-sm">
                Alerte Seuil Budgétaire ({alerts.length} catégorie{alerts.length > 1 ? 's' : ''} ≥ {event.categoryThresholdPercent || 80}%)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Surveillance active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Certaines catégories approchent ou ont dépassé leur enveloppe allouée. Les organisateurs reçoivent automatiquement une alerte.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenThresholdModal}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex-shrink-0 cursor-pointer"
          title="Modifier les seuils et budgets"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Ajuster les seuils</span>
        </button>
      </div>

      {/* Pill items for each triggered category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {alerts.map((alert) => (
          <div
            key={alert.category}
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
              alert.isExceeded
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-white/90 border-amber-200 text-amber-950'
            }`}
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 font-bold">
                {alert.isExceeded ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                )}
                <span className="truncate">{alert.category}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formatCurrency(alert.spent, event.currency)} / {formatCurrency(alert.allocatedBudget, event.currency)}
                {' • '}
                <span className={alert.isExceeded ? 'text-rose-600 font-bold' : 'text-amber-700 font-bold'}>
                  {alert.percentage.toFixed(0)}%
                </span>
              </p>
            </div>

            {onTriggerMailAlert && (
              <button
                onClick={() => onTriggerMailAlert(alert)}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition flex-shrink-0"
                title="Alerter immédiatement les organisateurs par mail"
              >
                <Mail className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
