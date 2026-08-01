const PDFDocument = require('pdfkit');

const COLORS = { ink: '#20281F', muted: '#687164', accent: '#486B50', line: '#DCDDD5', warning: '#B85735' };

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

function addSection(doc, title) {
  if (doc.y > 685) doc.addPage();
  doc.moveDown(1.2).font('Helvetica-Bold').fontSize(10).fillColor(COLORS.accent).text(title.toUpperCase(), { characterSpacing: 1.2 });
  doc.moveTo(48, doc.y + 6).lineTo(547, doc.y + 6).strokeColor(COLORS.line).stroke();
  doc.moveDown(1);
}

function createSprintReport(sprint) {
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true, info: { Title: `Relatório - ${sprint.name}`, Author: 'My Sprint Tracker' } });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.accent).text('MY SPRINT TRACKER', { characterSpacing: 1.4 });
  doc.moveDown(.55).font('Helvetica-Bold').fontSize(26).fillColor(COLORS.ink).text(sprint.name);
  doc.moveDown(.35).font('Helvetica').fontSize(10).fillColor(COLORS.muted).text(`Relatório gerado em ${formatDate(new Date().toISOString())} - ${sprint.days.length} dias planejados`);

  addSection(doc, 'Resumo diário');
  sprint.days.forEach((day, index) => {
    if (doc.y > 700) doc.addPage();
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.ink).text(`Dia ${index + 1} - ${formatDate(day.date)}`);
    doc.moveDown(.18).font('Helvetica').fontSize(9.5).fillColor(day.summary ? COLORS.ink : COLORS.muted).text(day.summary || 'Sem registro para este dia.', { lineGap: 2 });
    doc.moveDown(.72);
  });

  addSection(doc, 'Anotações gerais');
  if (!sprint.annotations.length) {
    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(COLORS.muted).text('Nenhuma anotação registrada.');
  } else {
    sprint.annotations.forEach((annotation) => {
      if (doc.y > 700) doc.addPage();
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.ink).text(annotation.content, { lineGap: 3 });
      doc.moveDown(.8);
    });
  }

  addSection(doc, 'Pontos de atenção');
  if (!sprint.attentionPoints.length) {
    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(COLORS.muted).text('Nenhum ponto de atenção registrado.');
  } else {
    sprint.attentionPoints.forEach((point) => {
      if (doc.y > 690) doc.addPage();
      const status = point.resolved ? 'Resolvido' : point.overdue ? 'Em aberto - mais de 3 dias' : 'Em aberto';
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.ink).text(point.title);
      doc.moveDown(.15).font('Helvetica').fontSize(9).fillColor(point.overdue ? COLORS.warning : COLORS.muted).text(status);
      if (point.description) doc.moveDown(.15).font('Helvetica').fillColor(COLORS.ink).text(point.description, { lineGap: 2 });
      if (point.resolution) doc.moveDown(.2).font('Helvetica-Bold').fillColor(COLORS.accent).text(`Resolução: ${point.resolution}`, { lineGap: 2 });
      doc.moveDown(.75);
    });
  }

  const pageCount = doc.bufferedPageRange().count;
  for (let page = 0; page < pageCount; page += 1) {
    doc.switchToPage(page);
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted).text(`Página ${page + 1} de ${pageCount}`, 48, 794, { align: 'center', width: 499 });
  }
  return doc;
}

module.exports = { createSprintReport };
