export type CategoryType = 
  | 'Restauration & Boissons'
  | 'Lieu & Salle'
  | 'Transport & Logistique'
  | 'Hébergement'
  | 'Technique & Matériel'
  | 'Décoration & Fleurs'
  | 'Activités & Divertissement'
  | 'Communication & Print'
  | 'Autre';

export interface Organizer {
  id: string;
  name: string;
  email: string;
  role: string;
  notifyOnExpense: boolean;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  customShare?: number; // Optional weight, default 1
}

export interface Expense {
  id: string;
  eventId: string;
  title: string;
  amount: number;
  category: CategoryType;
  payerId: string;
  payerName: string;
  beneficiaryIds: string[]; // ['all'] or specific participant IDs
  date: string; // ISO YYYY-MM-DD
  receiptUrl?: string; // Data URL or external URL
  receiptName?: string;
  notes?: string;
  comments?: string; // Additional context on the expense
  notifiedOrganizers?: string[]; // List of emails notified
  createdAt: string;
}

export type AuditActionType = 'create' | 'update' | 'delete';

export interface AuditFieldDiff {
  field: string;
  label: string;
  oldValue?: string | number;
  newValue?: string | number;
}

export interface AuditLogEntry {
  id: string;
  eventId: string;
  expenseId: string;
  expenseTitle: string;
  action: AuditActionType;
  amount: number;
  category: CategoryType;
  performedBy: string; // Nom de l'utilisateur ayant fait l'action
  timestamp: string; // ISO date
  details: string; // Résumé textuel des modifications
  diffs?: AuditFieldDiff[]; // Changements précis champ par champ
}

export interface CategoryThresholdAlert {
  category: CategoryType;
  spent: number;
  allocatedBudget: number;
  percentage: number;
  thresholdPercent: number;
  isExceeded: boolean; // >= 100%
  isTriggered: boolean; // >= thresholdPercent (e.g. 80%)
  remaining: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  totalBudget: number;
  currency: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'active' | 'completed' | 'draft';
  organizers: Organizer[];
  participants: Participant[];
  categoryBudgets?: Partial<Record<CategoryType, number>>;
  categoryThresholdPercent?: number; // Defaults to 80%
  createdAt: string;
}

export interface EmailLog {
  id: string;
  eventId: string;
  eventTitle: string;
  expenseId?: string;
  expenseTitle?: string;
  expenseAmount?: number;
  currency?: string;
  payerName?: string;
  recipientEmails: string[];
  subject: string;
  body: string;
  sentAt: string;
  hasReceipt: boolean;
  budgetStatusText: string;
  isThresholdAlert?: boolean;
  triggeredAlerts?: CategoryThresholdAlert[];
}

export interface Settlement {
  fromParticipantId: string;
  fromName: string;
  toParticipantId: string;
  toName: string;
  amount: number;
}
