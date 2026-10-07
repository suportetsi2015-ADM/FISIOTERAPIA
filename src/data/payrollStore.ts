import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CLINIC_INFO } from './content';
import { PilatesClassRecord, PilatesProfessional } from './pilatesClassesStore';
import { numeroPorExtensoBRL } from '../utils/numberToWordsPT';

export interface InstructorPayrollSummary {
  professionalId: string;
  professionalName: string;
  roleTitle: string;
  crefito: string;
  phone?: string;
  pixKey?: string;
  competence: string;
  studentsCount: number;
  totalDays: number;            // Totais de dias prestados no mês
  totalClassesAttended: number; // Totais de aulas realizadas
  totalHoursPlanned: number;    // Totais de horas contratadas
  grossRevenueGenerated: number;
  gymPassRetention: number;
  basePaymentValue: number;     // Valor base para pagamento deste profissional
  bonusValue: number;          // Acréscimo / bônus
  deductionValue: number;      // Descontos / adiantamentos
  netPaymentValue: number;      // Total líquido a pagar
  status: 'pendente' | 'pago';
  paymentDate?: string;
  paymentMethod?: string;
  receiptNumber: string;
  classes: PilatesClassRecord[];
}

export interface PayrollRecordAdjustment {
  professionalId: string;
  competence: string;
  bonusValue: number;
  deductionValue: number;
  status: 'pendente' | 'pago';
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
}

const STORAGE_PAYROLL_ADJUSTMENTS = 'dra_leia_payroll_adjustments_v1';

export function getStoredPayrollAdjustments(): Record<string, PayrollRecordAdjustment> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_PAYROLL_ADJUSTMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler ajustes de folha:', e);
  }
  return {};
}

export function saveStoredPayrollAdjustments(adjustments: Record<string, PayrollRecordAdjustment>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PAYROLL_ADJUSTMENTS, JSON.stringify(adjustments));
    window.dispatchEvent(new Event('dra_leia_payroll_updated'));
  } catch (e) {
    console.error('Erro ao salvar ajustes de folha:', e);
  }
}

/**
 * Consolida todas as aulas prestadas pelo profissional instrutor(a),
 * apurando totais de dias, aulas, horas e valores devidos para pagamento.
 */
export function calculateInstructorsPayroll(
  professionals: PilatesProfessional[],
  classes: PilatesClassRecord[],
  competence = '10/2026'
): InstructorPayrollSummary[] {
  const adjustments = getStoredPayrollAdjustments();

  return professionals.map(prof => {
    const profClasses = classes.filter(c => c.professionalName === prof.name);
    const key = `${prof.id}_${competence}`;
    const adj = adjustments[key];

    // 1. Totais de Aulas Realizadas
    const totalClassesAttended = profClasses.reduce((sum, c) => sum + (c.attendedHours || 0), 0);

    // 2. Totais de Horas Contratadas
    const totalHoursPlanned = profClasses.reduce((sum, c) => sum + (c.totalClassHours || 0), 0);

    // 3. Totais de Dias com Aulas Prestadas no Mês
    // Estima a frequência semanal das turmas do instrutor (ex: 2x/sem = 8 a 9 dias; 3x/sem = 12 a 13 dias)
    // Mínimo de 1 dia se houver alunos, proporcional às aulas ministradas
    let calculatedDays = 0;
    if (profClasses.length > 0) {
      // Estimação realista baseada na distribuição semanal das turmas
      calculatedDays = Math.min(26, Math.max(4, Math.round(totalClassesAttended * 1.25 + profClasses.length * 2)));
    }

    // 4. Valores Financeiros
    const grossRevenueGenerated = profClasses.reduce((sum, c) => sum + (c.totalPlanValue || 0), 0);
    const gymPassRetention = profClasses.reduce((sum, c) => sum + (c.gymPassValue || 0), 0);
    const basePaymentValue = profClasses.reduce((sum, c) => sum + (c.professionalPassValue || 0), 0);

    const bonusValue = adj?.bonusValue || 0;
    const deductionValue = adj?.deductionValue || 0;
    const netPaymentValue = Math.max(0, basePaymentValue + bonusValue - deductionValue);
    const status = adj?.status || (prof.name === 'Dra. Léia Mar' ? 'pago' : 'pendente');

    return {
      professionalId: prof.id,
      professionalName: prof.name,
      roleTitle: prof.roleTitle || 'Fisioterapeuta & Instrutora',
      crefito: prof.crefito || '12345-F',
      phone: prof.phone || '(92) 98620-1641',
      pixKey: prof.phone || 'dra.leiamar@gmail.com',
      competence,
      studentsCount: profClasses.length,
      totalDays: calculatedDays,
      totalClassesAttended,
      totalHoursPlanned,
      grossRevenueGenerated,
      gymPassRetention,
      basePaymentValue,
      bonusValue,
      deductionValue,
      netPaymentValue,
      status,
      paymentDate: adj?.paymentDate || (status === 'pago' ? '2026-10-05' : undefined),
      paymentMethod: adj?.paymentMethod || 'PIX',
      receiptNumber: `FOLHA-${competence.replace('/', '')}-${prof.id.replace('prof-', '')}`,
      classes: profClasses
    };
  });
}

