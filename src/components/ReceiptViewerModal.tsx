import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl?: string;
  receiptName?: string;
  expenseTitle: string;
  expenseAmount: string;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  receiptUrl,
  receiptName,
  expenseTitle,
  expenseAmount,
}) => {
  if (!isOpen || !receiptUrl) return null;

  const isPdf = receiptUrl.includes('application/pdf') || receiptName?.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-slate-900 text-sm truncate">{expenseTitle}</h3>
            <p className="text-xs text-slate-500 font-medium truncate">
              Justificatif : {receiptName || 'Reçu de paiement'} • <span className="font-semibold text-indigo-600">{expenseAmount}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={receiptUrl}
              download={receiptName || 'justificatif_depense'}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition"
              title="Télécharger la preuve"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/70 min-h-[300px]">
          {isPdf ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-xs border border-slate-200">
              <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-800 text-sm mb-1">{receiptName || 'Document PDF'}</p>
              <p className="text-xs text-slate-500 mb-4">Le justificatif est au format PDF sécurisé.</p>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ouvrir le fichier PDF
              </a>
            </div>
          ) : (
            <img
              src={receiptUrl}
              alt="Preuve de dépense"
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md bg-white"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
