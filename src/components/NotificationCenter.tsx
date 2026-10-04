import React, { useState } from 'react';
import {
  Mail,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
  Users,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EmailLog, EventItem, Expense } from '../types';
import { createMailtoLink } from '../utils/notificationService';
import { formatCurrency } from '../utils/calculations';

interface NotificationCenterProps {
  events: EventItem[];
  emailLogs: EmailLog[];
  onUpdateEventOrganizers: (eventId: string, newOrganizers: EventItem['organizers']) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  events,
  emailLogs,
  onUpdateEventOrganizers,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(emailLogs[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Organizer settings accordion
  const [showConfig, setShowConfig] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleCopy = async (log: EmailLog) => {
    try {
      await navigator.clipboard.writeText(
        `Objet : ${log.subject}\nDestinataires : ${log.recipientEmails.join(
          ', '
        )}\n\n${log.body}`
      );
      setCopiedId(log.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(log.id);
    }
  };

  const handleAddOrganizer = () => {
    if (!newOrgName.trim() || !newOrgEmail.trim() || !currentEvent) return;
    const updated = [
      ...currentEvent.organizers,
      {
        id: `org-${Date.now()}`,
        name: newOrgName.trim(),
        email: newOrgEmail.trim(),
        role: 'Organisateur',
        notifyOnExpense: true,
      },
    ];
    onUpdateEventOrganizers(currentEvent.id, updated);
    setNewOrgName('');
    setNewOrgEmail('');
  };

  const handleToggleNotify = (orgId: string) => {
    if (!currentEvent) return;
    const updated = currentEvent.organizers.map((o) =>
      o.id === orgId ? { ...o, notifyOnExpense: !o.notifyOnExpense } : o
    );
    onUpdateEventOrganizers(currentEvent.id, updated);
  };

  const handleRemoveOrganizer = (orgId: string) => {
    if (!currentEvent) return;
    const updated = currentEvent.organizers.filter((o) => o.id !== orgId);
    onUpdateEventOrganizers(currentEvent.id, updated);
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              Notifications &amp; Alertes Organisateurs
            </h2>
            <p className="text-xs text-indigo-100 font-medium">
              Chaque dépense enregistrée déclenche une alerte budgétaire pour l'équipe
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {showConfig ? 'Masquer la configuration' : 'Gérer les e-mails des organisateurs'}
            </span>
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Organizer Configuration Drawer */}
      {showConfig && currentEvent && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Liste de diffusion des alertes par événement
            </h3>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {currentEvent.organizers.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                    {org.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{org.name}</p>
                    <p className="text-slate-500 truncate">{org.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={org.notifyOnExpense}
                      onChange={() => handleToggleNotify(org.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Alerter</span>
                  </label>
                  <button
                    onClick={() => handleRemoveOrganizer(org.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 ml-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add organizer form */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2">Ajouter un nouvel organisateur</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nom complet"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
              <input
                type="email"
                placeholder="adresse@email.com"
                value={newOrgEmail}
                onChange={(e) => setNewOrgEmail(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddOrganizer}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
              >
                + Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatched Logs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-slate-900 text-sm">
            Historique des Alertes Mails Générées ({emailLogs.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Temps réel</span>
        </div>

        {emailLogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400 italic">
            Aucun historique de notification pour le moment. Ajoutez une dépense avec la case notification cochée !
          </div>
        ) : (
          <div className="space-y-3">
            {emailLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const mailto = createMailtoLink(log.recipientEmails, log.subject, log.body);

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition"
                >
                  {/* Log Header */}
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 cursor-pointer hover:bg-slate-50/70 transition flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        log.isThresholdAlert
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
                      }`}>
                        {log.isThresholdAlert ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {log.eventTitle}
                          </span>
                          {log.isThresholdAlert && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Alerte Seuil
                            </span>
                          )}
                          {log.expenseAmount && (
                            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {formatCurrency(log.expenseAmount, log.currency || '€')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                          {log.subject}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.sentAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span>{log.recipientEmails.length} destinataire(s)</span>
                          {log.hasReceipt && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">Preuve jointe</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Body & Actions */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Destinataires notifiés
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {log.recipientEmails.map((email, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700"
                            >
                              {email}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Message complet
                        </span>
                        <pre className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto select-all">
                          {log.body}
                        </pre>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                        >
                          {copiedId === log.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier l'e-mail</span>
                            </>
                          )}
                        </button>

                        <a
                          href={mailto}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ouvrir dans mon client Mail</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