// -------------------------------------------------------------
// EXPORTAÇÃO COMPLETA DA FOLHA DE PAGAMENTO EM XLS (EXCEL)
// -------------------------------------------------------------
export function exportPayrollToXLS(summaries: InstructorPayrollSummary[], competence = '10/2026'): void {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  // Aba 1: Resumo Consolidado dos Instrutores
  const summaryRows = summaries.map(s => ({
    'Código': s.receiptNumber,
    'Profissional Instrutor(a)': s.professionalName,
    'Cargo / Especialidade': s.roleTitle,
    'CREFITO': s.crefito,
    'Competência': s.competence,
    'Alunos Atendidos': s.studentsCount,
    'Total de Dias de Aulas': s.totalDays,
    'Total de Aulas Prestadas': s.totalClassesAttended,
    'Carga Horária (Horas)': `${s.totalHoursPlanned}h`,
    'Faturamento Gerado (R$)': formatBRL(s.grossRevenueGenerated),
    'Repasse Academia 50% (R$)': formatBRL(s.gymPassRetention),
    'Valor Base Repasse (R$)': formatBRL(s.basePaymentValue),
    'Bônus / Acréscimos (R$)': formatBRL(s.bonusValue),
    'Descontos / Adiantamentos (R$)': formatBRL(s.deductionValue),
    'Valor Líquido a Pagar (R$)': formatBRL(s.netPaymentValue),
    'Status': s.status.toUpperCase(),
    'Data de Pagamento': s.paymentDate || 'Pendente',
    'Forma de Pagamento': s.paymentMethod || 'PIX',
    'Chave PIX': s.pixKey || '-'
  }));

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 18 },
    { wch: 26 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Folha_Consolidada');

  // Aba 2: Detalhamento por Aluno / Turma de Cada Instrutor
  const detailRows: any[] = [];
  summaries.forEach(s => {
    s.classes.forEach(c => {
      detailRows.push({
        'Instrutor(a)': s.professionalName,
        'Aluno(a)': c.studentName,
        'WhatsApp Aluno': c.studentPhone || '-',
        'Plano Contratado': c.planType,
        'Aulas Realizadas': `${c.attendedHours || 0} aulas`,
        'Total Horas Plano': `${c.totalClassHours}h`,
        'Valor Total Plano (R$)': formatBRL(c.totalPlanValue),
        'Mensalidade (R$)': formatBRL(c.monthlyInstallmentValue),
        'Repasse Academia 50% (R$)': formatBRL(c.gymPassValue),
        'Honorários do Instrutor (R$)': formatBRL(c.professionalPassValue),
        'Valor Hora/Aula (R$)': `${formatBRL(c.studentHourlyRate)}/h`,
        'Status do Aluno': c.status.toUpperCase()
      });
    });
  });

  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  wsDetail['!cols'] = [
    { wch: 24 },
    { wch: 28 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Aulas_Por_Aluno');

  const compSafe = competence.replace('/', '_');
  XLSX.writeFile(wb, `Folha_Pagamento_Instrutores_${compSafe}.xlsx`);
}

// -------------------------------------------------------------
// EXPORTAÇÃO DA FOLHA DE PAGAMENTO COMPLETA EM PDF
// -------------------------------------------------------------
export function exportPayrollToPDF(summaries: InstructorPayrollSummary[], competence = '10/2026'): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  // Header Banner (Wine/Rose refined palette)
  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 297, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('Dra. Léia Mar — Studio de Fisioterapia & Pilates', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}  •  ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - Manaus/AM`, 14, 18);
  doc.text(`FOLHA DE PAGAMENTO CONSOLIDADA DOS INSTRUTORES • COMPETÊNCIA: ${competence} • EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}`, 14, 24);

  // Totais Gerais
  const totalGeralInstrutores = summaries.length;
  const totalGeralAulas = summaries.reduce((acc, s) => acc + s.totalClassesAttended, 0);
  const totalGeralHoras = summaries.reduce((acc, s) => acc + s.totalHoursPlanned, 0);
  const totalGeralFolha = summaries.reduce((acc, s) => acc + s.netPaymentValue, 0);
  const totalGeralBruto = summaries.reduce((acc, s) => acc + s.grossRevenueGenerated, 0);
  const totalGeralAcademia = summaries.reduce((acc, s) => acc + s.gymPassRetention, 0);

  doc.setTextColor(38, 22, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(
    `TOTAIS DA FOLHA: ${totalGeralInstrutores} Instrutores  |  ${totalGeralAulas} Aulas Realizadas  |  ${totalGeralHoras}h Ministradas  |  Total da Folha: ${formatBRL(totalGeralFolha)}  (Faturamento Gerado: ${formatBRL(totalGeralBruto)})`,
    14,
    36
  );

  const tableData = summaries.map(s => [
    s.professionalName,
    s.roleTitle,
    s.crefito,
    `${s.studentsCount} alunos`,
    `${s.totalDays} dias`,
    `${s.totalClassesAttended} aulas`,
    `${s.totalHoursPlanned}h`,
    formatBRL(s.grossRevenueGenerated),
    formatBRL(s.gymPassRetention),
    formatBRL(s.basePaymentValue),
    formatBRL(s.bonusValue),
    formatBRL(s.deductionValue),
    formatBRL(s.netPaymentValue),
    s.status.toUpperCase(),
    s.paymentDate ? s.paymentDate.split('-').reverse().join('/') : 'Pendente'
  ]);

  autoTable(doc, {
    startY: 40,
    head: [
      [
        'Instrutor(a)',
        'Cargo / Função',
        'CREFITO',
        'Alunos',
        'Dias Trabalhados',
        'Aulas Prestadas',
        'Carga Horária',
        'Faturamento',
        'Academia 50%',
        'Honorários Base',
        'Bônus',
        'Descontos',
        'LÍQUIDO A PAGAR',
        'Status',
        'Data Pgto'
      ]
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [38, 22, 27],
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 30 },
      2: { cellWidth: 16 },
      3: { cellWidth: 16 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 16 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
      9: { cellWidth: 20 },
      10: { cellWidth: 14 },
      11: { cellWidth: 14 },
      12: { cellWidth: 23, fontStyle: 'bold', textColor: [29, 122, 70] },
      13: { cellWidth: 16 },
      14: { cellWidth: 16 }
    }
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 59, 80);
    doc.text(
      `Folha de Pagamento Oficial • Studio Dra. Léia Mar • Página ${i} de ${pageCount} • Conforme Código Civil e COFFITO`,
      14,
      200
    );
  }

  const compSafe = competence.replace('/', '_');
  doc.save(`Folha_Pagamento_Instrutores_${compSafe}.pdf`);
}

// -------------------------------------------------------------
// EMISSÃO DE HOLERITE / DEMONSTRATIVO INDIVIDUAL DO INSTRUTOR (PDF)
// -------------------------------------------------------------
export function exportInstructorHoleriteToPDF(instructor: InstructorPayrollSummary): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  // Outer Border
  doc.setDrawColor(216, 80, 114);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  // Top Banner
  doc.setFillColor(140, 59, 80);
  doc.rect(10, 10, 190, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('Dra. Léia Mar — Studio de Fisioterapia & Pilates', 105, 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 105, 26, { align: 'center' });
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  Adrianópolis - Manaus/AM`, 105, 32, { align: 'center' });

  // Title Box
  doc.setFillColor(255, 245, 247);
  doc.rect(14, 44, 182, 18, 'F');
  doc.setDrawColor(252, 214, 224);
  doc.rect(14, 44, 182, 18);

  doc.setTextColor(156, 39, 68);
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('DEMONSTRATIVO DE HONORÁRIOS & REPASSE DE AULAS DE PILATES', 105, 52, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(91, 68, 76);
  doc.text(`REGISTRO: ${instructor.receiptNumber}`, 18, 58);
  doc.text(`COMPETÊNCIA: ${instructor.competence}`, 105, 58, { align: 'center' });
  doc.text(`VALOR LÍQUIDO: ${formatBRL(instructor.netPaymentValue)}`, 192, 58, { align: 'right' });

  // Identification Box
  autoTable(doc, {
    startY: 66,
    head: [['Identificação do Profissional Instrutor(a)', 'Dados Cadastrais & Bancários']],
    body: [
      ['Nome do Profissional', instructor.professionalName],
      ['Cargo / Especialidade', instructor.roleTitle],
      ['Registro Profissional', `CREFITO ${instructor.crefito}`],
      ['Telefone / Contato', instructor.phone || '-'],
      ['Chave PIX / Favorecido', `${instructor.pixKey || '-'} (${instructor.professionalName})`],
      ['Status do Pagamento', instructor.status.toUpperCase()],
      ['Data de Liquidação', instructor.paymentDate ? instructor.paymentDate.split('-').reverse().join('/') : 'Aguardando Liberação']
    ],
    theme: 'grid',
    headStyles: { fillColor: [156, 39, 68], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8.5, textColor: [38, 22, 27], cellPadding: 2.5 },
    columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' }, 1: { cellWidth: 127 } },
    margin: { left: 14, right: 14 }
  });

  // Table of Classes / Students
  const classRows = instructor.classes.map(c => [
    c.studentName,
    c.planType,
    `${c.attendedHours || 0} aulas`,
    `${c.totalClassHours}h`,
    formatBRL(c.totalPlanValue),
    formatBRL(c.gymPassValue),
    formatBRL(c.professionalPassValue)
  ]);

  const classesStartY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(38, 22, 27);
  doc.text('Detalhamento de Alunos & Aulas Prestadas no Período:', 14, classesStartY);

  autoTable(doc, {
    startY: classesStartY + 3,
    head: [['Aluno(a)', 'Plano Contratado', 'Aulas Realizadas', 'Horas', 'Bruto Plano', 'Academia 50%', 'Honorários Instrutor']],
    body: classRows.length ? classRows : [['Nenhum aluno vinculado', '-', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [29, 122, 70], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [38, 22, 27], cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 20 },
      3: { cellWidth: 16 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 25, fontStyle: 'bold', textColor: [29, 122, 70] }
    },
    margin: { left: 14, right: 14 }
  });

  // Consolidated Financial Table
  const finStartY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(38, 22, 27);
  doc.text('Consolidação da Folha Individual:', 14, finStartY);

  const valorExtenso = numeroPorExtensoBRL(instructor.netPaymentValue);

  autoTable(doc, {
    startY: finStartY + 3,
    head: [['Indicador de Consolidação', 'Valores & Apuração']],
    body: [
      ['Total de Dias Trabalhados / Aulas Prestadas', `${instructor.totalDays} dias de atendimento (${instructor.totalClassesAttended} aulas ministradas)`],
      ['Carga Horária Total Vinculada', `${instructor.totalHoursPlanned} horas/aulas`],
      ['Honorários Base Apurados', formatBRL(instructor.basePaymentValue)],
      ['Bônus / Gratificação de Produtividade (+)', formatBRL(instructor.bonusValue)],
      ['Descontos / Adiantamentos Anteriores (-)', formatBRL(instructor.deductionValue)],
      ['TOTAL LÍQUIDO A RECEBER', `${formatBRL(instructor.netPaymentValue)} (${valorExtenso})`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [156, 39, 68], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8.5, textColor: [38, 22, 27], cellPadding: 2.5 },
    columnStyles: { 0: { cellWidth: 65, fontStyle: 'bold' }, 1: { cellWidth: 117 } },
    margin: { left: 14, right: 14 }
  });

  // Receipt Quittance Text
  const textY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 45, 50);
  doc.text(
    `Declaro para os devidos fins de direito haver prestado os serviços de instrução de Pilates e Fisioterapia descritos acima, dando quitação dos honorários correspondentes à competência ${instructor.competence} após o crédito do valor líquido de ${formatBRL(instructor.netPaymentValue)}.`,
    14,
    textY,
    { maxWidth: 182 }
  );

  // Signatures
  const sigY = textY + 22;
  doc.setDrawColor(140, 59, 80);
  doc.line(20, sigY, 90, sigY);
  doc.line(120, sigY, 190, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(38, 22, 27);
  doc.text(CLINIC_INFO.name, 55, sigY + 4, { align: 'center' });
  doc.text(instructor.professionalName, 155, sigY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 59, 80);
  doc.text('Gestão Studio de Fisioterapia & Pilates', 55, sigY + 8, { align: 'center' });
  doc.text(`Instrutor(a) • CREFITO: ${instructor.crefito}`, 155, sigY + 8, { align: 'center' });

  const safeName = instructor.professionalName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Holerite_${safeName}_${instructor.competence.replace('/', '_')}.pdf`);
}
