import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  Image,
  Calendar,
  User,
  Trash2,
  Mail,
  CheckCircle2,
  Plus,
  MessageSquare,
  Edit3,
  History,
} from 'lucide-react';
import { AuditLogEntry, CategoryType, EventItem, Expense } from '../types';
import { ALL_CATEGORIES, CATEGORIES_CONFIG } from '../utils/categories';
import { formatCurrency } from '../utils/calculations';
import { EventAuditLogView } from './EventAuditLogView';

interface ExpenseListViewProps {
  events: EventItem[];
  expenses: Expense[];
  activeEventId: string | null;
  auditLogs?: AuditLogEntry[];
  onOpenNewExpense: (eventId?: string) => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onViewReceipt: (url: string, name: string, title: string, amount: string) => void;
}

export const ExpenseListView: React.FC<ExpenseListViewProps> = ({
  events,
  expenses,
  activeEventId,
  auditLogs = [],
  onOpenNewExpense,
  onEditExpense,
  onDeleteExpense,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>(activeEventId || 'all');
  const [viewSubTab, setViewSubTab] = useState<'expenses' | 'audit'>('expenses');

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedEventAuditLogs = auditLogs.filter((l) =>
    selectedEventId === 'all' ? true : l.eventId === selectedEventId
  );

  const filteredExpenses = expenses.filter((exp) => {
    // Event match
    if (selectedEventId !== 'all' && exp.eventId !== selectedEventId) {
      return false;
    }
    // Category match
    if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
      return false;
    }
    // Search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = exp.title.toLowerCase().includes(q);
      const matchPayer = exp.payerName.toLowerCase().includes(q);
      const matchNotes = (exp.notes || '').toLowerCase().includes(q);
      const matchComments = (exp.comments || '').toLowerCase().includes(q);
      if (!matchTitle && !matchPayer && !matchNotes && !matchComments) return false;
    }
    return true;
  });

  const totalFiltered = filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Top Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par libellé, payeur, commentaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Event Filter */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous les événements</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* View Sub-tabs (Transactions vs Journal d'Audit) */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setViewSubTab('expenses')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewSubTab === 'expenses'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transactions ({filteredExpenses.length})</span>
          </button>

          <button
            onClick={() => setViewSubTab('audit')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewSubTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Journal d'Audit ({selectedEventAuditLogs.length})</span>
          </button>
        </div>

        {/* Category Pills (Horizontal scrollable) - only for expenses tab */}
        {viewSubTab === 'expenses' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes ({expenses.length})
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const count = expenses.filter((e) => e.category === cat).length;
              if (count === 0) return null;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Render either Audit Tab or Expenses Tab */}
      {viewSubTab === 'audit' ? (
        <EventAuditLogView
          event={selectedEvent || events[0]}
          auditLogs={selectedEventId === 'all' ? auditLogs : selectedEventAuditLogs}
        />
      ) : (
        <>
          {/* Summary count bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
            <span>
              {filteredExpenses.length} transaction{filteredExpenses.length > 1 ? 's' : ''} trouvée{filteredExpenses.length > 1 ? 's' : ''}
            </span>
            <span>
              Sous-total : <strong className="text-slate-800 font-bold">{formatCurrency(totalFiltered, events.find(e => e.id === selectedEventId)?.currency || 'FCFA')}</strong>
            </span>
          </div>

          {/* Expense List */}
          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-3">
              <p className="text-xs text-slate-400">Aucune transaction ne correspond aux critères.</p>
              <button
                onClick={() => onOpenNewExpense(selectedEventId !== 'all' ? selectedEventId : undefined)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une dépense</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredExpenses.map((exp) => {
                const meta = CATEGORIES_CONFIG[exp.category] || CATEGORIES_CONFIG['Autre'];
                const ev = events.find((e) => e.id === exp.eventId);

                return (
                  <div
                    key={exp.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Category icon, Title, Event, Payer, Notes */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-2xs"
                        style={{ backgroundColor: meta.color }}
                      >
                        <span className="text-xs font-bold">{exp.category.slice(0, 2).toUpperCase()}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{exp.title}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-0.5 gap-x-2.5 text-xs text-slate-500 mt-1">
                          {ev && (
                            <span className="font-medium text-indigo-600">
                              {ev.title}
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {exp.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {exp.payerName}
                          </span>
                        </div>

                        {(exp.comments || exp.notes) && (
                          <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/70 rounded-lg px-2.5 py-1.5 max-w-xl">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              <strong className="text-slate-800 font-semibold">Commentaire : </strong>
                              {exp.comments || exp.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount, Receipt proof badge, Mail alert status, Edit, Delete */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 gap-1.5 flex-shrink-0">
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                        {formatCurrency(exp.amount, ev?.currency || 'FCFA')}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Receipt thumbnail button */}
                        {exp.receiptUrl ? (
                          <button
                            onClick={() =>
                              onViewReceipt(
                                exp.receiptUrl!,
                                exp.receiptName || 'justificatif',
                                exp.title,
                                formatCurrency(exp.amount, ev?.currency || 'FCFA')
                              )
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200 transition cursor-pointer"
                            title="Voir le justificatif"
                          >
                            <Image className="w-3 h-3" />
                            <span>Preuve</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sans justificatif</span>
                        )}

                        {/* Email notified badge */}
                        {exp.notifiedOrganizers && exp.notifiedOrganizers.length > 0 && (
                          <span
                            className="p-1 text-emerald-600"
                            title={`Organisateurs notifiés : ${exp.notifiedOrganizers.join(', ')}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {/* Edit Expense Button */}
                        {onEditExpense && (
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Modifier cette dépense (tracé dans l'audit)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete action */}
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Supprimer la transaction (tracé dans l'audit)"
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
        </>
      )}
    </div>
  );
};
