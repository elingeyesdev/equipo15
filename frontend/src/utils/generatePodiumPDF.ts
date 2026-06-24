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
  PRODUCTIVIDAD: 'Productividad', COSTOS: 'Costos', CLIENTES: 'Clientes',
  EQUIPO: 'Equipo', CRECIMIENTO: 'Crecimiento', SOSTENIBILIDAD: 'Sostenibilidad',
  IMPACTO_SOCIAL: 'Impacto Social',
  OPTIMIZA: 'Optimiza', POTENCIA: 'Potencia', EXPANDE: 'Expande', TRANSFORMA: 'Transforma',
  FACIL_IMPLEMENTAR: 'Fácil de Implementar', REQUIERE_COORDINACION: 'Requiere Coordinación',
  REQUIERE_DESARROLLO: 'Requiere Desarrollo', REQUIERE_TRANSFORMACION: 'Requiere Transformación',
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
  doc.setFont('Inter', 'bold');
  doc.text('REPORTE EJECUTIVO', margin + 19, 14.6, { align: 'center' });

  // Main title
  setTextHex(doc, WHITE);
  doc.setFontSize(22);
  doc.setFont('Inter', 'bold');
  doc.text('Podio de Innovación', margin, 30);



  // Subline: challenge name
  setTextHex(doc, '#FFD4C4');
  doc.setFontSize(10);
  doc.setFont('Inter', 'normal');
  const challengeTitle = challenge.title ?? 'Reto sin título';
  const wrappedTitle = wrapText(doc, challengeTitle, contentW - 60);
  doc.text(wrappedTitle[0], margin, 40);

  // ── 3. Meta info bar ─────────────────────────────────────────────────────
  setFillHex(doc, '#F1F3F5');
  doc.rect(0, 52, pageW, 16, 'F');

  // Top border to separate from orange header slightly
  setDrawHex(doc, '#E5E7EB');
  doc.setLineWidth(0.5);
  doc.line(0, 52, pageW, 52); 

  setTextHex(doc, GRAY);
  doc.setFontSize(8);
  doc.setFont('Inter', 'normal');
  doc.text(`Generado el ${formatDate()}`, margin, 60);

  // Status badge (CERRADO)
  setFillHex(doc, GREEN);
  roundedRect(doc, pageW - margin - 28, 55, 28, 7, 3, 'F');
  setTextHex(doc, WHITE);
  doc.setFontSize(7.5);
  doc.setFont('Inter', 'bold');
  doc.text('CERRADO', pageW - margin - 14, 59.2, { align: 'center' });

  // Separator text
  setTextHex(doc, GRAY);
  doc.setFontSize(8);
  doc.setFont('Inter', 'normal');
  doc.text('·', pageW / 2, 60, { align: 'center' });
  doc.text(`${Math.min(winners.length, 3)} ganadores declarados`, pageW / 2 + 3, 60);

  // ── 4. Section label "Ranking Final" ─────────────────────────────────────
  let cursorY = 78;

  setTextHex(doc, GRAY);
  doc.setFontSize(9);
  doc.setFont('Inter', 'bold');
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
    doc.setFontSize(12);
    doc.setFont('Inter', 'bold');
    const titleMaxW = contentW - 35 - 28;
    const titleLines = wrapText(doc, idea.title ?? 'Sin título', titleMaxW);

    doc.setFontSize(8);
    doc.setFont('Inter', 'normal');
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
    
    const titleHeight = titleLines.length * 5;
    const proposalHeight = proposalLines.length * 4;
    const tagSpacing = hasTags ? 10 : 0;

    // Calculate dynamic card height to fit all content securely
    const dynamicContentHeight = 10 + titleHeight + 2 + 5 + 6 + 7 + proposalHeight + tagSpacing + 6;
    const cardH = Math.max(54, dynamicContentHeight);

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
    doc.setFont('Inter', 'bold');
    doc.text(medalLabel(idx), margin + 20, cardY + 16, { align: 'center', baseline: 'middle' });

    // Score badge
    if (idea.finalScore != null) {
      const scoreStr = idea.finalScore.toFixed(2);
      const scoreX = margin + contentW - 24;
      setFillHex(doc, color);
      roundedRect(doc, scoreX - 2, cardY + 8, 20, 10, 3, 'F');
      setTextHex(doc, WHITE);
      doc.setFontSize(9);
      doc.setFont('Inter', 'bold');
      doc.text(scoreStr, scoreX + 8, cardY + 14.5, { align: 'center' });

      setTextHex(doc, LIGHT_GRAY);
      doc.setFontSize(7);
      doc.setFont('Inter', 'normal');
      doc.text('pts', scoreX + 8, cardY + 21, { align: 'center' });
    }

    let localY = 14;
    const titleX = margin + 35;

    // Idea title
    setTextHex(doc, DARK);
    doc.setFontSize(12);
    doc.setFont('Inter', 'bold');
    titleLines.forEach((line, li) => {
      doc.text(line, titleX, cardY + localY + li * 5);
    });
    localY += titleHeight + 2;

    // Author
    const authorName = idea.author?.nickname || idea.author?.displayName || 'Participante';
    setTextHex(doc, LIGHT_GRAY);
    doc.setFontSize(8);
    doc.setFont('Inter', 'normal');
    doc.text(`Por ${authorName}`, titleX, cardY + localY);
    localY += 6;

    // Divider
    setDrawHex(doc, '#E5E7EB');
    doc.setLineWidth(0.3);
    doc.line(titleX, cardY + localY, margin + contentW - 5, cardY + localY);
    localY += 7;

    // Render full proposal text
    setTextHex(doc, GRAY);
    doc.setFontSize(8);
    if (proposalLines[0] === 'Descripción no disponible para esta idea.') {
      doc.setFont('Inter', 'italic');
      setTextHex(doc, LIGHT_GRAY);
    } else {
      doc.setFont('Inter', 'normal');
    }
    
    proposalLines.forEach((line, li) => {
      doc.text(line, titleX, cardY + localY + li * 4);
    });
    localY += proposalHeight + 4;

    // Render tags
    if (hasTags) {
      let tagX = titleX;
      
      doc.setFontSize(7);
      doc.setFont('Inter', 'normal');
      
      tagsToRender.forEach(tag => {
        const label = TAG_LABELS[tag] || tag;
        const tw = doc.getTextWidth(label);
        const padX = 4;
        const boxW = tw + padX * 2;
        const boxH = 5.5;

        // Draw tag bg
        setFillHex(doc, '#E5E7EB');
        roundedRect(doc, tagX, cardY + localY, boxW, boxH, 2.5, 'F');
        
        // Draw tag text (perfectly centered)
        setTextHex(doc, GRAY);
        doc.text(label, tagX + boxW / 2, cardY + localY + boxH / 2 + 0.3, { align: 'center', baseline: 'middle' });
        
        tagX += boxW + 4; // gap between tags
      });
    }

    cursorY += cardH + cardGap;
  });

  cursorY += 6;

  // ── 6. Summary box ───────────────────────────────────────────────────────
  // (Removed as requested)

  // ── 7. Footer ─────────────────────────────────────────────────────────────
  const footerY = pageH - 14;

  setFillHex(doc, '#F1F3F5');
  doc.rect(0, footerY - 6, pageW, 20, 'F');

  setDrawHex(doc, '#E5E7EB');
  doc.setLineWidth(0.4);
  doc.line(0, footerY - 6, pageW, footerY - 6);

  setTextHex(doc, LIGHT_GRAY);
  doc.setFontSize(7.5);
  doc.setFont('Inter', 'normal');
  doc.text('Generado automáticamente por Pista 8', margin, footerY);
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
