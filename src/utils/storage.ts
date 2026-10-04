import { AuditLogEntry, EmailLog, EventItem, Expense } from '../types';

const STORAGE_KEYS = {
  EVENTS: 'eventspend_events_v2_fcfa',
  EXPENSES: 'eventspend_expenses_v2_fcfa',
  EMAIL_LOGS: 'eventspend_email_logs_v2_fcfa',
  ACTIVE_EVENT_ID: 'eventspend_active_event_id_v2_fcfa',
  AUDIT_LOGS: 'eventspend_audit_logs_v1_fcfa',
};

// SVG data URI for demo receipt proofs with FCFA currency
const SAMPLE_RECEIPT_1 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="%23fffbee"/><path d="M0 0 L400 0 L400 580 L380 600 L360 580 L340 600 L320 580 L300 600 L280 580 L260 600 L240 580 L220 600 L200 580 L180 600 L160 580 L140 600 L120 580 L100 600 L80 580 L60 600 L40 580 L20 600 L0 580 Z" fill="%23ffffff"/><text x="200" y="50" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle" fill="%231e293b">TRAITEUR &amp; SERVICES PRO</text><text x="200" y="75" font-family="monospace" font-size="12" text-anchor="middle" fill="%2364748b">Avenue Centrale, Abidjan / Dakar</text><line x1="40" y1="95" x2="360" y2="95" stroke="%23cbd5e1" stroke-dasharray="4,4"/><text x="40" y="130" font-family="monospace" font-size="13" fill="%23334155">Buffet Cocktail Prestige (x120)</text><text x="360" y="130" font-family="monospace" font-size="13" text-anchor="end" fill="%23334155">1 850 000 FCFA</text><text x="40" y="160" font-family="monospace" font-size="13" fill="%23334155">Boissons &amp; Logistique rafraîchissement</text><text x="360" y="160" font-family="monospace" font-size="13" text-anchor="end" fill="%23334155">600 000 FCFA</text><line x1="40" y1="200" x2="360" y2="200" stroke="%23334155" stroke-width="2"/><text x="40" y="235" font-family="monospace" font-size="15" font-weight="bold" fill="%231e293b">TOTAL TTC</text><text x="360" y="235" font-family="monospace" font-size="16" font-weight="bold" text-anchor="end" fill="%234f46e5">2 450 000 FCFA</text><text x="200" y="320" font-family="monospace" font-size="11" text-anchor="middle" fill="%2310b981">✓ PAIEMENT VALIDÉ (VIREMENT / MOBILE MONEY)</text><rect x="140" y="360" width="120" height="120" fill="%23f1f5f9" stroke="%23cbd5e1"/><text x="200" y="425" font-family="monospace" font-size="10" text-anchor="middle" fill="%2364748b">[TAMPON ACQUITTÉ]</text></svg>';

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Festival des Lumières & Musique 2026',
    description: 'Organisation du festival open-air de 3 jours : concerts, food-trucks et village associatif.',
    category: 'Festival & Concert',
    totalBudget: 15000000,
    currency: 'FCFA',
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    location: 'Esplanade du Palais des Congrès',
    status: 'active',
    categoryThresholdPercent: 80,
    categoryBudgets: {
      'Technique & Matériel': 5000000,
      'Lieu & Salle': 3500000,
      'Restauration & Boissons': 3000000,
      'Communication & Print': 1500000,
      'Transport & Logistique': 1000000,
      'Autre': 1000000,
    },
    organizers: [
      { id: 'org-1', name: 'Claire Dubois', email: 'claire.dubois@events.fr', role: 'Directrice Générale', notifyOnExpense: true },
      { id: 'org-2', name: 'Julien Morel', email: 'julien.morel@festival-sound.org', role: 'Trésorier', notifyOnExpense: true },
    ],
    participants: [
      { id: 'part-1', name: 'Claire Dubois', avatarColor: '#4f46e5', email: 'claire.dubois@events.fr' },
      { id: 'part-2', name: 'Julien Morel', avatarColor: '#06b6d4', email: 'julien.morel@festival-sound.org' },
      { id: 'part-3', name: 'Marc Fontaine', avatarColor: '#10b981', email: 'marc.f@gmail.com' },
      { id: 'part-4', name: 'Sarah Benali', avatarColor: '#f59e0b', email: 'sarah.b@gmail.com' },
      { id: 'part-5', name: 'Thomas Lemaire', avatarColor: '#ec4899', email: 'thomas.lem@outlook.fr' },
    ],
    createdAt: '2026-05-15T09:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Mariage Sophie & Alexandre',
    description: 'Célébration du mariage : cérémonie laïque, cocktail garden party et soirée dansante.',
    category: 'Mariage & Réception',
    totalBudget: 20000000,
    currency: 'FCFA',
    startDate: '2026-09-05',
    endDate: '2026-09-06',
    location: 'Résidence & Jardins de Grand-Bassam',
    status: 'active',
    categoryThresholdPercent: 80,
    categoryBudgets: {
      'Lieu & Salle': 7500000,
      'Restauration & Boissons': 6500000,
      'Décoration & Fleurs': 2500000,
      'Activités & Divertissement': 2500000,
      'Autre': 1000000,
    },
    organizers: [
      { id: 'org-3', name: 'Sophie Laurent', email: 'sophie.laurent@gmail.com', role: 'Mariée & Resp. Budget', notifyOnExpense: true },
      { id: 'org-4', name: 'Alexandre Roux', email: 'alex.roux@outlook.com', role: 'Marié', notifyOnExpense: true },
    ],
    participants: [
      { id: 'part-6', name: 'Sophie Laurent', avatarColor: '#ec4899', email: 'sophie.laurent@gmail.com' },
      { id: 'part-7', name: 'Alexandre Roux', avatarColor: '#3b82f6', email: 'alex.roux@outlook.com' },
      { id: 'part-8', name: 'Emma Laurent (Témoin)', avatarColor: '#8b5cf6', email: 'emma.l@gmail.com' },
      { id: 'part-9', name: 'Nicolas Roux (Témoin)', avatarColor: '#10b981', email: 'nicolas.r@gmail.com' },
    ],
    createdAt: '2026-04-10T14:30:00Z',
  },
  {
    id: 'evt-3',
    title: 'Séminaire Stratégique Q3 TechCorp',
    description: 'Séminaire annuel 48h : ateliers vision produit, activités team building et hébergement.',
    category: 'Séminaire Entreprise',
    totalBudget: 6000000,
    currency: 'FCFA',
    startDate: '2026-10-18',
    endDate: '2026-10-20',
    location: 'Hôtel Palm Club & Conférences',
    status: 'active',
    categoryThresholdPercent: 80,
    categoryBudgets: {
      'Hébergement': 3500000,
      'Activités & Divertissement': 1500000,
      'Autre': 1000000,
    },
    organizers: [
      { id: 'org-5', name: 'Maxime Vallet', email: 'm.vallet@techcorp.io', role: 'Lead Ops', notifyOnExpense: true },
    ],
    participants: [
      { id: 'part-10', name: 'Maxime Vallet', avatarColor: '#f97316', email: 'm.vallet@techcorp.io' },
      { id: 'part-11', name: 'Léa Bernard', avatarColor: '#06b6d4', email: 'lea.b@techcorp.io' },
      { id: 'part-12', name: 'David Cohen', avatarColor: '#6366f1', email: 'david.c@techcorp.io' },
    ],
    createdAt: '2026-08-01T11:00:00Z',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  // Expenses for Event 1 (Festival)
  {
    id: 'exp-101',
    eventId: 'evt-1',
    title: 'Acompte Scène principale & sonorisation professionnelle',
    amount: 4500000, // 90% of 5,000,000 FCFA allocated (triggers threshold >= 80%!)
    category: 'Technique & Matériel',
    payerId: 'part-2',
    payerName: 'Julien Morel',
    beneficiaryIds: ['all'],
    date: '2026-06-02',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'facture_acompte_sono.pdf',
    notes: 'Acompte versé par virement pour bloquer le matériel son & lumière.',
    notifiedOrganizers: ['claire.dubois@events.fr', 'julien.morel@festival-sound.org'],
    createdAt: '2026-06-02T10:15:00Z',
  },
  {
    id: 'exp-102',
    eventId: 'evt-1',
    title: 'Location chapiteau central et tentes sanitaires',
    amount: 2800000, // 80% of 3,500,000 FCFA allocated (hits threshold 80%!)
    category: 'Lieu & Salle',
    payerId: 'part-1',
    payerName: 'Claire Dubois',
    beneficiaryIds: ['all'],
    date: '2026-06-08',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'reçu_chapiteaux_pro.png',
    notes: 'Inclus montage et démontage le dimanche soir.',
    notifiedOrganizers: ['claire.dubois@events.fr', 'julien.morel@festival-sound.org'],
    createdAt: '2026-06-08T15:20:00Z',
  },
  {
    id: 'exp-103',
    eventId: 'evt-1',
    title: 'Traiteur bénévoles et loges artistes (3 jours)',
    amount: 2450000, // 81.7% of 3,000,000 FCFA allocated (triggers threshold >= 80%!)
    category: 'Restauration & Boissons',
    payerId: 'part-4',
    payerName: 'Sarah Benali',
    beneficiaryIds: ['all'],
    date: '2026-06-15',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'justificatif_traiteur.jpg',
    notes: 'Prévision de 120 repas chauds par jour avec options végétariennes.',
    notifiedOrganizers: ['claire.dubois@events.fr', 'julien.morel@festival-sound.org'],
    createdAt: '2026-06-15T18:00:00Z',
  },
  {
    id: 'exp-104',
    eventId: 'evt-1',
    title: 'Affiches grands formats, flyers et signalétique',
    amount: 950000,
    category: 'Communication & Print',
    payerId: 'part-3',
    payerName: 'Marc Fontaine',
    beneficiaryIds: ['all'],
    date: '2026-06-20',
    receiptUrl: undefined,
    notes: 'Imprimerie Centrale - Livraison effectuée.',
    notifiedOrganizers: ['claire.dubois@events.fr', 'julien.morel@festival-sound.org'],
    createdAt: '2026-06-20T11:45:00Z',
  },
  {
    id: 'exp-105',
    eventId: 'evt-1',
    title: 'Location 2 camionnettes utilitaires (48h)',
    amount: 400000,
    category: 'Transport & Logistique',
    payerId: 'part-5',
    payerName: 'Thomas Lemaire',
    beneficiaryIds: ['all'],
    date: '2026-06-28',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'contrat_utilitaire.pdf',
    notes: 'Chauffeurs et carburant inclus.',
    notifiedOrganizers: ['claire.dubois@events.fr'],
    createdAt: '2026-06-28T09:30:00Z',
  },

  // Expenses for Event 2 (Mariage)
  {
    id: 'exp-201',
    eventId: 'evt-2',
    title: 'Acompte privatisation Domaine & Jardins',
    amount: 6800000, // 90.7% of 7,500,000 FCFA allocated (triggers threshold >= 80%!)
    category: 'Lieu & Salle',
    payerId: 'part-7',
    payerName: 'Alexandre Roux',
    beneficiaryIds: ['all'],
    date: '2026-05-01',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'contrat_domaine_signe.pdf',
    notes: 'Accès dès le vendredi 14h jusquau dimanche 18h.',
    notifiedOrganizers: ['sophie.laurent@gmail.com', 'alex.roux@outlook.com'],
    createdAt: '2026-05-01T12:00:00Z',
  },
  {
    id: 'exp-202',
    eventId: 'evt-2',
    title: 'Traiteur : Cocktail dînatoire & Dîner assis (110 convives)',
    amount: 5800000, // 89.2% of 6,500,000 FCFA allocated (triggers threshold >= 80%!)
    category: 'Restauration & Boissons',
    payerId: 'part-6',
    payerName: 'Sophie Laurent',
    beneficiaryIds: ['all'],
    date: '2026-05-18',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'devis_traiteur_etoile.pdf',
    notes: 'Menu dégustation validé avec vin d’honneur.',
    notifiedOrganizers: ['sophie.laurent@gmail.com', 'alex.roux@outlook.com'],
    createdAt: '2026-05-18T16:00:00Z',
  },
  {
    id: 'exp-203',
    eventId: 'evt-2',
    title: 'Fleuriste & Arche florale pour cérémonie laïque',
    amount: 1950000,
    category: 'Décoration & Fleurs',
    payerId: 'part-8',
    payerName: 'Emma Laurent (Témoin)',
    beneficiaryIds: ['all'],
    date: '2026-06-12',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'ticket_atelier_floral.png',
    notes: 'Centres de table + bouquets des demoiselles dhonneur.',
    notifiedOrganizers: ['sophie.laurent@gmail.com'],
    createdAt: '2026-06-12T14:10:00Z',
  },
  {
    id: 'exp-204',
    eventId: 'evt-2',
    title: 'Prestation Photographe & Vidéaste drone',
    amount: 2100000,
    category: 'Activités & Divertissement',
    payerId: 'part-6',
    payerName: 'Sophie Laurent',
    beneficiaryIds: ['all'],
    date: '2026-06-25',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'acompte_studio_photo.pdf',
    notes: 'Reportage complet préparatifs jusquà la pièce montée.',
    notifiedOrganizers: ['sophie.laurent@gmail.com', 'alex.roux@outlook.com'],
    createdAt: '2026-06-25T11:20:00Z',
  },

  // Expenses for Event 3 (Séminaire TechCorp)
  {
    id: 'exp-301',
    eventId: 'evt-3',
    title: 'Hébergement 18 chambres Hôtel Palm Club',
    amount: 3100000, // 88.6% of 3,500,000 FCFA allocated
    category: 'Hébergement',
    payerId: 'part-10',
    payerName: 'Maxime Vallet',
    beneficiaryIds: ['all'],
    date: '2026-09-01',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'facture_hotel_seminaire.pdf',
    notes: 'Petit-déjeuners inclus et taxe de séjour.',
    notifiedOrganizers: ['m.vallet@techcorp.io'],
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'exp-302',
    eventId: 'evt-3',
    title: 'Activité Rallye & Team Building',
    amount: 1200000,
    category: 'Activités & Divertissement',
    payerId: 'part-11',
    payerName: 'Léa Bernard',
    beneficiaryIds: ['all'],
    date: '2026-09-10',
    receiptUrl: SAMPLE_RECEIPT_1,
    receiptName: 'reservation_activites.pdf',
    notes: 'Équipement gilets et moniteurs diplômés.',
    notifiedOrganizers: ['m.vallet@techcorp.io'],
    createdAt: '2026-09-10T14:45:00Z',
  },
];

