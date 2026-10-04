import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EventItem, Expense } from '../types';
import { calculateCategoryBreakdown, calculateEventBudgetStatus, calculatePersonBreakdown, formatCurrency } from './calculations';

export function exportEventToCSV(event: EventItem, expenses: Expense[]): void {
  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const status = calculateEventBudgetStatus(event, eventExpenses);

  const rows: string[][] = [
    ['--- RAPPORT DE DÉPENSES ÉVÉNEMENT ---'],
    ['Événement', event.title],
    ['Dates', `${event.startDate} au ${event.endDate}`],
    ['Lieu', event.location || 'Non précisé'],
    ['Budget Total', `${event.totalBudget} ${event.currency}`],
    ['Total Dépensé', `${status.totalSpent.toFixed(2)} ${event.currency}`],
    ['Solde Restant', `${status.remaining.toFixed(2)} ${event.currency}`],
    ['Taux de consommation', `${status.percentage.toFixed(1)}%`],
    ['Organisateurs', event.organizers.map((o) => `${o.name} (${o.email})`).join('; ')],
    ['Date d\'exportation', new Date().toLocaleDateString('fr-FR')],
    [''],
    [
      'ID Transaction',
      'Date',
      'Intitulé',
      'Catégorie',
      'Montant',
      'Devise',
      'Payé par',
      'Justificatif joint',
      'Organisateurs Notifiés',
      'Commentaires',
    ],
  ];

  for (const exp of eventExpenses) {
    rows.push([
      exp.id,
      exp.date,
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      `"${exp.category}"`,
      exp.amount.toFixed(2),
      event.currency,
      `"${exp.payerName}"`,
      exp.receiptUrl ? 'Oui' : 'Non',
      `"${(exp.notifiedOrganizers || []).join(', ')}"`,
      `"${(exp.comments || exp.notes || '').replace(/"/g, '""')}"`,
    ]);
  }

  // Add CSV BOM for excel encoding
  const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute('href', url);
  link.setAttribute('download', `depenses_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAllToCSV(events: EventItem[], expenses: Expense[]): void {
  const rows: string[][] = [
    ['--- SYNTHÈSE GLOBALE DE TOUS LES ÉVÉNEMENTS ---'],
    ['Date d\'exportation', new Date().toLocaleDateString('fr-FR')],
    ['Nombre d\'événements', String(events.length)],
    ['Nombre total de transactions', String(expenses.length)],
    [''],
    [
      'Événement',
      'Date',
      'Intitulé',
      'Catégorie',
      'Montant',
      'Devise',
      'Payeur',
      'Justificatif',
      'Organisateurs notifiés',
      'Commentaires',
    ],
  ];

  for (const exp of expenses) {
    const ev = events.find((e) => e.id === exp.eventId);
    rows.push([
      `"${ev ? ev.title : 'Inconnu'}"`,
      exp.date,
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      `"${exp.category}"`,
      exp.amount.toFixed(2),
      ev ? ev.currency : 'FCFA',
      `"${exp.payerName}"`,
      exp.receiptUrl ? 'Oui' : 'Non',
      `"${(exp.notifiedOrganizers || []).join(', ')}"`,
      `"${(exp.comments || exp.notes || '').replace(/"/g, '""')}"`,
    ]);
  }

  const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `toutes_depenses_eventspend_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEventToPDF(event: EventItem, expenses: Expense[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const eventExpenses = expenses.filter((e) => e.eventId === event.id);
  const budgetStatus = calculateEventBudgetStatus(event, eventExpenses);
  const categorySummary = calculateCategoryBreakdown(eventExpenses);
  const personBreakdown = calculatePersonBreakdown(event, eventExpenses);

  // Colors
  const primaryColor = [79, 70, 229]; // Indigo #4f46e5
  const darkTextColor = [30, 41, 59]; // Slate #1e293b
  const mutedTextColor = [100, 116, 139]; // Slate #64748b

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EventSpend — Rapport Officiel des Dépenses', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 23);

  // Event Meta Box
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(event.title, 14, 44);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text(`Dates: ${event.startDate} - ${event.endDate}  |  Lieu: ${event.location || 'Non précisé'}  |  Catégorie: ${event.category}`, 14, 50);
  
  if (event.organizers.length > 0) {
    const orgsText = `Organisateurs: ${event.organizers.map((o) => `${o.name} <${o.email}>`).join(', ')}`;
    doc.text(orgsText.length > 90 ? orgsText.substring(0, 87) + '...' : orgsText, 14, 55);
  }

  // KPI cards
  const cardY = 62;
  const cardW = 43;
  const cardH = 22;

  // Card 1: Budget
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('BUDGET ALLOUÉ', 17, cardY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(formatCurrency(event.totalBudget, event.currency), 17, cardY + 16);

  // Card 2: Dépenses
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(60, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('TOTAL DÉPENSÉ', 63, cardY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatCurrency(budgetStatus.totalSpent, event.currency), 63, cardY + 16);

  // Card 3: Solde
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(106, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text(budgetStatus.remaining >= 0 ? 'SOLDE RESTANT' : 'DÉPASSEMENT', 109, cardY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (budgetStatus.remaining >= 0) {
    doc.setTextColor(16, 185, 129); // emerald
  } else {
    doc.setTextColor(225, 29, 72); // rose
  }
  doc.text(formatCurrency(Math.abs(budgetStatus.remaining), event.currency), 109, cardY + 16);

  // Card 4: Consommation
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(152, cardY, cardW, cardH, 3, 3, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('TAUX CONSOMMATION', 155, cardY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`${budgetStatus.percentage.toFixed(1)}%`, 155, cardY + 16);

  let currentY = 92;

  // Table 1: Category Breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('1. Répartition par Catégorie', 14, currentY);

  const categoryTableData = categorySummary.map((c) => [
    c.category,
    String(c.count),
    formatCurrency(c.total, event.currency),
    `${c.percentage.toFixed(1)} %`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Catégorie', 'Nb Dépenses', 'Total Engagé', '% du Budget Consommé']],
    body: categoryTableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Table 2: Person Breakdown
  if (personBreakdown.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text('2. Répartition des Coûts par Personne', 14, currentY);

    const personTableData = personBreakdown.map((p) => [
      p.name,
      String(p.expensesCount),
      formatCurrency(p.paidAmount, event.currency),
      formatCurrency(p.fairShareAmount, event.currency),
      p.balance >= 0
        ? `+${formatCurrency(p.balance, event.currency)} (À recevoir)`
        : `${formatCurrency(p.balance, event.currency)} (À régler)`,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Participant', 'Nb Avances', 'Montant Payé', 'Quote-part Égale', 'Solde Net']],
      body: personTableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // Table 3: Detailed Expenses
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`3. Détail des Transactions (${eventExpenses.length})`, 14, currentY);

  const expensesTableData = eventExpenses.map((exp) => [
    exp.date,
    exp.title,
    exp.category,
    exp.payerName,
    exp.receiptUrl ? '✓ Oui' : '—',
    formatCurrency(exp.amount, event.currency),
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Date', 'Intitulé', 'Catégorie', 'Payeur', 'Preuve', 'Montant']],
    body: expensesTableData,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      5: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(
      `EventSpend PWA — Document généré le ${new Date().toLocaleDateString('fr-FR')} — Page ${i} sur ${pageCount}`,
      14,
      290
    );
  }

  const safeTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`rapport_${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
