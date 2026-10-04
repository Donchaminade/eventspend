import { CategoryThresholdAlert, CategoryType, EventItem, Expense, Settlement } from '../types';
import { ALL_CATEGORIES, CATEGORIES_CONFIG, CategoryMeta } from './categories';

export interface BudgetStatus {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isWarning: boolean; // > 80%
  statusColor: 'emerald' | 'amber' | 'rose';
  statusText: string;
}

export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  const isCfa = currency === 'FCFA' || currency === 'XOF';
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: isCfa ? 0 : 2,
    maximumFractionDigits: isCfa ? 0 : 2,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function calculateEventBudgetStatus(event: EventItem, expenses: Expense[]): BudgetStatus {
  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const totalSpent = eventExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalBudget = event.totalBudget || 0;
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const isOverBudget = remaining < 0;
  const isWarning = !isOverBudget && percentage >= 80;

  let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';
  let statusText = 'Budget respecté';

  if (isOverBudget) {
    statusColor = 'rose';
    statusText = `Dépassement (+${formatCurrency(Math.abs(remaining), event.currency)})`;
  } else if (isWarning) {
    statusColor = 'amber';
    statusText = `Attention (${percentage.toFixed(0)}% consommé)`;
  } else {
    statusColor = 'emerald';
    statusText = `Reste ${formatCurrency(remaining, event.currency)}`;
  }

  return {
    totalBudget,
    totalSpent,
    remaining,
    percentage,
    isOverBudget,
    isWarning,
    statusColor,
    statusText,
  };
}

/**
 * Returns the allocated budget for a category in an event.
 * If user has set an explicit budget for this category, uses it.
 * Otherwise provides an estimated proportional default based on total budget.
 */
export function getCategoryAllocatedBudget(event: EventItem, category: CategoryType): number {
  if (event.categoryBudgets && event.categoryBudgets[category] !== undefined) {
    return Number(event.categoryBudgets[category]) || 0;
  }
  // Default fallback: standard event budget weighting
  const defaultWeights: Record<CategoryType, number> = {
    'Restauration & Boissons': 0.30,
    'Lieu & Salle': 0.25,
    'Technique & Matériel': 0.15,
    'Hébergement': 0.10,
    'Activités & Divertissement': 0.08,
    'Décoration & Fleurs': 0.05,
    'Communication & Print': 0.04,
    'Transport & Logistique': 0.03,
    'Autre': 0.05,
  };
  const weight = defaultWeights[category] || 0.05;
  return Math.round((event.totalBudget || 0) * weight);
}

/**
 * Checks all categories in an event for threshold violations (default >= 80% or custom event threshold).
 */
export function getCategoryThresholdAlerts(
  event: EventItem,
  expenses: Expense[]
): CategoryThresholdAlert[] {
  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const thresholdPercent = event.categoryThresholdPercent ?? 80;

  // Calculate spend per category
  const spendByCategory: Partial<Record<CategoryType, number>> = {};
  for (const exp of eventExpenses) {
    spendByCategory[exp.category] = (spendByCategory[exp.category] || 0) + exp.amount;
  }

  const alerts: CategoryThresholdAlert[] = [];

  for (const cat of ALL_CATEGORIES) {
    const spent = spendByCategory[cat] || 0;
    const allocatedBudget = getCategoryAllocatedBudget(event, cat);

    if (allocatedBudget <= 0 && spent <= 0) continue;

    const percentage = allocatedBudget > 0 ? (spent / allocatedBudget) * 100 : spent > 0 ? 100 : 0;
    const isExceeded = percentage >= 100;
    const isTriggered = percentage >= thresholdPercent;
    const remaining = allocatedBudget - spent;

    if (isTriggered && spent > 0) {
      alerts.push({
        category: cat,
        spent,
        allocatedBudget,
        percentage,
        thresholdPercent,
        isExceeded,
        isTriggered,
        remaining,
      });
    }
  }

  // Sort by severity (highest percentage first)
  return alerts.sort((a, b) => b.percentage - a.percentage);
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
  allocatedBudget?: number;
  budgetPercentage?: number;
  thresholdPercent?: number;
  isOverThreshold?: boolean;
  isExceeded?: boolean;
  meta: CategoryMeta;
}

