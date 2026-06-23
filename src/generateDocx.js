import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  HeadingLevel, PageOrientation
} from 'docx';
import { saveAs } from 'file-saver';

const NAVY = '003087';
const NAVY_DARK = '001f5b';
const WHITE = 'FFFFFF';
const LIGHT_GRAY = 'F2F4F8';
const MID_GRAY = 'E2E8F0';
const DARK_GRAY = '475569';

function fmt(n) {
  return Math.round(n).toLocaleString('es-CO');
}

function cell(children, opts = {}) {
  return new TableCell({
    children,
    borders: opts.borders || noBorders(),
    shading: opts.shading,
    verticalAlign: opts.valign || VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    columnSpan: opts.span,
    ...opts.extra
  });
}

function noBorders() {
  const b = { style: BorderStyle.NONE, size: 0, color: 'auto' };
  return { top: b, bottom: b, left: b, right: b };
}

function thinBorder(color = 'CCCCCC') {
  const b = { style: BorderStyle.SINGLE, size: 4, color };
  return { top: b, bottom: b, left: b, right: b };
}

function bottomBorder(color = NAVY) {
  const none = { style: BorderStyle.NONE, size: 0, color: 'auto' };
  return { top: none, bottom: { style: BorderStyle.SINGLE, size: 12, color }, left: none, right: none };
}

function txt(text, opts = {}) {
  return new TextRun({
    text: String(text),
    font: 'Calibri',
    size: opts.size || 20,
    bold: opts.bold || false,
    color: opts.color || '000000',
    italics: opts.italic || false,
  });
}

function para(runs, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 0, after: opts.after || 40 },
    border: opts.border,
    children: Array.isArray(runs) ? runs : [runs],
  });
}

