import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA, hide completely
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  // Render button based on variant
  const renderTrigger = () => {
    if (variant === 'banner') {
      return (
        <button
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-600 animate-bounce" />
          <span>Installer l'application PWA</span>
        </button>
      );
    }

    if (variant === 'card') {
      return (
        <button
          onClick={handleClick}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-98 transition cursor-pointer"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>Installer sur mon écran d'accueil</span>
        </button>
      );
    }

    // Default: 'navbar'
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer ${className}`}
        title="Installer l'application sur votre écran d'accueil"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Installer PWA</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Installation Guide Modal (for iOS or when browser prompt isn't directly triggered) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Installer EventSpend
                  </h3>
                  <p className="text-xs text-slate-500">
                    Application PWA autonome &amp; hors-ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content for iOS */}
            {isIOS ? (
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950 font-medium">
                  📱 Safari iOS requiert une installation manuelle en 2 étapes simples :
                </div>

                <ol className="space-y-3">
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">
                        Touchez le bouton Partager
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Situé dans la barre de navigation inférieure de Safari (icône <Share className="w-3.5 h-3.5 inline-block text-indigo-600 mx-1 align-text-bottom" />).
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">
                        Sélectionnez "Sur l'écran d'accueil"
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Faites défiler la liste vers le bas et touchez <strong className="text-slate-800">Sur l'écran d'accueil</strong> (<PlusSquare className="w-3.5 h-3.5 inline-block text-indigo-600 mx-1 align-text-bottom" />) puis validez avec <strong className="text-slate-800">Ajouter</strong>.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            ) : (
              /* Content for Chrome / Android / Edge / Desktop */
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950 font-medium">
                  💡 Profitez d'une expérience fluide plein écran avec synchronisation instantanée :
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <Smartphone className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Sur Android (Chrome / Brave / Firefox) :</p>
                      <p className="text-slate-500 mt-0.5">
                        Touchez le menu ⋮ en haut à droite, puis sélectionnez <strong className="text-slate-800">Installer l'application</strong> ou <strong className="text-slate-800">Ajouter à l'écran d'accueil</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <Laptop className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Sur Ordinateur (Chrome / Edge) :</p>
                      <p className="text-slate-500 mt-0.5">
                        Cliquez sur l'icône <strong className="text-slate-800">⊕ Installer</strong> située tout à droite dans la barre d'adresse de votre navigateur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits of installation */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Avantages de l'application installée
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Accès direct 1-clic</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Fonctionne hors-ligne</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Plein écran natif</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Zéro téléchargement store</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
