import { CategoryThresholdAlert, EmailLog, EventItem, Expense } from '../types';
import { calculateEventBudgetStatus, formatCurrency, getCategoryThresholdAlerts } from './calculations';

export interface PreparedEmail {
  subject: string;
  body: string;
  recipients: string[];
  budgetAlertMessage: string;
  isThresholdAlert: boolean;
  thresholdAlerts: CategoryThresholdAlert[];
}

export function prepareOrganizerNotification(
  event: EventItem,
  expense: Expense,
  allExpenses: Expense[]
): PreparedEmail {
  const currentExpenses = [...allExpenses.filter((e) => e.id !== expense.id), expense];
  const budgetStatus = calculateEventBudgetStatus(event, currentExpenses);
  const thresholdAlerts = getCategoryThresholdAlerts(event, currentExpenses);

  const activeRecipients = event.organizers
    .filter((o) => o.notifyOnExpense && o.email)
    .map((o) => o.email);

  // Check if the current expense's category or any category triggered the threshold
  const currentCategoryAlert = thresholdAlerts.find((a) => a.category === expense.category);
  const hasThresholdAlert = thresholdAlerts.length > 0;
  const thresholdPercent = event.categoryThresholdPercent ?? 80;

  let alertPill = '';
  if (currentCategoryAlert) {
    if (currentCategoryAlert.isExceeded) {
      alertPill = `🚨 ALERTE SEUIL DÉPASSÉ (100%+) : La catégorie "${currentCategoryAlert.category}" a dépassé son budget alloué ! Dépensé : ${formatCurrency(currentCategoryAlert.spent, event.currency)} sur ${formatCurrency(currentCategoryAlert.allocatedBudget, event.currency)} alloués (${currentCategoryAlert.percentage.toFixed(1)}%).`;
    } else {
      alertPill = `⚠️ ALERTE SEUIL ${thresholdPercent}% DÉPASSÉ : La catégorie "${currentCategoryAlert.category}" a atteint ${currentCategoryAlert.percentage.toFixed(1)}% de son budget alloué (${formatCurrency(currentCategoryAlert.spent, event.currency)} / ${formatCurrency(currentCategoryAlert.allocatedBudget, event.currency)}). Marge restante : ${formatCurrency(currentCategoryAlert.remaining, event.currency)}.`;
    }
  } else if (budgetStatus.isOverBudget) {
    alertPill = `🚨 ALERTE BUDGET GLOBAL DÉPASSÉ : Le budget total est dépassé de ${formatCurrency(
      Math.abs(budgetStatus.remaining),
      event.currency
    )} !`;
  } else if (budgetStatus.isWarning) {
    alertPill = `⚠️ ATTENTION BUDGET GLOBAL : ${budgetStatus.percentage.toFixed(
      1
    )}% du budget total a été consommé.`;
  } else {
    alertPill = `✅ Solde restant : ${formatCurrency(
      budgetStatus.remaining,
      event.currency
    )} (${(100 - budgetStatus.percentage).toFixed(1)}% disponible).`;
  }

  // Subject line with threshold flag
  let subjectPrefix = `[EventSpend]`;
  if (currentCategoryAlert) {
    subjectPrefix = `🚨 [ALERTE SEUIL ${thresholdPercent}%] Catégorie "${currentCategoryAlert.category}"`;
  } else if (budgetStatus.isOverBudget) {
    subjectPrefix = `🚨 [ALERTE BUDGET DÉPASSÉ]`;
  }

  const subject = `${subjectPrefix} ${event.title} - Dépense : ${formatCurrency(
    expense.amount,
    event.currency
  )} (${expense.payerName})`;

  // Category thresholds report block for body
  let categoryAlertsBlock = '';
  if (thresholdAlerts.length > 0) {
    categoryAlertsBlock = `
⚠️ ALERTES SEUILS PAR CATÉGORIE (Seuil paramétré : ≥ ${thresholdPercent}%) :
---------------------------------------------
${thresholdAlerts
  .map(
    (a) =>
      `• ${a.category} : ${formatCurrency(a.spent, event.currency)} dépensés / ${formatCurrency(
        a.allocatedBudget,
        event.currency
      )} alloués (${a.percentage.toFixed(1)}%) ${
        a.isExceeded ? '-> DÉPASSEMENT CRITIQUE (+ ' + formatCurrency(Math.abs(a.remaining), event.currency) + ')' : '-> Reste : ' + formatCurrency(a.remaining, event.currency)
      }`
  )
  .join('\n')}
`;
  }

  const body = `Bonjour à l'équipe organisatrice,

Une nouvelle transaction vient d'être enregistrée pour l'événement : "${event.title}".

DÉTAILS DE LA DÉPENSE :
---------------------------------------------
• Intitulé : ${expense.title}
• Montant : ${formatCurrency(expense.amount, event.currency)}
• Catégorie : ${expense.category}
• Réglé par : ${expense.payerName}
• Date : ${expense.date}
• Justificatif joint : ${expense.receiptUrl ? 'OUI (' + (expense.receiptName || 'Reçu') + ')' : 'NON (Non fourni)'}
${(expense.comments || expense.notes) ? '• Commentaires / Contexte : ' + (expense.comments || expense.notes) : ''}

SUIVI DU BUDGET GLOBAL EN TEMPS RÉEL :
---------------------------------------------
• Budget total alloué : ${formatCurrency(event.totalBudget, event.currency)}
• Total des dépenses engagées : ${formatCurrency(budgetStatus.totalSpent, event.currency)}
• Solde disponible : ${formatCurrency(budgetStatus.remaining, event.currency)} (${budgetStatus.percentage.toFixed(1)}% consommé)
• Statut général : ${budgetStatus.statusText}
${categoryAlertsBlock}
---------------------------------------------
NOTIFICATION AUTOMATIQUE :
${alertPill}

Accédez au tableau de bord complet et aux graphiques détaillés depuis l'application EventSpend PWA.
---------------------------------------------
Notification automatique générée par EventSpend PWA.`;

  return {
    subject,
    body,
    recipients: activeRecipients,
    budgetAlertMessage: alertPill,
    isThresholdAlert: hasThresholdAlert,
    thresholdAlerts,
  };
}

export function createMailtoLink(recipients: string[], subject: string, body: string): string {
  const to = recipients.join(',');
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
}
