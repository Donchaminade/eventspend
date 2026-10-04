import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 text-white px-3.5 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-xs border border-amber-400/40 animate-bounce">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Mode hors-ligne actif (Données synchronisées localement)</span>
    </div>
  );
};
