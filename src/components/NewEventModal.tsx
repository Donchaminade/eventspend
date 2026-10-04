import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, Users, DollarSign, MapPin } from 'lucide-react';
import { EventItem, Organizer, Participant } from '../types';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<EventItem, 'id' | 'createdAt'>) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mariage & Réception');
  const [totalBudget, setTotalBudget] = useState('5000000');
  const [currency, setCurrency] = useState('FCFA');
  const [categoryThresholdPercent, setCategoryThresholdPercent] = useState('80');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');

  // Organizers
  const [organizers, setOrganizers] = useState<Organizer[]>([
    { id: '1', name: 'Organisateur Principal', email: '', role: 'Coordinateur', notifyOnExpense: true },
  ]);

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'p1', name: 'Organisateur Principal', avatarColor: '#4f46e5' },
    { id: 'p2', name: 'Invité 1', avatarColor: '#06b6d4' },
  ]);

  const [newParticipantName, setNewParticipantName] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOrganizer = () => {
    if (!newOrgName.trim() || !newOrgEmail.trim()) return;
    setOrganizers([
      ...organizers,
      {
        id: String(Date.now()),
        name: newOrgName.trim(),
        email: newOrgEmail.trim(),
        role: 'Co-organisateur',
        notifyOnExpense: true,
      },
    ]);
    setNewOrgName('');
    setNewOrgEmail('');
  };

  const handleRemoveOrganizer = (id: string) => {
    setOrganizers(organizers.filter((o) => o.id !== id));
  };

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setParticipants([
      ...participants,
      {
        id: `p-${Date.now()}`,
        name: newParticipantName.trim(),
        avatarColor: randomColor,
      },
    ]);
    setNewParticipantName('');
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Veuillez donner un nom à votre événement.');
      return;
    }

    const budget = parseFloat(totalBudget);
    if (isNaN(budget) || budget <= 0) {
      setError('Veuillez définir un budget supérieur à 0.');
      return;
    }

    onAddEvent({
      title: title.trim(),
      description: description.trim(),
      category,
      totalBudget: budget,
      currency,
      categoryThresholdPercent: parseInt(categoryThresholdPercent) || 80,
      startDate,
      endDate,
      location: location.trim(),
      status: 'active',
      organizers: organizers.filter((o) => o.name && o.email),
      participants,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h2 className="text-base font-bold text-slate-900">Créer un Nouvel Événement</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Nom de l'événement *
            </label>
            <input
              type="text"
              placeholder="Ex: Soirée de Gala, Anniversaire 30 ans, Week-end Ski..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Budget prévisionnel *
              </label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Devise
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="FCFA">FCFA (XOF)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="CHF">CHF</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Seuil d'alerte par catégorie (%) *
              </label>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {categoryThresholdPercent} %
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={categoryThresholdPercent}
                onChange={(e) => setCategoryThresholdPercent(e.target.value)}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Déclenche une alerte visuelle et e-mail aux organisateurs dès qu'une catégorie dépasse ce seuil (par défaut 80%).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
              Lieu de l'événement
            </label>
            <input
              type="text"
              placeholder="Ex: Domaine de la Source, Paris..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
            />
          </div>

          {/* Organizers emails section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Organisateurs (Recevront les notifications par email)
            </label>
            <div className="space-y-2">
              {organizers.map((org) => (
                <div key={org.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 truncate">{org.name}</p>
                    <p className="text-slate-500 truncate">{org.email || 'Email non renseigné'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOrganizer(org.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                placeholder="Nom organisateur"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
              />
              <input
                type="email"
                placeholder="email@domaine.fr"
                value={newOrgEmail}
                onChange={(e) => setNewOrgEmail(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleAddOrganizer}
              className="w-full py-1.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter un organisateur
            </button>
          </div>

          {/* Participants */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Participants &amp; Payeurs potentiels ({participants.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.avatarColor }}
                  />
                  <span>{p.name}</span>
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Nom du participant..."
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
          >
            Créer l'événement
          </button>
        </form>
      </div>
    </div>
  );
};