export async function generateDocx(cotizacion) {
  const { cliente, items, porcentajes, numero, fecha } = cotizacion;

  const subtotal = items.reduce((s, it) => s + it.cant * it.precio, 0);
  const vAdmin = subtotal * (porcentajes.admin / 100);
  const vImprev = subtotal * (porcentajes.imprev / 100);
  const vUtil = subtotal * (porcentajes.util / 100);
  const vIva = vUtil * (porcentajes.iva / 100);
  const total = subtotal + vAdmin + vImprev + vUtil + vIva;

  // ── HEADER TABLE (logo area + contact info) ──────────────────────────
  const headerTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [4500, 5000],
    borders: { ...Object.fromEntries(['top','bottom','left','right','insideH','insideV'].map(k=>[k,{style:BorderStyle.NONE,size:0,color:'auto'}])) },
    rows: [
      new TableRow({
        children: [
          cell([
            para([txt('REDES COLOMBIA', { bold: true, size: 36, color: NAVY_DARK })]),
            para([txt('INGENIERÍA S.A.S', { bold: true, size: 22, color: NAVY })]),
            para([txt('SOLUCIONES QUE CONECTAN', { size: 16, color: DARK_GRAY, italic: true })]),
          ], { borders: noBorders() }),
          cell([
            para([txt('www.redescolombia.com.co', { size: 18, color: NAVY })], { before: 40 }),
            para([txt('info@redescolombia.com.co', { size: 18, color: NAVY })]),
            para([txt('+57 320 345 8316', { size: 18, color: '222222' })]),
            para([txt('Bogotá, Colombia', { size: 18, color: '222222' })]),
            para([txt('@redescolombiaingenieriasas', { size: 18, color: NAVY })]),
          ], { borders: noBorders() }),
        ]
      })
    ]
  });

  // ── SEPARATOR LINE ───────────────────────────────────────────────────
  const separator = para([], { border: bottomBorder(NAVY), before: 100, after: 100 });

  // ── CLIENT + DATE TABLE ───────────────────────────────────────────────
  const clientTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [5500, 4000],
    borders: { ...Object.fromEntries(['top','bottom','left','right','insideH','insideV'].map(k=>[k,{style:BorderStyle.NONE,size:0,color:'auto'}])) },
    rows: [
      new TableRow({
        children: [
          cell([
            para([txt('DATOS DEL CLIENTE', { bold: true, size: 22, color: WHITE })], { align: AlignmentType.LEFT }),
          ], {
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            borders: noBorders(),
            extra: { margins: { top: 120, bottom: 120, left: 160, right: 160 } }
          }),
          cell([
            para([txt('FECHA', { bold: true, size: 18, color: WHITE })], { align: AlignmentType.CENTER }),
            para([txt(fecha || '', { size: 20, color: WHITE })], { align: AlignmentType.CENTER }),
          ], {
            shading: { fill: NAVY_DARK, type: ShadingType.CLEAR },
            borders: noBorders(),
            extra: { margins: { top: 120, bottom: 120, left: 160, right: 160 } }
          }),
        ]
      }),
      new TableRow({
        children: [
          cell([
            para([txt('Ref.:    ', { bold: true, size: 20 }), txt(cliente.ref || '', { size: 20 })]),
            para([txt('Atención: ', { bold: true, size: 20 }), txt(cliente.atencion || '', { size: 20 })]),
            para([txt('Correo:  ', { bold: true, size: 20 }), txt(cliente.correo || '', { size: 20 })]),
            para([txt('Tel:     ', { bold: true, size: 20 }), txt(cliente.tel || '', { size: 20 })]),
          ], { borders: { ...Object.fromEntries(['top','bottom','left','right'].map(k=>[k,{style:BorderStyle.SINGLE,size:4,color:'CCCCCC'}])) } }),
          cell([
            para([txt('COTIZACIÓN N°', { bold: true, size: 18, color: NAVY })], { align: AlignmentType.CENTER }),
            para([txt(String(numero || ''), { bold: true, size: 48, color: NAVY })], { align: AlignmentType.CENTER }),
          ], { borders: { ...Object.fromEntries(['top','bottom','left','right'].map(k=>[k,{style:BorderStyle.SINGLE,size:4,color:'CCCCCC'}])) } }),
        ]
      })
    ]
  });

  // ── INTRO TEXT ────────────────────────────────────────────────────────
  const introText = para([
    txt('De acuerdo a su amable solicitud tenemos el gusto de enviarle la siguiente '),
    txt('propuesta comercial', { bold: true }),
    txt(' para su respectivo estudio:'),
  ], { before: 200, after: 100 });

  const sectionTitle = para([txt('SUMINISTRO E INSTALACIÓN DE:', { bold: true, size: 22 })], { after: 120 });

  // ── ITEMS TABLE ──────────────────────────────────────────────────────
  const colWidths = [600, 2900, 900, 600, 700, 1200, 1300, 300];
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  function hCell(text) {
    return new TableCell({
      children: [para([txt(text, { bold: true, size: 18, color: WHITE })], { align: AlignmentType.CENTER })],
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      borders: thinBorder('FFFFFF'),
      margins: { top: 80, bottom: 80, left: 80, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  function dCell(text, align = AlignmentType.LEFT, bg = null) {
    return new TableCell({
      children: [para([txt(text, { size: 18, color: bg === NAVY ? WHITE : '222222' })], { align })],
      shading: bg ? { fill: bg, type: ShadingType.CLEAR } : { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
      borders: thinBorder('CCCCCC'),
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  const headerRow = new TableRow({
    children: [
      hCell('Ítem'), hCell('Descripción'), hCell('Marca'),
      hCell('Unidad'), hCell('Cantidad'), hCell('Valor Unitario'), hCell('Valor Total'),
    ]
  });

  const itemRows = items.map((it, i) => {
    const vtotal = it.cant * it.precio;
    return new TableRow({
      children: [
        dCell(`1.${i + 1}`, AlignmentType.CENTER),
        dCell(it.desc),
        dCell(it.marca || '', AlignmentType.CENTER),
        dCell(it.unidad, AlignmentType.CENTER),
        dCell(String(it.cant), AlignmentType.CENTER),
        dCell(fmt(it.precio), AlignmentType.RIGHT),
        dCell(fmt(vtotal), AlignmentType.RIGHT),
      ]
    });
  });

  // totals rows
  function totRow(label, value, isTotal = false) {
    const bg = isTotal ? NAVY : null;
    return new TableRow({
      children: [
        new TableCell({
          children: [para([txt(label, { bold: isTotal, size: isTotal ? 22 : 18, color: isTotal ? WHITE : '444444' })], { align: AlignmentType.RIGHT })],
          columnSpan: 6,
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : { fill: 'F8FAFC', type: ShadingType.CLEAR },
          borders: thinBorder(isTotal ? NAVY : 'DDDDDD'),
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [para([txt(fmt(value), { bold: isTotal, size: isTotal ? 22 : 18, color: isTotal ? WHITE : '222222' })], { align: AlignmentType.RIGHT })],
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : { fill: 'F8FAFC', type: ShadingType.CLEAR },
          borders: thinBorder(isTotal ? NAVY : 'DDDDDD'),
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          verticalAlign: VerticalAlign.CENTER,
        }),
      ]
    });
  }

  const itemsTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [600, 2900, 900, 600, 700, 1200, 1300],
    rows: [
      headerRow,
      ...itemRows,
      totRow(`SUBTOTAL`, subtotal),
      totRow(`Administración ${porcentajes.admin}%`, vAdmin),
      totRow(`Imprevistos ${porcentajes.imprev}%`, vImprev),
      totRow(`Utilidad ${porcentajes.util}%`, vUtil),
      totRow(`IVA sobre utilidad ${porcentajes.iva}%`, vIva),
      totRow('TOTAL', total, true),
    ]
  });

  // ── FOOTER INFO TABLE ─────────────────────────────────────────────────
  const footerTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [3166, 3166, 3168],
    borders: { ...Object.fromEntries(['top','bottom','left','right','insideH','insideV'].map(k=>[k,{style:BorderStyle.NONE,size:0,color:'auto'}])) },
    rows: [
      new TableRow({
        children: [
          cell([
            para([txt('TIEMPO DE ENTREGA', { bold: true, size: 18, color: NAVY })]),
            para([txt('15 días después de orden de compra y generado el anticipo', { size: 16 })]),
          ], { borders: thinBorder('DDDDDD') }),
          cell([
            para([txt('GARANTÍA', { bold: true, size: 18, color: NAVY })]),
            para([txt('1 año por defectos de fabricación y mano de obra', { size: 16 })]),
          ], { borders: thinBorder('DDDDDD') }),
          cell([
            para([txt('CONDICIONES COMERCIALES', { bold: true, size: 18, color: NAVY })]),
            para([txt('Contado', { size: 16 })]),
          ], { borders: thinBorder('DDDDDD') }),
        ]
      })
    ]
  });

  // ── SIGNATURE ─────────────────────────────────────────────────────────
  const signatureSection = para([
    txt('Cordialmente,\n\n\n\nPablo Jiménez\nDirector Comercial', { size: 20 })
  ], { before: 400 });

  // ── ASSEMBLE DOCUMENT ─────────────────────────────────────────────────
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children: [
        headerTable,
        separator,
        new Paragraph({ children: [], spacing: { before: 120, after: 0 } }),
        clientTable,
        new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),
        introText,
        sectionTitle,
        itemsTable,
        new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),
        footerTable,
        signatureSection,
      ]
    }]
  });

  const buffer = await Packer.toBlob(doc);
  const filename = `Cotizacion_${numero || 'RC'}_${(cliente.ref || 'cliente').replace(/\s+/g, '_')}.docx`;
  saveAs(buffer, filename);
}