export function calculateCategoryBreakdown(
  expenses: Expense[],
  event?: EventItem
): CategorySummary[] {
  const totalAll = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const byCategory: Record<string, { total: number; count: number }> = {};

  for (const exp of expenses) {
    if (!byCategory[exp.category]) {
      byCategory[exp.category] = { total: 0, count: 0 };
    }
    byCategory[exp.category].total += exp.amount;
    byCategory[exp.category].count += 1;
  }

  const thresholdPercent = event?.categoryThresholdPercent ?? 80;

  return Object.entries(byCategory)
    .map(([cat, data]) => {
      const meta = CATEGORIES_CONFIG[cat as keyof typeof CATEGORIES_CONFIG] || CATEGORIES_CONFIG['Autre'];
      let allocatedBudget: number | undefined;
      let budgetPercentage: number | undefined;
      let isOverThreshold = false;
      let isExceeded = false;

      if (event) {
        allocatedBudget = getCategoryAllocatedBudget(event, cat as CategoryType);
        if (allocatedBudget > 0) {
          budgetPercentage = (data.total / allocatedBudget) * 100;
          isOverThreshold = budgetPercentage >= thresholdPercent;
          isExceeded = budgetPercentage >= 100;
        }
      }

      return {
        category: cat,
        total: data.total,
        count: data.count,
        percentage: totalAll > 0 ? (data.total / totalAll) * 100 : 0,
        allocatedBudget,
        budgetPercentage,
        thresholdPercent,
        isOverThreshold,
        isExceeded,
        meta,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface PersonCostBreakdown {
  participantId: string;
  name: string;
  avatarColor: string;
  paidAmount: number;
  fairShareAmount: number;
  balance: number; // positive = should receive, negative = owes
  expensesCount: number;
}

export function calculatePersonBreakdown(event: EventItem, expenses: Expense[]): PersonCostBreakdown[] {
  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const totalSpent = eventExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const participants = event.participants;

  if (participants.length === 0) return [];

  // Equal split fair share
  const fairShareAmount = totalSpent / participants.length;

  return participants.map((p) => {
    const paidExpenses = eventExpenses.filter((e) => e.payerId === p.id);
    const paidAmount = paidExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = paidAmount - fairShareAmount;

    return {
      participantId: p.id,
      name: p.name,
      avatarColor: p.avatarColor || '#6366f1',
      paidAmount,
      fairShareAmount,
      balance,
      expensesCount: paidExpenses.length,
    };
  }).sort((a, b) => b.paidAmount - a.paidAmount);
}

/**
 * Minimal transactions algorithm to settle debts among participants
 */
export function calculateSettlements(event: EventItem, expenses: Expense[]): Settlement[] {
  const personBreakdowns = calculatePersonBreakdown(event, expenses);
  if (personBreakdowns.length <= 1) return [];

  // Debtors have negative balance (they owe money)
  // Creditors have positive balance (they are owed money)
  const debtors = personBreakdowns
    .filter((p) => p.balance < -0.01)
    .map((p) => ({ ...p, balance: Math.abs(p.balance) }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = personBreakdowns
    .filter((p) => p.balance > 0.01)
    .map((p) => ({ ...p, balance: p.balance }))
    .sort((a, b) => b.balance - a.balance);

  const settlements: Settlement[] = [];
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const transferAmount = Math.min(debtor.balance, creditor.balance);

    if (transferAmount > 0.01) {
      settlements.push({
        fromParticipantId: debtor.participantId,
        fromName: debtor.name,
        toParticipantId: creditor.participantId,
        toName: creditor.name,
        amount: Math.round(transferAmount * 100) / 100,
      });
    }

    debtor.balance -= transferAmount;
    creditor.balance -= transferAmount;

    if (debtor.balance <= 0.01) debtorIdx++;
    if (creditor.balance <= 0.01) creditorIdx++;
  }

  return settlements;
}
