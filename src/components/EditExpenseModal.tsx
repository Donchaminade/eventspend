import React, { useState } from 'react';
import {
  X,
  Check,
  DollarSign,
  Calendar,
  User,
  Tag,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { AuditFieldDiff, CategoryType, EventItem, Expense } from '../types';
import { ALL_CATEGORIES, CATEGORIES_CONFIG } from '../utils/categories';
import { formatCurrency } from '../utils/calculations';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  event: EventItem;
  onSaveExpense: (
    updatedExpense: Expense,
    editorName: string,
    diffs: AuditFieldDiff[],
    details: string
  ) => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  event,
  onSaveExpense,
}) => {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState<CategoryType>(expense.category);
  const [payerId, setPayerId] = useState(expense.payerId);
  const [date, setDate] = useState(expense.date);
  const [comments, setComments] = useState(expense.comments || expense.notes || '');
  const [editorName, setEditorName] = useState(
    event.organizers[0]?.name || event.participants[0]?.name || 'Organisateur'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0.');
      return;
    }

    if (!title.trim()) {
      setError('Veuillez renseigner un intitulé pour la dépense.');
      return;
    }

    const payer = event.participants.find((p) => p.id === payerId) || {
      name: expense.payerName,
    };

    // Calculate diffs for audit trail
    const diffs: AuditFieldDiff[] = [];
    const changesSummary: string[] = [];

    if (title.trim() !== expense.title) {
      diffs.push({
        field: 'title',
        label: 'Intitulé',
        oldValue: expense.title,
        newValue: title.trim(),
      });
      changesSummary.push(`Intitulé renommé de "${expense.title}" en "${title.trim()}"`);
    }

    if (parsedAmount !== expense.amount) {
      diffs.push({
        field: 'amount',
        label: 'Montant',
        oldValue: formatCurrency(expense.amount, event.currency),
        newValue: formatCurrency(parsedAmount, event.currency),
      });
      changesSummary.push(
        `Montant révisé de ${formatCurrency(expense.amount, event.currency)} à ${formatCurrency(
          parsedAmount,
          event.currency
        )}`
      );
    }

    if (category !== expense.category) {
      diffs.push({
        field: 'category',
        label: 'Catégorie',
        oldValue: expense.category,
        newValue: category,
      });
      changesSummary.push(`Catégorie changée de "${expense.category}" à "${category}"`);
    }

    if (payer.name !== expense.payerName) {
      diffs.push({
        field: 'payerName',
        label: 'Payé par',
        oldValue: expense.payerName,
        newValue: payer.name,
      });
      changesSummary.push(`Payeur modifié : ${expense.payerName} → ${payer.name}`);
    }

    if (date !== expense.date) {
      diffs.push({
        field: 'date',
        label: 'Date',
        oldValue: expense.date,
        newValue: date,
      });
      changesSummary.push(`Date de transaction modifiée (${expense.date} → ${date})`);
    }

    const trimmedComments = comments.trim();
    const oldComments = (expense.comments || expense.notes || '').trim();
    if (trimmedComments !== oldComments) {
      diffs.push({
        field: 'comments',
        label: 'Commentaires',
        oldValue: oldComments || 'Aucun',
        newValue: trimmedComments || 'Aucun',
      });
      changesSummary.push('Commentaires / contexte mis à jour');
    }

    const updatedExpense: Expense = {
      ...expense,
      title: title.trim(),
      amount: parsedAmount,
      category,
      payerId,
      payerName: payer.name,
      date,
      comments: trimmedComments || undefined,
      notes: trimmedComments || undefined,
    };

    const details =
      changesSummary.length > 0
        ? changesSummary.join(' • ')
        : 'Modification enregistrée sans changement de valeur.';

    onSaveExpense(updatedExpense, editorName, diffs, details);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Modifier la Dépense
              </h3>
              <p className="text-xs text-slate-500">
                Toute modification sera automatiquement tracée dans le Journal d'Audit
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Editor identity selector */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
              Auteur de la modification (Audit) *
            </label>
            <select
              value={editorName}
              onChange={(e) => setEditorName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              {event.organizers.map((o) => (
                <option key={o.id} value={o.name}>
                  👑 {o.name} ({o.role || 'Organisateur'})
                </option>
              ))}
              {event.participants.map((p) => (
                <option key={p.id} value={p.name}>
                  👤 {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Intitulé / Libellé *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Montant *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-xs font-bold">
                {event.currency}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Catégorie *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const meta = CATEGORIES_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payer and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Payé par *
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {event.participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Date de transaction *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Commentaires (contexte)
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Précisez la raison ou le contexte de cette modification..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer et tracer dans l'audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
