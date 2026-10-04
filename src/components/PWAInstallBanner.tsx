import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallButton } from './PWAInstallButton';
import { Smartphone, Download, Zap, WifiOff, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled } = usePWAInstall();

  // If already installed as standalone PWA, completely hide
  if (isInstalled) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-4 sm:p-5 text-white shadow-lg border border-indigo-800/40">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left side details */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm flex-shrink-0 shadow-md shadow-amber-500/20">
            <Smartphone className="w-6 h-6 text-slate-950" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Installer EventSpend sur votre écran d'accueil
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                PWA Installable
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1 leading-relaxed max-w-xl">
              Lancez l'application en 1 clic comme une app native, sans barre de navigation, avec saisie rapide des dépenses en <strong>FCFA</strong> et fonctionnement 100% hors-ligne !
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
          <PWAInstallButton variant="banner" />
        </div>
      </div>

      {/* Decorative ambient elements */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />
    </div>
  );
};
