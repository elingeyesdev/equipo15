import jsPDF from 'jspdf';

interface PodiumIdea {
  id: string;
  title: string;
  problem?: string;
  solution?: string;
  impactArea?: string;
  improvementType?: string;
  effortLevel?: string;
  finalScore?: number;
  author?: {
    displayName?: string;
    nickname?: string;
  };
  podiumPosition?: number;
}

interface ChallengeData {
  title?: string;
  problemDescription?: string;
  companyContext?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations for Tags
// ─────────────────────────────────────────────────────────────────────────────
const TAG_LABELS: Record<string, string> = {
  PRODUCTIVITY: 'Productividad', COSTS: 'Costos', CUSTOMERS: 'Clientes',
  TEAM: 'Equipo', GROWTH: 'Crecimiento', SUSTAINABILITY: 'Sostenibilidad',
  SOCIAL_IMPACT: 'Impacto Social',
  OPTIMIZES: 'Optimiza', ENHANCES: 'Potencia', EXPANDS: 'Expande', TRANSFORMS: 'Transforma',
  EASY: 'Fácil de Implementar', COORDINATION: 'Requiere Coordinación',
  DEVELOPMENT: 'Requiere Desarrollo', TRANSFORMATION: 'Requiere Transformación',
};

// ─────────────────────────────────────────────────────────────────────────────
// Color palette (Pista 8 brand)
// ─────────────────────────────────────────────────────────────────────────────
const ORANGE     = '#FE410A';
const DARK       = '#1A1F22';
const GRAY       = '#485054';
const LIGHT_GRAY = '#9CA3AF';
const BG_CARD    = '#F8F9FA';
const GOLD       = '#F59E0B';
const SILVER     = '#94A3B8';
const BRONZE     = '#D97706';
const WHITE      = '#FFFFFF';
const GREEN      = '#16A34A';

// jsPDF type helper not needed for hex anymore

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function setFillHex(doc: jsPDF, color: string) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  doc.setFillColor(r, g, b);
}

function setTextHex(doc: jsPDF, color: string) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  doc.setTextColor(r, g, b);
}

function setDrawHex(doc: jsPDF, color: string) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  doc.setDrawColor(r, g, b);
}

/** Wrap text at a max width and return lines */
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

/** Draw a rounded rectangle (jsPDF 2.x supports roundedRect) */
function roundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, style: 'F' | 'FD' | 'D' = 'F') {
  doc.roundedRect(x, y, w, h, r, r, style);
}

/** Medal character for position */
const medalLabel = (pos: number) => ['1°', '2°', '3°'][pos] ?? `${pos + 1}°`;
const medalColor = (pos: number): string => [GOLD, SILVER, BRONZE][pos] ?? GRAY;

