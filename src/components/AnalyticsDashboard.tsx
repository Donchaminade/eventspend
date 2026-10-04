import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  PieChart,
  Users,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Layers,
  Sliders,
} from 'lucide-react';
import { EventItem, Expense } from '../types';
import {
  calculateCategoryBreakdown,
  calculateEventBudgetStatus,
  calculatePersonBreakdown,
  calculateSettlements,
  formatCurrency,
  getCategoryThresholdAlerts,
} from '../utils/calculations';
import { exportAllToCSV, exportEventToCSV, exportEventToPDF } from '../utils/exportUtils';
import { ThresholdAlertBanner } from './ThresholdAlertBanner';

interface AnalyticsDashboardProps {
  events: EventItem[];
  expenses: Expense[];
  selectedEventId: string | 'all';
  onSelectEventId: (id: string | 'all') => void;
  onOpenThresholdModal?: (eventId: string) => void;
  onTriggerMailAlert?: (alert: any) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  events,
  expenses,
  selectedEventId,
  onSelectEventId,
  onOpenThresholdModal,
  onTriggerMailAlert,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  const isAllEvents = selectedEventId === 'all';
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const filteredExpenses = isAllEvents
    ? expenses
    : expenses.filter((e) => e.eventId === selectedEventId);

  // Totals
  const totalBudget = isAllEvents
    ? events.reduce((acc, ev) => acc + (ev.totalBudget || 0), 0)
    : currentEvent?.totalBudget || 0;

  const totalSpent = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const currency = isAllEvents ? 'FCFA' : currentEvent?.currency || 'FCFA';

  const categoryBreakdown = calculateCategoryBreakdown(
    filteredExpenses,
    !isAllEvents && currentEvent ? currentEvent : undefined
  );

  const thresholdAlerts = !isAllEvents && currentEvent
    ? getCategoryThresholdAlerts(currentEvent, filteredExpenses)
    : [];

  const thresholdPercent = currentEvent?.categoryThresholdPercent ?? 80;

  const personBreakdown = !isAllEvents && currentEvent
    ? calculatePersonBreakdown(currentEvent, filteredExpenses)
    : [];

  const settlements = !isAllEvents && currentEvent
    ? calculateSettlements(currentEvent, filteredExpenses)
    : [];

