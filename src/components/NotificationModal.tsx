import React, { useState } from 'react';
import { Mail, Check, Copy, ExternalLink, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PreparedEmail, createMailtoLink } from '../utils/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preparedEmail: PreparedEmail | null;
  eventTitle: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  preparedEmail,
  eventTitle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !preparedEmail) return null;

  const mailtoUrl = createMailtoLink(
    preparedEmail.recipients,
    preparedEmail.subject,
    preparedEmail.body
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Objet : ${preparedEmail.subject}\nDestinataires : ${preparedEmail.recipients.join(
          ', '
        )}\n\n${preparedEmail.body}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            preparedEmail.isThresholdAlert
              ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-700'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              {preparedEmail.isThresholdAlert ? <AlertTriangle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Notification Organisateurs</h3>
                {preparedEmail.isThresholdAlert && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white text-amber-900 shadow-2xs">
                    Alerte Seuil
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                {preparedEmail.recipients.length} organisateur(s) renseigné(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Status banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Dépense enregistrée et prête à être communiquée</span>
            </div>
            {preparedEmail.budgetAlertMessage && (
              <div
                className={`text-xs font-medium p-2.5 rounded-lg flex items-start gap-2 border ${
                  preparedEmail.isThresholdAlert
                    ? 'text-amber-950 bg-amber-50 border-amber-300'
                    : 'text-slate-800 bg-slate-100 border-slate-200'
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    preparedEmail.isThresholdAlert ? 'text-amber-600' : 'text-slate-500'
                  }`}
                />
                <span>{preparedEmail.budgetAlertMessage}</span>
              </div>
            )}
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Destinataires (Organisateurs)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {preparedEmail.recipients.map((email, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  <Mail className="w-3 h-3 mr-1 text-indigo-500" />
                  {email}
                </span>
              ))}
              {preparedEmail.recipients.length === 0 && (
                <span className="text-xs text-slate-400 italic">
                  Aucun organisateur configuré avec notifications actives.
                </span>
              )}
            </div>
          </div>

          {/* Email Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Objet de l'e-mail
            </label>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 select-all font-mono">
              {preparedEmail.subject}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Contenu du message
            </label>
            <pre className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto select-all">
              {preparedEmail.body}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 justify-end">
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier l'e-mail</span>
              </>
            )}
          </button>

          {preparedEmail.recipients.length > 0 ? (
            <a
              href={mailtoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ouvrir l'application Mail</span>
            </a>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