const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────────────────────
export function generatePodiumPDF(challenge: ChallengeData, winners: PodiumIdea[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const contentW = pageW - margin * 2;

  // ── 1. Header background (gradient simulation with two rects) ─────────────
  setFillHex(doc, ORANGE);
  doc.rect(0, 0, pageW, 52, 'F');

  // Subtle accent stripe at top
  setFillHex(doc, '#E03000');
  doc.rect(0, 0, pageW, 3, 'F');

  // ── 2. Header text ───────────────────────────────────────────────────────
  // Badge chip top-left
  setFillHex(doc, 'rgba(255,255,255,0.18)'.includes('rgba') ? '#CC3308' : '#CC3308');
  roundedRect(doc, margin, 10, 38, 7, 3, 'F');
  setTextHex(doc, WHITE);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE EJECUTIVO', margin + 19, 14.6, { align: 'center' });

  // Main title
  setTextHex(doc, WHITE);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Podio de Innovación', margin, 30);

  // Platform tag (right aligned)
  setTextHex(doc, 'rgba(255,255,255,0.85)'.includes('rgba') ? '#FFD4C4' : '#FFD4C4');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('pista8.com', pageW - margin, 30, { align: 'right' });

  // Subline: challenge name
  setTextHex(doc, '#FFD4C4');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const challengeTitle = challenge.title ?? 'Reto sin título';
  const wrappedTitle = wrapText(doc, challengeTitle, contentW - 60);
  doc.text(wrappedTitle[0], margin, 40);

  // ── 3. Meta info bar ─────────────────────────────────────────────────────
  setFillHex(doc, '#1A1F22');
  doc.rect(0, 52, pageW, 16, 'F');

  setTextHex(doc, LIGHT_GRAY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${formatDate()}`, margin, 60);

  // Status badge (CERRADO)
  setFillHex(doc, GREEN);
  roundedRect(doc, pageW - margin - 28, 55, 28, 7, 3, 'F');
  setTextHex(doc, WHITE);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CERRADO', pageW - margin - 14, 59.2, { align: 'center' });

  // Separator text
  setTextHex(doc, '#6B7280');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('·', pageW / 2, 60, { align: 'center' });
  doc.text(`${Math.min(winners.length, 3)} ganadores declarados`, pageW / 2 + 3, 60);

  // ── 4. Section label "Ranking Final" ─────────────────────────────────────
  let cursorY = 78;

  setTextHex(doc, GRAY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RANKING FINAL', margin, cursorY);

  // Underline accent
  setDrawHex(doc, ORANGE);
  doc.setLineWidth(1.2);
  doc.line(margin, cursorY + 2, margin + 28, cursorY + 2);
  cursorY += 10;

  // ── 5. Winner cards ───────────────────────────────────────────────────────
  const cardGap = 8;

  winners.slice(0, 3).forEach((idea, idx) => {
    const color = medalColor(idx);

    // Calculate dynamic height based on text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const proposalLines: string[] = [];
    if (idea.problem) {
      proposalLines.push(...wrapText(doc, idea.problem, contentW - 40));
    } else {
      proposalLines.push('Descripción no disponible para esta idea.');
    }

    const tagsToRender: string[] = [];
    if (idea.impactArea) tagsToRender.push(idea.impactArea);
    if (idea.improvementType) tagsToRender.push(idea.improvementType);
    if (idea.effortLevel) tagsToRender.push(idea.effortLevel);

    const hasTags = tagsToRender.length > 0;
    const tagSpacing = hasTags ? 10 : 0; // extra space for tags at the bottom

    const textHeight = proposalLines.length * 4; // 4mm per line
    const cardH = Math.max(54, 33 + textHeight + tagSpacing + 6); // Base 33 for header + text + padding

    // Check page overflow
    if (cursorY + cardH > pageH - 25) {
      doc.addPage();
      cursorY = 20;
      // Draw border on new page
      setDrawHex(doc, ORANGE);
      doc.setLineWidth(2);
      doc.line(0, 0, 0, pageH);
      doc.line(pageW, 0, pageW, pageH);
    }

    const cardY = cursorY;

    // Card background
    setFillHex(doc, BG_CARD);
    roundedRect(doc, margin, cardY, contentW, cardH, 5, 'F');

    // Left color bar (medal color)
    setFillHex(doc, color);
    roundedRect(doc, margin, cardY, 5, cardH, 3, 'F');
    // Cover right half of bar radius so it's flush with card
    doc.rect(margin + 3, cardY, 2, cardH, 'F');

    // Medal circle
    setFillHex(doc, color);
    doc.circle(margin + 20, cardY + 16, 8, 'F');
    setTextHex(doc, WHITE);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(medalLabel(idx), margin + 20, cardY + 16, { align: 'center', baseline: 'middle' });

    // Idea title
    const titleX = margin + 35;
    const titleMaxW = contentW - 35 - 28;
    setTextHex(doc, DARK);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const titleLines = wrapText(doc, idea.title ?? 'Sin título', titleMaxW);
    doc.text(titleLines[0], titleX, cardY + 14);

    // Author
    const authorName = idea.author?.nickname || idea.author?.displayName || 'Participante';
    setTextHex(doc, LIGHT_GRAY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Por ${authorName}`, titleX, cardY + 21);

    // Score badge
    if (idea.finalScore != null) {
      const scoreStr = idea.finalScore.toFixed(2);
      const scoreX = margin + contentW - 24;
      setFillHex(doc, color);
      roundedRect(doc, scoreX - 2, cardY + 8, 20, 10, 3, 'F');
      setTextHex(doc, WHITE);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(scoreStr, scoreX + 8, cardY + 14.5, { align: 'center' });

      setTextHex(doc, LIGHT_GRAY);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('pts', scoreX + 8, cardY + 21, { align: 'center' });
    }

    // Divider
    setDrawHex(doc, '#E5E7EB');
    doc.setLineWidth(0.3);
    doc.line(titleX, cardY + 26, margin + contentW - 5, cardY + 26);

    // Render full proposal text
    setTextHex(doc, GRAY);
    doc.setFontSize(8);
    if (proposalLines[0] === 'Descripción no disponible para esta idea.') {
      doc.setFont('helvetica', 'italic');
      setTextHex(doc, LIGHT_GRAY);
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    proposalLines.forEach((line, li) => {
      doc.text(line, titleX, cardY + 33 + li * 4);
    });

    // Render tags
    if (hasTags) {
      let tagX = titleX;
      const tagY = cardY + 33 + proposalLines.length * 4 + 4; // Below text
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      tagsToRender.forEach(tag => {
        const label = TAG_LABELS[tag] || tag;
        const tw = doc.getTextWidth(label);
        const padX = 4;
        const boxW = tw + padX * 2;
        const boxH = 5.5;

        // Draw tag bg
        setFillHex(doc, '#E5E7EB');
        roundedRect(doc, tagX, tagY, boxW, boxH, 2.5, 'F');
        
        // Draw tag text (perfectly centered)
        setTextHex(doc, GRAY);
        doc.text(label, tagX + boxW / 2, tagY + boxH / 2 + 0.3, { align: 'center', baseline: 'middle' });
        
        tagX += boxW + 4; // gap between tags
      });
    }

    cursorY += cardH + cardGap;
  });

  cursorY += 6;

  // ── 6. Summary box ───────────────────────────────────────────────────────
  if (cursorY + 28 < pageH - 30) {
    setFillHex(doc, '#FFF7ED');
    setDrawHex(doc, '#FED7AA');
    roundedRect(doc, margin, cursorY, contentW, 22, 4, 'FD');

    setTextHex(doc, '#C2410C');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen del proceso', margin + 6, cursorY + 8);

    setTextHex(doc, '#9A3412');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const summaryText =
      'Los finalistas fueron seleccionados por interacción social y evaluados por jueces mediante ' +
      'rúbricas técnicas ponderadas. El puntaje final refleja la evaluación experta consolidada.';
    const summaryLines = wrapText(doc, summaryText, contentW - 12);
    summaryLines.slice(0, 2).forEach((line, i) => {
      doc.text(line, margin + 6, cursorY + 15 + i * 5);
    });
    cursorY += 30;
  }

  // ── 7. Footer ─────────────────────────────────────────────────────────────
  const footerY = pageH - 14;

  setFillHex(doc, '#F1F3F5');
  doc.rect(0, footerY - 6, pageW, 20, 'F');

  setDrawHex(doc, '#E5E7EB');
  doc.setLineWidth(0.4);
  doc.line(0, footerY - 6, pageW, footerY - 6);

  setTextHex(doc, LIGHT_GRAY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Generado automáticamente por Pista 8 · pista8.com', margin, footerY);
  doc.text(`© ${new Date().getFullYear()} Pista 8. Todos los derechos reservados.`, pageW - margin, footerY, { align: 'right' });

  // ── 8. Page border accent ─────────────────────────────────────────────────
  setDrawHex(doc, ORANGE);
  doc.setLineWidth(2);
  doc.line(0, 0, 0, pageH);       // left border
  doc.line(pageW, 0, pageW, pageH); // right border

  // ── 9. Save ───────────────────────────────────────────────────────────────
  const safeName = (challenge.title ?? 'podio')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);

  doc.save(`reporte-podio-${safeName}.pdf`);
}
