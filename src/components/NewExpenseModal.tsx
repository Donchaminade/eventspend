import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Calendar,
  User,
  DollarSign,
  FileText,
  Trash2,
  Check,
  Mail,
  Receipt,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { CategoryType, EventItem, Expense, Participant } from '../types';
import { ALL_CATEGORIES, CATEGORIES_CONFIG } from '../utils/categories';
import { formatCurrency, getCategoryAllocatedBudget } from '../utils/calculations';
import confetti from 'canvas-confetti';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  expenses?: Expense[];
  activeEventId: string | null;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>, notify: boolean) => void;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  events,
  expenses = [],
  activeEventId,
  onAddExpense,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(activeEventId || (events[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Restauration & Boissons');
  const [payerId, setPayerId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [receiptName, setReceiptName] = useState<string | undefined>(undefined);
  const [comments, setComments] = useState('');
  const [notifyOrganizers, setNotifyOrganizers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selected event participants
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const participants = currentEvent?.participants || [];

  // Real-time threshold calculation for selected category
  const enteredAmount = parseFloat(amount.replace(',', '.')) || 0;
  const currentCategoryBudget = currentEvent ? getCategoryAllocatedBudget(currentEvent, category) : 0;
  const currentCategorySpent = expenses
    .filter((e) => e.eventId === currentEvent?.id && e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);

  const projectedSpent = currentCategorySpent + enteredAmount;
  const projectedPercentage = currentCategoryBudget > 0 ? (projectedSpent / currentCategoryBudget) * 100 : 0;
  const thresholdPercent = currentEvent?.categoryThresholdPercent ?? 80;
  const willTriggerThreshold = projectedPercentage >= thresholdPercent && enteredAmount > 0;
  const willExceedBudget = projectedPercentage >= 100 && enteredAmount > 0;

  // Default payer if not set
  React.useEffect(() => {
    if (participants.length > 0 && !payerId) {
      setPayerId(participants[0].id);
    }
  }, [participants, payerId]);

  // Keep event synced if activeEventId changes
  React.useEffect(() => {
    if (activeEventId) {
      setSelectedEventId(activeEventId);
    }
  }, [activeEventId]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Le justificatif ne doit pas dépasser 8 Mo.');
      return;
    }

    setReceiptName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl(undefined);
    setReceiptName(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez renseigner un montant valide supérieur à 0.');
      return;
    }

    if (!title.trim()) {
      setError('Veuillez indiquer un intitulé pour la dépense.');
      return;
    }

    if (!selectedEventId) {
      setError('Veuillez sélectionner un événement.');
      return;
    }

    const payer = participants.find((p) => p.id === payerId) || {
      name: 'Non précisé',
    };

    onAddExpense(
      {
        eventId: selectedEventId,
        title: title.trim(),
        amount: parsedAmount,
        category,
        payerId: payerId || 'default',
        payerName: payer.name,
        beneficiaryIds: ['all'],
        date,
        receiptUrl,
        receiptName,
        comments: comments.trim() || undefined,
        notes: comments.trim() || undefined,
      },
      notifyOrganizers
    );

    // Minor confetti celebration on success
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    // Reset form
    setTitle('');
    setAmount('');
    setComments('');
    setReceiptUrl(undefined);
    setReceiptName(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Handle for Mobile */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Nouvelle Dépense
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Enregistrement &amp; notification en temps réel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Event Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Événement concerné *
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                const ev = events.find((item) => item.id === e.target.value);
                if (ev?.participants.length) {
                  setPayerId(ev.participants[0].id);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-2xs"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} (Budget : {ev.totalBudget} {ev.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Currency */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Montant de la dépense *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 50 000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-4 pr-20 py-3 rounded-xl border border-slate-200 bg-white text-2xl font-bold text-slate-900 tracking-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold text-xs">
                {currentEvent?.currency || 'FCFA'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Intitulé / Description *
            </label>
            <input
              type="text"
              placeholder="Ex: Acompte traiteur, Décoration florale, Location sono..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-2xs"
            />
          </div>

          {/* Category Selector (Visual Chips) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Catégorie de dépense *
              </label>
              {currentCategoryBudget > 0 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Enveloppe : <strong>{formatCurrency(currentCategoryBudget, currentEvent?.currency)}</strong>
                </span>
              )}
            </div>

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
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-1 ring-indigo-600 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Real-time category threshold trigger alert */}
            {willTriggerThreshold && currentEvent && (
              <div
                className={`mt-2.5 p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-fadeIn ${
                  willExceedBudget
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    willExceedBudget ? 'text-rose-600' : 'text-amber-600'
                  }`}
                />
                <div>
                  <p className="font-bold">
                    {willExceedBudget
                      ? `Attention : Dépassement budgétaire sur "${category}" !`
                      : `Alerte Seuil : Seuil de ${thresholdPercent}% atteint sur "${category}"`}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-snug">
                    Total après cette dépense : <strong>{formatCurrency(projectedSpent, currentEvent.currency)}</strong> sur{' '}
                    <strong>{formatCurrency(currentCategoryBudget, currentEvent.currency)}</strong> alloués ({projectedPercentage.toFixed(0)}%).
                    {notifyOrganizers && (
                      <span className="block mt-0.5 font-semibold text-indigo-700">
                        → Une alerte prioritaire par e-mail sera expédiée aux organisateurs.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payer and Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Payé par *
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Date de transaction *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Receipt / Justificatif Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Justificatif / Preuve de dépense (Photo ou PDF)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />

            {!receiptUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 transition group"
              >
                <div className="flex justify-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Prendre une photo ou importer un reçu
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, PDF jusqu'à 8 Mo
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  {receiptUrl.startsWith('data:image') ? (
                    <img
                      src={receiptUrl}
                      alt="Aperçu"
                      className="w-10 h-10 object-cover rounded-lg border border-indigo-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {receiptName || 'Justificatif joint'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Fichier prêt à être archivé
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Commentaires (Champ optionnel) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Commentaires (optionnel)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Contexte de la dépense
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Précisez le contexte ou les détails de cette dépense (ex : urgence technique, remise négociée avec le fournisseur, invités supplémentaires, conditions particulières de paiement...)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs leading-relaxed"
            />
          </div>

          {/* Organizer Email Notification Toggle */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="notifyOrganizers"
              checked={notifyOrganizers}
              onChange={(e) => setNotifyOrganizers(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="notifyOrganizers" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-indigo-950 block">
                Notifier les organisateurs par e-mail
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Génère un récapitulatif avec l'état du budget restant et prévient les {currentEvent?.organizers.length || 0} organisateur(s).
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Valider la dépense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
