/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BarChart3,
  Receipt,
  Mail,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Filter,
} from 'lucide-react';
import { AuditFieldDiff, AuditLogEntry, CategoryThresholdAlert, EmailLog, EventItem, Expense } from './types';
import {
  getActiveEventId,
  getStoredAuditLogs,
  getStoredEmailLogs,
  getStoredEvents,
  getStoredExpenses,
  saveAuditLogs,
  saveEmailLogs,
  saveEvents,
  saveExpenses,
  setActiveEventId,
} from './utils/storage';
import { calculateEventBudgetStatus, formatCurrency } from './utils/calculations';
import { prepareOrganizerNotification, PreparedEmail } from './utils/notificationService';
import { exportAllToCSV } from './utils/exportUtils';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { EventCard } from './components/EventCard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ExpenseListView } from './components/ExpenseListView';
import { NotificationCenter } from './components/NotificationCenter';
import { NewExpenseModal } from './components/NewExpenseModal';
import { NewEventModal } from './components/NewEventModal';
import { NotificationModal } from './components/NotificationModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { CategoryThresholdModal } from './components/CategoryThresholdModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { EventDetailModal, EventDetailTab } from './components/EventDetailModal';
import { EditExpenseModal } from './components/EditExpenseModal';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>(() => getStoredEvents());
  const [expenses, setExpenses] = useState<Expense[]>(() => getStoredExpenses());
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => getStoredEmailLogs());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getStoredAuditLogs());
  const [activeTab, setActiveTab] = useState<NavTab>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | 'all'>('all');

  // Modals state
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [expenseEventTarget, setExpenseEventTarget] = useState<string | null>(null);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);

  // Event Detail Modal (with Audit Log tab)
  const [eventDetailModal, setEventDetailModal] = useState<{
    isOpen: boolean;
    eventId: string | null;
    initialTab: EventDetailTab;
  }>({
    isOpen: false,
    eventId: null,
    initialTab: 'expenses',
  });

  // Edit Expense Modal
  const [editExpenseModal, setEditExpenseModal] = useState<{
    isOpen: boolean;
    expense: Expense | null;
    event: EventItem | null;
  }>({
    isOpen: false,
    expense: null,
    event: null,
  });

  // Category Threshold Modal state
  const [thresholdModalEventId, setThresholdModalEventId] = useState<string | null>(null);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  // Email Notification Modal state
  const [preparedEmail, setPreparedEmail] = useState<PreparedEmail | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationEventTitle, setNotificationEventTitle] = useState('');

  // Receipt Modal state
  const [receiptViewer, setReceiptViewer] = useState<{
    isOpen: boolean;
    url?: string;
    name?: string;
    title: string;
    amount: string;
  }>({
    isOpen: false,
    title: '',
    amount: '',
  });

  // Home filter
  const [homeSearch, setHomeSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Sync state to localStorage
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveEmailLogs(emailLogs);
  }, [emailLogs]);

  useEffect(() => {
    saveAuditLogs(auditLogs);
  }, [auditLogs]);

  // Overall statistics for hero summary
  const totalGlobalBudget = events.reduce((sum, e) => sum + (e.totalBudget || 0), 0);
  const totalGlobalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalGlobalRemaining = totalGlobalBudget - totalGlobalSpent;
  const globalPercentage = totalGlobalBudget > 0 ? (totalGlobalSpent / totalGlobalBudget) * 100 : 0;

  // Handlers
  const handleOpenNewExpense = (eventId?: string) => {
    setExpenseEventTarget(eventId || (selectedEventId !== 'all' ? selectedEventId : events[0]?.id || null));
    setIsNewExpenseOpen(true);
  };

  const handleAddExpense = (
    newExpenseData: Omit<Expense, 'id' | 'createdAt'>,
    notify: boolean
  ) => {
    const targetEvent = events.find((e) => e.id === newExpenseData.eventId);
    const id = `exp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const createdExpense: Expense = {
      ...newExpenseData,
      id,
      createdAt,
      notifiedOrganizers: notify && targetEvent
        ? targetEvent.organizers.filter((o) => o.notifyOnExpense && o.email).map((o) => o.email)
        : [],
    };

    const updatedExpenses = [createdExpense, ...expenses];
    setExpenses(updatedExpenses);

    // Record creation in Audit Log
    const newAuditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      eventId: createdExpense.eventId,
      expenseId: createdExpense.id,
      expenseTitle: createdExpense.title,
      action: 'create',
      amount: createdExpense.amount,
      category: createdExpense.category,
      performedBy: createdExpense.payerName || 'Organisateur',
      timestamp: createdAt,
      details: `Création de la transaction de ${formatCurrency(createdExpense.amount, targetEvent?.currency || 'FCFA')}${
        createdExpense.receiptUrl ? ' avec reçu joint' : ''
      }${createdExpense.comments ? ' • Contexte : ' + createdExpense.comments : ''}`,
    };
    setAuditLogs((prev) => [newAuditEntry, ...prev]);

    // If notify is requested and event has organizers
    if (notify && targetEvent) {
      const email = prepareOrganizerNotification(targetEvent, createdExpense, updatedExpenses);
      const newEmailLog: EmailLog = {
        id: `log-${Date.now()}`,
        eventId: targetEvent.id,
        eventTitle: targetEvent.title,
        expenseId: createdExpense.id,
        expenseTitle: createdExpense.title,
        expenseAmount: createdExpense.amount,
        currency: targetEvent.currency,
        payerName: createdExpense.payerName,
        recipientEmails: email.recipients,
        subject: email.subject,
        body: email.body,
        sentAt: new Date().toISOString(),
        hasReceipt: !!createdExpense.receiptUrl,
        budgetStatusText: email.budgetAlertMessage || 'Statut mis à jour',
      };

      setEmailLogs([newEmailLog, ...emailLogs]);
      setPreparedEmail(email);
      setNotificationEventTitle(targetEvent.title);
      setIsNotificationModalOpen(true);
    }
  };

  const handleOpenEditExpense = (expense: Expense) => {
    const ev = events.find((e) => e.id === expense.eventId) || events[0];
    setEditExpenseModal({
      isOpen: true,
      expense,
      event: ev,
    });
  };

  const handleSaveEditedExpense = (
    updatedExpense: Expense,
    editorName: string,
    diffs: AuditFieldDiff[],
    details: string
  ) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );

    // Record update in Audit Log
    const newAuditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      eventId: updatedExpense.eventId,
      expenseId: updatedExpense.id,
      expenseTitle: updatedExpense.title,
      action: 'update',
      amount: updatedExpense.amount,
      category: updatedExpense.category,
      performedBy: editorName,
      timestamp: new Date().toISOString(),
      details,
      diffs,
    };
    setAuditLogs((prev) => [newAuditEntry, ...prev]);
  };

  const handleAddEvent = (newEventData: Omit<EventItem, 'id' | 'createdAt'>) => {
    const newEvent: EventItem = {
      ...newEventData,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEvents([newEvent, ...events]);
    setSelectedEventId(newEvent.id);
  };

  const handleDeleteExpense = (id: string, existingExpense?: Expense) => {
    const targetExpense = existingExpense || expenses.find((e) => e.id === id);
    if (!targetExpense) return;
    const targetEvent = events.find((e) => e.id === targetExpense.eventId);

    if (window.confirm(`Voulez-vous vraiment supprimer la dépense "${targetExpense.title}" ?\nCette opération sera tracée dans le journal d'audit de l'événement.`)) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));

      // Record deletion in Audit Log
      const newAuditEntry: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        eventId: targetExpense.eventId,
        expenseId: targetExpense.id,
        expenseTitle: targetExpense.title,
        action: 'delete',
        amount: targetExpense.amount,
        category: targetExpense.category,
        performedBy: targetEvent?.organizers[0]?.name || 'Organisateur',
        timestamp: new Date().toISOString(),
        details: `Suppression de la dépense d'un montant de ${formatCurrency(
          targetExpense.amount,
          targetEvent?.currency || 'FCFA'
        )}.`,
      };
      setAuditLogs((prev) => [newAuditEntry, ...prev]);
    }
  };

  const handleOpenThresholdModal = (eventId: string) => {
    setThresholdModalEventId(eventId);
    setIsThresholdModalOpen(true);
  };

  const handleSaveEventThresholds = (updatedEvent: EventItem) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  const handleTriggerThresholdMail = (alert: CategoryThresholdAlert, event: EventItem) => {
    const recipients = event.organizers.filter((o) => o.notifyOnExpense && o.email).map((o) => o.email);
    const threshold = event.categoryThresholdPercent || 80;
    const subject = `🚨 [ALERTE SEUIL ${threshold}%] ${event.title} - Catégorie "${alert.category}" (${alert.percentage.toFixed(0)}% consommé)`;
    const body = `Bonjour à l'équipe organisatrice,