  // SVG Donut Chart Calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const donutSlices = categoryBreakdown.map((item) => {
    const sliceAngle = (item.total / (totalSpent || 1)) * circumference;
    const strokeDasharray = `${sliceAngle} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += sliceAngle;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const handleExportPDF = () => {
    if (isAllEvents) {
      if (events.length > 0) {
        exportEventToPDF(events[0], expenses);
      }
    } else if (currentEvent) {
      exportEventToPDF(currentEvent, expenses);
    }
  };

  const handleExportCSV = () => {
    if (isAllEvents) {
      exportAllToCSV(events, expenses);
    } else if (currentEvent) {
      exportEventToCSV(currentEvent, expenses);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Top Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Périmètre d'analyse
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => onSelectEventId(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer pr-4"
            >
              <option value="all">📊 Synthèse globale (Tous les événements)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  🎯 {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action and Export Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {!isAllEvents && currentEvent && onOpenThresholdModal && (
            <button
              onClick={() => onOpenThresholdModal(currentEvent.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition cursor-pointer"
              title={`Configurer les seuils budgétaires (Actuel : ${thresholdPercent}%)`}
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Seuils ({thresholdPercent}%)</span>
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Exporter un rapport complet en PDF"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Exporter les données brutes en CSV (Excel)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Visual Threshold Alert Banner (If any category exceeded the 80% threshold) */}
      {!isAllEvents && currentEvent && thresholdAlerts.length > 0 && onOpenThresholdModal && (
        <ThresholdAlertBanner
          alerts={thresholdAlerts}
          event={currentEvent}
          onOpenThresholdModal={() => onOpenThresholdModal(currentEvent.id)}
          onTriggerMailAlert={onTriggerMailAlert}
        />
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Budget */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Budget Global
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalBudget, currency)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {isAllEvents ? `${events.length} événements cumulés` : 'Objectif alloué'}
          </span>
        </div>

        {/* Card 2: Dépensé */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Dépensé
          </span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">
            {formatCurrency(totalSpent, currency)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {filteredExpenses.length} transaction{filteredExpenses.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Card 3: Solde */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {remaining >= 0 ? 'Solde Restant' : 'Dépassement'}
          </span>
          <p
            className={`text-xl font-extrabold mt-1 ${
              remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {remaining >= 0 ? 'Disponible' : 'Budget dépassé'}
          </span>
        </div>

        {/* Card 4: Taux */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Consommation
          </span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {percentage.toFixed(1)}%
          </p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${
                percentage > 100
                  ? 'bg-rose-500'
                  : percentage > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown (Donut Chart & Category List) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Répartition par Catégorie &amp; Suivi des Seuils
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {categoryBreakdown.length} catégorie(s) actives
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center italic">
            Aucune dépense enregistrée sur ce périmètre.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Donut */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="20"
                  />
                  {donutSlices.map((slice, index) => (
                    <circle
                      key={index}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={slice.meta.color}
                      strokeWidth="20"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onClick={() =>
                        setActiveCategoryFilter(
                          activeCategoryFilter === slice.category ? null : slice.category
                        )
                      }
                    />
                  ))}
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Total
                  </span>
                  <span className="text-base font-extrabold text-slate-900 leading-tight">
                    {formatCurrency(totalSpent, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Cards / Progress Bars */}
            <div className="md:col-span-7 space-y-2.5">
              {categoryBreakdown.map((item) => {
                const isSelected = activeCategoryFilter === item.category;

                return (
                  <div
                    key={item.category}
                    onClick={() =>
                      setActiveCategoryFilter(isSelected ? null : item.category)
                    }
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      item.isExceeded
                        ? 'border-rose-300 bg-rose-50/40'
                        : item.isOverThreshold
                        ? 'border-amber-300 bg-amber-50/30'
                        : isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.meta.color }}
                        />
                        <span className="font-semibold text-slate-800 truncate">
                          {item.category}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({item.count})
                        </span>
                        {item.isOverThreshold && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                              item.isExceeded
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.isExceeded ? 'DÉPASSÉ' : `≥ ${item.thresholdPercent}%`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.total, currency)}
                        </span>
                        {item.allocatedBudget ? (
                          <span className="text-[11px] text-slate-500">
                            / {formatCurrency(item.allocatedBudget, currency)} (
                            <strong className={item.isOverThreshold ? 'text-amber-700 font-bold' : ''}>
                              {item.budgetPercentage?.toFixed(0)}%
                            </strong>
                            )
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 w-10 text-right">
                            {item.percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Gauge bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(item.budgetPercentage ?? item.percentage, 100)}%`,
                          backgroundColor: item.isExceeded
                            ? '#ef4444'
                            : item.isOverThreshold
                            ? '#f59e0b'
                            : item.meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Person Cost Breakdown & Settlement (Only for single event) */}
      {!isAllEvents && currentEvent && (
        <div className="space-y-6">
          {/* Person Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Répartition des Coûts par Personne
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Part égale : {formatCurrency(totalSpent / (currentEvent.participants.length || 1), currency)} / pers.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personBreakdown.map((person) => {
                const isCreditor = person.balance > 0.01;
                const isDebtor = person.balance < -0.01;
                const isBalanced = !isCreditor && !isDebtor;

                return (
                  <div
                    key={person.participantId}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-2xs"
                        style={{ backgroundColor: person.avatarColor }}
                      >
                        {person.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {person.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {person.expensesCount} dépense{person.expensesCount > 1 ? 's' : ''} payée{person.expensesCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {formatCurrency(person.paidAmount, currency)}
                      </p>
                      {isCreditor && (
                        <span className="text-[11px] font-bold text-emerald-600">
                          +{formatCurrency(person.balance, currency)} (Reçoit)
                        </span>
                      )}
                      {isDebtor && (
                        <span className="text-[11px] font-bold text-rose-600">
                          {formatCurrency(person.balance, currency)} (Doit)
                        </span>
                      )}
                      {isBalanced && (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Équilibré
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Debt Settlement Algorithm Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Règlement Simplifié des Comptes
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Virements optimisés
              </span>
            </div>

            {settlements.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Tous les comptes sont équilibrés ! Aucun remboursement en attente.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {settlements.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-medium"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-bold text-slate-800 truncate">{s.fromName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{s.toName}</span>
                    </div>
                    <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 ml-2">
                      {formatCurrency(s.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
