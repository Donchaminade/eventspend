import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Plus,
  BarChart3,
  Receipt,
  History,
  Sliders,
  Wallet,
  FileSpreadsheet,
  FileText,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import {
  AuditFieldDiff,
  AuditLogEntry,
  EventItem,
  Expense,
} from '../types';
import {
  calculateCategoryBreakdown,
  calculateEventBudgetStatus,
  calculatePersonBreakdown,
  calculateSettlements,
  formatCurrency,
  getCategoryThresholdAlerts,
} from '../utils/calculations';
import { exportEventToCSV, exportEventToPDF } from '../utils/exportUtils';
import { CATEGORIES_CONFIG } from '../utils/categories';
import { EventAuditLogView } from './EventAuditLogView';
import { ThresholdAlertBanner } from './ThresholdAlertBanner';

export type EventDetailTab = 'expenses' | 'budget' | 'audit' | 'settlement';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  expenses: Expense[];
  auditLogs: AuditLogEntry[];
  initialTab?: EventDetailTab;
  onOpenNewExpense: (eventId: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string, expense: Expense) => void;
  onOpenThresholdModal: (eventId: string) => void;
  onViewReceipt: (url: string, name: string, title: string, amount: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  expenses,
  auditLogs,
  initialTab = 'expenses',
  onOpenNewExpense,
  onEditExpense,
  onDeleteExpense,
  onOpenThresholdModal,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<EventDetailTab>(initialTab);
  const [expenseSearch, setExpenseSearch] = useState('');

  if (!isOpen) return null;

  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const budgetStatus = calculateEventBudgetStatus(event, eventExpenses);
  const thresholdAlerts = getCategoryThresholdAlerts(event, eventExpenses);
  const thresholdPercent = event.categoryThresholdPercent ?? 80;
  const categoryBreakdown = calculateCategoryBreakdown(eventExpenses, event);
  const settlements = calculateSettlements(event, eventExpenses);
  const personBreakdown = calculatePersonBreakdown(event, eventExpenses);
  const eventAuditLogs = auditLogs.filter((log) => log.eventId === event.id);

  // Filtered expenses for search
  const filteredEventExpenses = eventExpenses.filter((exp) => {
    if (!expenseSearch.trim()) return true;
    const q = expenseSearch.toLowerCase();
    return (
      exp.title.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q) ||
      exp.payerName.toLowerCase().includes(q) ||
      (exp.comments && exp.comments.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                  {event.category}
                </span>
                {thresholdAlerts.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow-2xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{thresholdAlerts.length} alerte(s) seuil ≥ {thresholdPercent}%</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                {event.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-indigo-200 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                  {event.startDate} - {event.endDate}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    {event.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-300" />
                  {event.participants.length} participants
                </span>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => exportEventToPDF(event, eventExpenses)}
                className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Exporter PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => exportEventToCSV(event, eventExpenses)}
                className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Exporter CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Realtime Balance Ribbon */}
          <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                Budget Prévu
              </span>
              <strong className="text-sm sm:text-base font-extrabold text-white">
                {formatCurrency(event.totalBudget, event.currency)}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                Total Engagé
              </span>
              <strong className="text-sm sm:text-base font-extrabold text-amber-300">
                {formatCurrency(budgetStatus.totalSpent, event.currency)}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                Solde Disponible
              </span>
              <strong
                className={`text-sm sm:text-base font-extrabold ${
                  budgetStatus.remaining < 0 ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {formatCurrency(budgetStatus.remaining, event.currency)}
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                Consommation
              </span>
              <strong className="text-sm sm:text-base font-extrabold text-white">
                {budgetStatus.percentage.toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="px-5 border-b border-slate-200 bg-white flex items-center justify-between overflow-x-auto no-scrollbar flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'expenses'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Dépenses ({eventExpenses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'budget'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Budgets &amp; Seuils</span>
              {thresholdAlerts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            {/* TAB 3: LE NOUVEL ONGLET DEMANDÉ */}
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Journal d'Audit</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold ml-0.5">
                {eventAuditLogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settlement')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'settlement'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Comptes ({event.participants.length})</span>
            </button>
          </div>

          <button
            onClick={() => onOpenNewExpense(event.id)}
            className="my-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Transaction</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: DÉPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {/* Search bar inside event */}
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Filtrer les dépenses de cet événement..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 font-medium">
                  {filteredEventExpenses.length} dépense{filteredEventExpenses.length > 1 ? 's' : ''}
                </span>
              </div>

              {filteredEventExpenses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-700">Aucune dépense trouvée</p>
                  <button
                    onClick={() => onOpenNewExpense(event.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une dépense</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredEventExpenses.map((exp) => {
                    const meta = CATEGORIES_CONFIG[exp.category] || CATEGORIES_CONFIG['Autre'];
                    return (
                      <div
                        key={exp.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: meta.color }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                                {exp.title}
                              </h4>
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {exp.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {exp.date} • Payé par <strong>{exp.payerName}</strong>
                            </p>
                            {(exp.comments || exp.notes) && (
                              <div className="flex items-start gap-1.5 mt-1 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg">
                                <MessageSquare className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <span>{exp.comments || exp.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount & Action Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            {formatCurrency(exp.amount, event.currency)}
                          </span>

                          <div className="flex items-center gap-1">
                            {exp.receiptUrl && (
                              <button
                                onClick={() =>
                                  onViewReceipt(
                                    exp.receiptUrl!,
                                    exp.receiptName || 'Reçu',
                                    exp.title,
                                    formatCurrency(exp.amount, event.currency)
                                  )
                                }
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Voir le justificatif"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit Expense Button */}
                            <button
                              onClick={() => onEditExpense(exp)}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              title="Modifier cette transaction (tracé dans l'audit)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Expense Button */}
                            <button
                              onClick={() => onDeleteExpense(exp.id, exp)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Supprimer cette transaction (tracé dans l'audit)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BUDGETS & SEUILS */}
          {activeTab === 'budget' && (
            <div className="space-y-5">
              {/* Threshold Banner */}
              {thresholdAlerts.length > 0 && (
                <ThresholdAlertBanner
                  alerts={thresholdAlerts}
                  event={event}
                  onOpenThresholdModal={() => onOpenThresholdModal(event.id)}
                />
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Enveloppes Budgétaires par Catégorie</h3>
                  <p className="text-xs text-slate-500">Seuil de vigilance configuré à {thresholdPercent}%</p>
                </div>
                <button
                  onClick={() => onOpenThresholdModal(event.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ajuster les seuils</span>
                </button>
              </div>

              <div className="space-y-3">
                {categoryBreakdown.map((item) => (
                  <div key={item.category} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.meta.color }} />
                        <span className="font-bold text-slate-900">{item.category}</span>
                        {item.isOverThreshold && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                              item.isExceeded ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.isExceeded ? 'DÉPASSÉ' : `SEUIL ${item.thresholdPercent}% ATTEINT`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.total, event.currency)}
                        </span>
                        {item.allocatedBudget ? (
                          <span className="text-[11px] text-slate-400">
                            / {formatCurrency(item.allocatedBudget, event.currency)} ({item.budgetPercentage?.toFixed(0)}%)
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: JOURNAL D'AUDIT (DEMANDÉ PAR L'UTILISATEUR) */}
          {activeTab === 'audit' && (
            <EventAuditLogView event={event} auditLogs={auditLogs} />
          )}

          {/* TAB 4: COMPTES & PARTICIPANTS */}
          {activeTab === 'settlement' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personBreakdown.map((person) => (
                  <div
                    key={person.participantId}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: person.avatarColor }}
                      >
                        {person.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{person.name}</p>
                        <p className="text-[11px] text-slate-500">{person.expensesCount} transaction(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-xs">
                        {formatCurrency(person.paidAmount, event.currency)}
                      </p>
                      <span
                        className={`text-[11px] font-bold ${
                          person.balance > 0
                            ? 'text-emerald-600'
                            : person.balance < 0
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {person.balance > 0
                          ? `+${formatCurrency(person.balance, event.currency)}`
                          : person.balance < 0
                          ? `${formatCurrency(person.balance, event.currency)}`
                          : 'Équilibré'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Settlement Suggestions */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Virements d'équilibre optimisés
                </h4>
                {settlements.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Tous les comptes sont équilibrés !
                  </p>
                ) : (
                  <div className="space-y-2">
                    {settlements.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="font-medium text-slate-700">
                          <strong>{s.fromName}</strong> doit rembourser à <strong>{s.toName}</strong>
                        </div>
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {formatCurrency(s.amount, event.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