ALERTE SEUIL BUDGÉTAIRE ATTEINT POUR L'ÉVÉNEMENT : "${event.title}"

La catégorie de dépense "${alert.category}" a dépassé son seuil d'alerte configuré à ${threshold}% !

DÉTAILS DU SEUIL :
---------------------------------------------
• Catégorie concernée : ${alert.category}
• Total engagé : ${formatCurrency(alert.spent, event.currency)}
• Budget alloué à la catégorie : ${formatCurrency(alert.allocatedBudget, event.currency)}
• Pourcentage consommé : ${alert.percentage.toFixed(1)}%
• Marge disponible : ${alert.remaining >= 0 ? formatCurrency(alert.remaining, event.currency) : 'DÉPASSEMENT CRITIQUE (+ ' + formatCurrency(Math.abs(alert.remaining), event.currency) + ')'}

Merci de prendre les dispositions nécessaires pour les prochaines dépenses de cet événement.

---------------------------------------------
Alerte automatique émise par EventSpend PWA.`;

    const email: PreparedEmail = {
      subject,
      body,
      recipients,
      budgetAlertMessage: `🚨 Alerte transmise : La catégorie "${alert.category}" a atteint ${alert.percentage.toFixed(0)}% de son enveloppe.`,
      isThresholdAlert: true,
      thresholdAlerts: [alert],
    };

    const newEmailLog: EmailLog = {
      id: `log-thresh-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      currency: event.currency,
      recipientEmails: recipients,
      subject,
      body,
      sentAt: new Date().toISOString(),
      hasReceipt: false,
      budgetStatusText: `Alerte Seuil ${threshold}% sur ${alert.category}`,
      isThresholdAlert: true,
      triggeredAlerts: [alert],
    };

    setEmailLogs([newEmailLog, ...emailLogs]);
    setPreparedEmail(email);
    setNotificationEventTitle(event.title);
    setIsNotificationModalOpen(true);
  };

  const handleUpdateEventOrganizers = (
    eventId: string,
    newOrganizers: EventItem['organizers']
  ) => {
    setEvents(
      events.map((e) => (e.id === eventId ? { ...e, organizers: newOrganizers } : e))
    );
  };

  const handleViewReceipt = (url: string, name: string, title: string, amount: string) => {
    setReceiptViewer({
      isOpen: true,
      url,
      name,
      title,
      amount,
    });
  };

  const handleSelectEvent = (eventId: string, tab: EventDetailTab = 'expenses') => {
    setSelectedEventId(eventId);
    setEventDetailModal({
      isOpen: true,
      eventId,
      initialTab: tab,
    });
  };

  const handleOpenAudit = (eventId: string) => {
    handleSelectEvent(eventId, 'audit');
  };

  const handleOpenAnalytics = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab('analytics');
  };

  // Filter events for home
  const filteredEvents = events.filter((ev) => {
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
    if (homeSearch.trim()) {
      const q = homeSearch.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 pb-16 sm:pb-8">
      {/* Top Navbar */}
      <Navbar
        onOpenNewExpense={() => handleOpenNewExpense()}
        onOpenNewEvent={() => setIsNewEventOpen(true)}
        notificationCount={emailLogs.length}
        onNavigateToNotifications={() => setActiveTab('notifications')}
      />

      {/* Desktop / Tablet Subnav */}
      <div className="hidden sm:block border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'events'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Événements en cours ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de bord Analytique</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'expenses'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Transactions &amp; Justificatifs ({expenses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer relative ${
                activeTab === 'notifications'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Alertes Organisateurs</span>
              {emailLogs.length > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {emailLogs.length}
                </span>
              )}
            </button>
          </nav>

          <button
            onClick={() => exportAllToCSV(events, expenses)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
            title="Exporter l'ensemble des données en CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Global</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 sm:py-6">
        {/* TAB 1: EVENTS LIST & BUDGETS */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-fadeIn">
            {/* PWA Install Banner - stays visible until user installs */}
            <PWAInstallBanner />

            {/* Global Balance Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 p-5 sm:p-6 text-white shadow-xl shadow-indigo-600/15">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-semibold text-indigo-100 mb-2">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Suivi budgétaire consolidé</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Événements &amp; Soldes Actuels
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-md">
                    Dépenses en temps réel, alertes email des organisateurs et justificatifs archivés.
                  </p>
                </div>

                {/* Primary CTA in hero */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleOpenNewExpense()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Nouvelle Transaction</span>
                  </button>
                </div>
              </div>

              {/* Hero Stats Ribbon in FCFA */}
              <div className="relative z-10 mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-indigo-200 block font-semibold">
                    Budget Total
                  </span>
                  <span className="text-base sm:text-xl font-black tracking-tight">
                    {formatCurrency(totalGlobalBudget, 'FCFA')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-indigo-200 block font-semibold">
                    Dépenses Actuelles
                  </span>
                  <span className="text-base sm:text-xl font-black tracking-tight text-white">
                    {formatCurrency(totalGlobalSpent, 'FCFA')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-indigo-200 block font-semibold">
                    Solde Disponible
                  </span>
                  <span
                    className={`text-base sm:text-xl font-black tracking-tight ${
                      totalGlobalRemaining < 0 ? 'text-rose-300' : 'text-emerald-300'
                    }`}
                  >
                    {formatCurrency(totalGlobalRemaining, 'FCFA')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-indigo-200 block font-semibold">
                    Consommation
                  </span>
                  <span className="text-base sm:text-xl font-black tracking-tight">
                    {globalPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un événement par nom, lieu, catégorie..."
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Tous ({events.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      statusFilter === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    En cours
                  </button>
                </div>

                <button
                  onClick={() => setIsNewEventOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200/80 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvel événement</span>
                </button>
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <p className="text-xs text-slate-500">Aucun événement ne correspond à votre recherche.</p>
                <button
                  onClick={() => setIsNewEventOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Créer un événement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    expenses={expenses}
                    onSelectEvent={(id) => handleSelectEvent(id, 'expenses')}
                    onOpenNewExpense={handleOpenNewExpense}
                    onOpenAnalytics={handleOpenAnalytics}
                    onOpenThresholdModal={handleOpenThresholdModal}
                    onOpenAudit={handleOpenAudit}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            events={events}
            expenses={expenses}
            selectedEventId={selectedEventId}
            onSelectEventId={(id) => setSelectedEventId(id)}
            onOpenThresholdModal={handleOpenThresholdModal}
            onTriggerMailAlert={(alert) => {
              const ev = events.find((e) => e.id === selectedEventId);
              if (ev) handleTriggerThresholdMail(alert, ev);
            }}
          />
        )}

        {/* TAB 3: EXPENSES LIST */}
        {activeTab === 'expenses' && (
          <ExpenseListView
            events={events}
            expenses={expenses}
            activeEventId={selectedEventId !== 'all' ? selectedEventId : null}
            auditLogs={auditLogs}
            onOpenNewExpense={handleOpenNewExpense}
            onEditExpense={handleOpenEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {/* TAB 4: NOTIFICATIONS & MAIL LOGS */}
        {activeTab === 'notifications' && (
          <NotificationCenter
            events={events}
            emailLogs={emailLogs}
            onUpdateEventOrganizers={handleUpdateEventOrganizers}
          />
        )}
      </main>

      {/* Mobile Thumb Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenNewExpense={() => handleOpenNewExpense()}
        notificationCount={emailLogs.length}
      />

      {/* Modal: New Expense */}
      <NewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        events={events}
        expenses={expenses}
        activeEventId={expenseEventTarget}
        onAddExpense={handleAddExpense}
      />

      {/* Modal: New Event */}
      <NewEventModal
        isOpen={isNewEventOpen}
        onClose={() => setIsNewEventOpen(false)}
        onAddEvent={handleAddEvent}
      />

      {/* Modal: Category Thresholds Settings */}
      {thresholdModalEventId && (
        <CategoryThresholdModal
          isOpen={isThresholdModalOpen}
          onClose={() => setIsThresholdModalOpen(false)}
          event={events.find((e) => e.id === thresholdModalEventId) || events[0]}
          expenses={expenses}
          onSave={handleSaveEventThresholds}
        />
      )}

      {/* Modal: Event Detail View (with Audit Log tab) */}
      {eventDetailModal.isOpen && eventDetailModal.eventId && (
        <EventDetailModal
          isOpen={eventDetailModal.isOpen}
          onClose={() => setEventDetailModal((prev) => ({ ...prev, isOpen: false }))}
          event={events.find((e) => e.id === eventDetailModal.eventId) || events[0]}
          expenses={expenses}
          auditLogs={auditLogs}
          initialTab={eventDetailModal.initialTab}
          onOpenNewExpense={handleOpenNewExpense}
          onEditExpense={handleOpenEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onOpenThresholdModal={handleOpenThresholdModal}
          onViewReceipt={handleViewReceipt}
        />
      )}

      {/* Modal: Edit Expense */}
      {editExpenseModal.isOpen && editExpenseModal.expense && editExpenseModal.event && (
        <EditExpenseModal
          isOpen={editExpenseModal.isOpen}
          onClose={() => setEditExpenseModal({ isOpen: false, expense: null, event: null })}
          expense={editExpenseModal.expense}
          event={editExpenseModal.event}
          onSaveExpense={handleSaveEditedExpense}
        />
      )}

      {/* Modal: Organizer Notification Confirmation */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        preparedEmail={preparedEmail}
        eventTitle={notificationEventTitle}
      />

      {/* Modal: Full Receipt Image/Doc Viewer */}
      <ReceiptViewerModal
        isOpen={receiptViewer.isOpen}
        onClose={() => setReceiptViewer((prev) => ({ ...prev, isOpen: false }))}
        receiptUrl={receiptViewer.url}
        receiptName={receiptViewer.name}
        expenseTitle={receiptViewer.title}
        expenseAmount={receiptViewer.amount}
      />
    </div>
  );
}