const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: 'log-1',
    eventId: 'evt-1',
    eventTitle: 'Festival des Lumières & Musique 2026',
    expenseId: 'exp-101',
    expenseTitle: 'Acompte Scène principale & sonorisation professionnelle',
    expenseAmount: 4500000,
    currency: 'FCFA',
    payerName: 'Julien Morel',
    recipientEmails: ['claire.dubois@events.fr', 'julien.morel@festival-sound.org'],
    subject: '🚨 [ALERTE SEUIL 80%] Festival des Lumières - Scène principale (4 500 000 FCFA)',
    body: 'Bonjour à l\'équipe organisatrice,\n\nJulien Morel vient d\'enregistrer une nouvelle dépense sur l\'événement "Festival des Lumières & Musique 2026" :\n\n- Montant : 4 500 000 FCFA\n- Catégorie : Technique & Matériel\n- Justificatif : Joint (facture_acompte_sono.pdf)\n\n⚠️ ALERTE SEUIL 80% DÉPASSÉ : La catégorie "Technique & Matériel" a atteint 90.0% de son budget alloué (4 500 000 FCFA / 5 000 000 FCFA) !\n\nConsultez le tableau de bord en direct sur votre PWA EventSpend.',
    sentAt: '2026-06-02T10:15:30Z',
    hasReceipt: true,
    budgetStatusText: 'Alerte Seuil 80% : 90.0% consommé sur Technique & Matériel',
    isThresholdAlert: true,
  },
  {
    id: 'log-2',
    eventId: 'evt-2',
    eventTitle: 'Mariage Sophie & Alexandre',
    expenseId: 'exp-202',
    expenseTitle: 'Traiteur : Cocktail dînatoire & Dîner assis (110 convives)',
    expenseAmount: 5800000,
    currency: 'FCFA',
    payerName: 'Sophie Laurent',
    recipientEmails: ['sophie.laurent@gmail.com', 'alex.roux@outlook.com'],
    subject: '🚨 [ALERTE SEUIL 80%] Mariage Sophie & Alexandre - Traiteur (5 800 000 FCFA)',
    body: 'Bonjour aux organisateurs,\n\nSophie Laurent a validé le règlement du traiteur.\n- Montant : 5 800 000 FCFA\n- Catégorie : Restauration & Boissons\n- Justificatif : Fourni\n\n⚠️ ALERTE SEUIL DÉPASSÉ : 89.2% de l\'enveloppe Restauration a été consommée.\n\nCordialement,\nVotre PWA de gestion budgétaire EventSpend.',
    sentAt: '2026-05-18T16:00:20Z',
    hasReceipt: true,
    budgetStatusText: 'Alerte Seuil 80% : 89.2% consommé sur Restauration & Boissons',
    isThresholdAlert: true,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  // Audit trail for Event 1 (Festival)
  {
    id: 'audit-101',
    eventId: 'evt-1',
    expenseId: 'exp-101',
    expenseTitle: 'Acompte Scène principale & sonorisation professionnelle',
    action: 'create',
    amount: 4500000,
    category: 'Technique & Matériel',
    performedBy: 'Julien Morel',
    timestamp: '2026-06-02T10:15:00Z',
    details: 'Création de la dépense avec justificatif joint (facture_acompte_sono.pdf). Déclenchement du seuil de 80%.',
  },
  {
    id: 'audit-102',
    eventId: 'evt-1',
    expenseId: 'exp-102',
    expenseTitle: 'Location chapiteau central et tentes sanitaires',
    action: 'create',
    amount: 2500000,
    category: 'Lieu & Salle',
    performedBy: 'Claire Dubois',
    timestamp: '2026-06-08T14:30:00Z',
    details: 'Enregistrement initial de la réservation chapiteau.',
  },
  {
    id: 'audit-103',
    eventId: 'evt-1',
    expenseId: 'exp-102',
    expenseTitle: 'Location chapiteau central et tentes sanitaires',
    action: 'update',
    amount: 2800000,
    category: 'Lieu & Salle',
    performedBy: 'Claire Dubois',
    timestamp: '2026-06-08T15:20:00Z',
    details: 'Mise à jour du devis : ajout de 2 tentes sanitaires supplémentaires (+300 000 FCFA).',
    diffs: [
      {
        field: 'amount',
        label: 'Montant',
        oldValue: '2 500 000 FCFA',
        newValue: '2 800 000 FCFA',
      },
      {
        field: 'notes',
        label: 'Commentaires',
        oldValue: 'Réservation standard',
        newValue: 'Inclus montage et démontage le dimanche soir + tentes sanitaires',
      },
    ],
  },
  {
    id: 'audit-104',
    eventId: 'evt-1',
    expenseId: 'exp-103',
    expenseTitle: 'Traiteur bénévoles et loges artistes (3 jours)',
    action: 'create',
    amount: 2450000,
    category: 'Restauration & Boissons',
    performedBy: 'Sarah Benali',
    timestamp: '2026-06-15T18:00:00Z',
    details: 'Création de la dépense de restauration (120 repas/jour avec reçus).',
  },
  {
    id: 'audit-105',
    eventId: 'evt-1',
    expenseId: 'exp-del-1',
    expenseTitle: 'Option scène secondaire DJ Set',
    action: 'delete',
    amount: 1200000,
    category: 'Technique & Matériel',
    performedBy: 'Julien Morel',
    timestamp: '2026-06-17T11:10:00Z',
    details: 'Suppression de la dépense optionnelle suite à l\'arbitrage budgétaire.',
  },
  {
    id: 'audit-106',
    eventId: 'evt-1',
    expenseId: 'exp-104',
    expenseTitle: 'Affiches grands formats, flyers et signalétique',
    action: 'create',
    amount: 950000,
    category: 'Communication & Print',
    performedBy: 'Marc Fontaine',
    timestamp: '2026-06-20T11:45:00Z',
    details: 'Création de la transaction d\'impression et affichage.',
  },
  {
    id: 'audit-107',
    eventId: 'evt-1',
    expenseId: 'exp-105',
    expenseTitle: 'Location 2 camionnettes utilitaires (48h)',
    action: 'create',
    amount: 400000,
    category: 'Transport & Logistique',
    performedBy: 'Thomas Lemaire',
    timestamp: '2026-06-28T09:30:00Z',
    details: 'Création de la dépense logistique avec contrat joint.',
  },

  // Audit trail for Event 2 (Mariage)
  {
    id: 'audit-201',
    eventId: 'evt-2',
    expenseId: 'exp-201',
    expenseTitle: 'Acompte privatisation Domaine & Jardins',
    action: 'create',
    amount: 6800000,
    category: 'Lieu & Salle',
    performedBy: 'Alexandre Roux',
    timestamp: '2026-05-01T12:00:00Z',
    details: 'Création et versement de l\'acompte domaine.',
  },
  {
    id: 'audit-202',
    eventId: 'evt-2',
    expenseId: 'exp-202',
    expenseTitle: 'Traiteur : Cocktail dînatoire & Dîner assis (110 convives)',
    action: 'create',
    amount: 5200000,
    category: 'Restauration & Boissons',
    performedBy: 'Sophie Laurent',
    timestamp: '2026-05-18T16:00:20Z',
    details: 'Saisie initiale de la commande traiteur.',
  },
  {
    id: 'audit-203',
    eventId: 'evt-2',
    expenseId: 'exp-202',
    expenseTitle: 'Traiteur : Cocktail dînatoire & Dîner assis (110 convives)',
    action: 'update',
    amount: 5800000,
    category: 'Restauration & Boissons',
    performedBy: 'Sophie Laurent',
    timestamp: '2026-05-20T09:15:00Z',
    details: 'Ajustement du menu : sélection du forfait champagne et vins supérieurs.',
    diffs: [
      {
        field: 'amount',
        label: 'Montant',
        oldValue: '5 200 000 FCFA',
        newValue: '5 800 000 FCFA',
      },
    ],
  },
  {
    id: 'audit-204',
    eventId: 'evt-2',
    expenseId: 'exp-del-2',
    expenseTitle: 'Location véhicule d\'époque mariés',
    action: 'delete',
    amount: 350000,
    category: 'Transport & Logistique',
    performedBy: 'Alexandre Roux',
    timestamp: '2026-06-05T14:00:00Z',
    details: 'Suppression : prêt gratuit d\'une décapotable par un témoin.',
  },
];

export function getStoredEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const parsed: EventItem[] = JSON.parse(raw);
    return parsed.map((ev) => ({
      ...ev,
      currency: ev.currency === '€' ? 'FCFA' : ev.currency || 'FCFA',
      categoryThresholdPercent: ev.categoryThresholdPercent ?? 80,
    }));
  } catch (e) {
    console.error('Error reading events from storage:', e);
    return INITIAL_EVENTS;
  }
}

export function saveEvents(events: EventItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events:', e);
  }
}

export function getStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expenses from storage:', e);
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses:', e);
  }
}

export function getStoredEmailLogs(): EmailLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(INITIAL_EMAIL_LOGS));
      return INITIAL_EMAIL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading email logs:', e);
    return INITIAL_EMAIL_LOGS;
  }
}

export function saveEmailLogs(logs: EmailLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving email logs:', e);
  }
}

export function getActiveEventId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID) || 'evt-1';
  } catch {
    return 'evt-1';
  }
}

export function setActiveEventId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  } catch (e) {
    console.error('Error saving active event id:', e);
  }
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading audit logs:', e);
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving audit logs:', e);
  }
}
