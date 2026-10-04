import React, { useState, useMemo } from 'react';
import {
  History,
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  User,
  Calendar,
  Filter,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Layers,
} from 'lucide-react';
import { AuditActionType, AuditLogEntry, EventItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { CATEGORIES_CONFIG } from '../utils/categories';

interface EventAuditLogViewProps {
  event: EventItem;
  auditLogs: AuditLogEntry[];
}

export const EventAuditLogView: React.FC<EventAuditLogViewProps> = ({
  event,
  auditLogs,
}) => {
  const [selectedAction, setSelectedAction] = useState<AuditActionType | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs for this specific event
  const eventLogs = useMemo(() => {
    return auditLogs.filter((log) => log.eventId === event.id);
  }, [auditLogs, event.id]);

  // Extract unique users who made modifications
  const distinctUsers = useMemo(() => {
    const set = new Set<string>();
    eventLogs.forEach((log) => {
      if (log.performedBy) set.add(log.performedBy);
    });
    return Array.from(set);
  }, [eventLogs]);

  // Filtered entries
  const filteredLogs = useMemo(() => {
    return eventLogs
      .filter((log) => {
        if (selectedAction !== 'all' && log.action !== selectedAction) return false;
        if (selectedUser !== 'all' && log.performedBy !== selectedUser) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = log.expenseTitle.toLowerCase().includes(q);
          const matchesDetails = log.details.toLowerCase().includes(q);
          const matchesAuthor = log.performedBy.toLowerCase().includes(q);
          const matchesCategory = log.category.toLowerCase().includes(q);
          return matchesTitle || matchesDetails || matchesAuthor || matchesCategory;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [eventLogs, selectedAction, selectedUser, searchQuery]);

  // Counts for action pills
  const countCreate = eventLogs.filter((l) => l.action === 'create').length;
  const countUpdate = eventLogs.filter((l) => l.action === 'update').length;
  const countDelete = eventLogs.filter((l) => l.action === 'delete').length;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header and Subtitle */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Journal d'Audit des Dépenses
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                {eventLogs.length} opération{eventLogs.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Traçabilité chronologique des ajouts, modifications et suppressions pour {event.title}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit sécurisé</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par intitulé, auteur, détail de modification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* User selector */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tous les utilisateurs ({distinctUsers.length})</option>
              {distinctUsers.map((user) => (
                <option key={user} value={user}>
                  👤 {user}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setSelectedAction('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedAction === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes les actions ({eventLogs.length})
          </button>

          <button
            onClick={() => setSelectedAction('create')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedAction === 'create'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ajouts ({countCreate})</span>
          </button>

          <button
            onClick={() => setSelectedAction('update')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedAction === 'update'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modifications ({countUpdate})</span>
          </button>

          <button
            onClick={() => setSelectedAction('delete')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedAction === 'delete'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Suppressions ({countDelete})</span>
          </button>
        </div>
      </div>

      {/* Audit Log Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-2">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Aucun historique correspondant</p>
          <p className="text-[11px] text-slate-400">
            Modifiez vos filtres de recherche ou effectuez une transaction sur cet événement.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const catMeta = CATEGORIES_CONFIG[log.category] || CATEGORIES_CONFIG['Autre'];
            const logDate = new Date(log.timestamp);
            const isToday = new Date().toDateString() === logDate.toDateString();

            let actionBadgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            let actionText = 'Ajout de dépense';
            let ActionIcon = PlusCircle;

            if (log.action === 'update') {
              actionBadgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
              actionText = 'Modification de dépense';
              ActionIcon = Edit3;
            } else if (log.action === 'delete') {
              actionBadgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
              actionText = 'Suppression de dépense';
              ActionIcon = Trash2;
            }

            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition relative overflow-hidden group"
              >
                {/* Left accent vertical stripe */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    log.action === 'create'
                      ? 'bg-emerald-500'
                      : log.action === 'update'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-2">
                  {/* Left Column: Author, Action Tag, Title */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Top Row: User Avatar & Name + Action Badge + Time */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                        {log.performedBy.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs">
                        {log.performedBy}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${actionBadgeBg}`}
                      >
                        <ActionIcon className="w-3 h-3" />
                        <span>{actionText}</span>
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {logDate.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' à '}
                        {logDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Expense Title and Amount */}
                    <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {log.expenseTitle}
                      </h4>
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {formatCurrency(log.amount, event.currency)}
                      </span>
                    </div>

                    {/* Category pill */}
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-slate-50"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: catMeta.color }}
                        />
                        <span>{log.category}</span>
                      </span>
                    </div>

                    {/* Details explanation text */}
                    {log.details && (
                      <p className="text-xs text-slate-600 font-medium pt-1 leading-relaxed">
                        {log.details}
                      </p>
                    )}

                    {/* Explicit Field Diffs (If any fields were modified) */}
                    {log.diffs && log.diffs.length > 0 && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Champs modifiés :
                        </span>
                        {log.diffs.map((diff, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 flex-wrap font-medium text-slate-700"
                          >
                            <span className="font-bold text-slate-900">{diff.label} :</span>
                            <span className="line-through text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              {String(diff.oldValue || 'Vide')}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              {String(diff.newValue || 'Vide')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
