import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatNumber(n) {
  return Math.round(n).toLocaleString('es-CO');
}

export async function generatePDF(cotizacion) {
  const { cliente, items, porcentajes, numero, fecha, tipoImpuesto = 'IVA', descuentoTotal = 0, descuentoTipo = 'porcentaje', textoIntro } = cotizacion;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth  = doc.internal.pageSize.getWidth();   // 612
  const pageHeight = doc.internal.pageSize.getHeight();  // 792
  const ML = 40;
  const MR = 40;
  const CW = pageWidth - ML - MR;

  // Calcular subtotal por ítem incluyendo descuentos
  const calcularSubtotalItem = (it) => {
    const totalBruto = it.cant * it.precio;
    if (it.descuento && it.descuento > 0) {
      const descuentoValor = (it.descuento / 100) * totalBruto;
      return totalBruto - descuentoValor;
    }
    return totalBruto;
  };

  const subtotal = items.reduce((s, it) => s + calcularSubtotalItem(it), 0);
  const vAdmin  = tipoImpuesto === 'AIU' ? subtotal * (porcentajes.admin  / 100) : 0;
  const vImprev = tipoImpuesto === 'AIU' ? subtotal * (porcentajes.imprev / 100) : 0;
  const vUtil   = tipoImpuesto === 'AIU' ? subtotal * (porcentajes.util   / 100) : 0;
  
  let vImpuesto;
  if (tipoImpuesto === 'IVA') {
    vImpuesto = subtotal * (porcentajes.iva / 100);
  } else { // AIU
    vImpuesto = vUtil * (porcentajes.iva / 100);
  }

  let totalAntesDescuento = subtotal + vAdmin + vImprev + vUtil + vImpuesto;
  let descuentoTotalValor;
  if (descuentoTotal > 0) {
    if (descuentoTipo === 'porcentaje') {
      descuentoTotalValor = (descuentoTotal / 100) * totalAntesDescuento;
    } else {
      descuentoTotalValor = descuentoTotal;
    }
  } else {
    descuentoTotalValor = 0;
  }
  const total = totalAntesDescuento - descuentoTotalValor;

  const loadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  function drawCorners(pageH) {
    doc.setFillColor(0, 48, 135);
    doc.rect(pageWidth - 60, 0, 60, 55, 'F');
    doc.setFillColor(30, 90, 200);
    doc.rect(pageWidth - 40, 0, 40, 37, 'F');
    doc.setFillColor(0, 48, 135);
    doc.rect(0, pageH - 90, 100, 90, 'F');
    doc.setFillColor(30, 90, 200);
    doc.rect(0, pageH - 60, 68, 60, 'F');
  }

  try {
    const logoImg  = await loadImage('/Logo.png');
    const firmaImg = await loadImage('/firma_pablo.png');
    const tkImg    = await loadImage('/tiktok.png');
    const waImg    = await loadImage('/whatsapp.png');
    const webImg   = await loadImage('/web.png');

    drawCorners(pageHeight);

    // ── HEADER ───────────────────────────────────────────────────
    const LOGO_W = 90;
    const LOGO_H = (logoImg.height / logoImg.width) * LOGO_W;
    doc.addImage(logoImg, 'PNG', ML, 25, LOGO_W, LOGO_H);

    const nameX = ML + LOGO_W + 14;
    const sepX  = 380;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(0, 48, 135);
    doc.text('REDES COLOMBIA', nameX, 52);
    doc.setFontSize(14);
    doc.text('INGENIERÍA S.A.S', nameX, 72);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('S O L U C I O N E S   Q U E   C O N E C T A N', nameX, 89);

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(1);
    doc.line(sepX, 26, sepX, 112);

    const ctX   = sepX + 16;
    const iconR = 8;
    const contacts = [
      { ltr: 'W',  text: 'redescolombia.com.co' },
      { ltr: 'IG', text: '@redescolombiaingenieriasas' },
      { ltr: 'TK', text: '@redescolombiaingenieria' },
      { ltr: 'WA', text: '+57 320 345 8316' },
    ];
    const contactLinks = [
      'https://redescolombia.com.co/',
      'https://www.instagram.com/redescolombiaingenieriasas/',
      'https://www.tiktok.com/@redescolombiaingenieria',
      'https://wa.me/573203458316',
    ];
    contacts.forEach((c, i) => {
      const cy = 38 + i * 20;
      doc.setFillColor(0, 48, 135);
      doc.circle(ctX + iconR, cy, iconR, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(c.ltr.length > 1 ? 5.5 : 6.5);
      doc.setTextColor(255, 255, 255);
      const lw = doc.getTextWidth(c.ltr);
      doc.text(c.ltr, ctX + iconR - lw / 2, cy + 2.4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(55, 55, 55);
      doc.text(c.text, ctX + iconR * 2 + 7, cy + 3.5);
      doc.link(ctX, cy - iconR, pageWidth - MR - ctX, iconR * 2, { url: contactLinks[i] });
    });

    doc.setDrawColor(0, 48, 135);
    doc.setLineWidth(2.5);
    doc.line(ML, 122, pageWidth - MR, 122);

    // ── CLIENT BOX ───────────────────────────────────────────────
    const boxY = 132;
    const cbW  = Math.round(CW * 0.55);
    const cbH  = 150;
    const hdrH = 28;

    doc.setFillColor(237, 242, 251);
    doc.roundedRect(ML, boxY, cbW, cbH, 10, 10, 'F');
    doc.setFillColor(0, 48, 135);
    doc.roundedRect(ML, boxY, cbW, hdrH, 10, 10, 'F');
    doc.rect(ML, boxY + hdrH - 10, cbW, 10, 'F');

    const icCx = ML + 22;
    const icCy = boxY + hdrH / 2;
    doc.setFillColor(255, 255, 255);
    doc.circle(icCx, icCy, 11, 'F');
    doc.setFillColor(0, 48, 135);
    doc.circle(icCx, icCy - 3, 4.5, 'F');
    doc.ellipse(icCx, icCy + 5, 6, 4.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('DATOS DEL CLIENTE', ML + 40, boxY + hdrH / 2 + 4);

    const fields = [
      { lbl: 'Ref.:',     val: cliente.ref      || '' },
      { lbl: 'Señores:',  val: cliente.señores  || '' },
      { lbl: 'NIT:',      val: cliente.nit      || '' },
      { lbl: 'Atención:', val: cliente.atencion  || '' },
      { lbl: 'Correo:',  val: cliente.correo    || '' },
      { lbl: 'Tel:',     val: cliente.tel       || '' },
    ];
    doc.setFontSize(10);
    fields.forEach((f, i) => {
      const fy = boxY + hdrH + 14 + i * 19;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(f.lbl, ML + 16, fy);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(f.val, ML + 78, fy);
    });

    // ── DATE / QUOTE BOX ─────────────────────────────────────────
    const dbX = ML + cbW + 14;
    const dbW = CW - cbW - 14;
    const dbH = cbH;

    doc.setFillColor(0, 31, 91);
    doc.roundedRect(dbX, boxY, dbW, dbH, 10, 10, 'F');

    const midY = boxY + dbH / 2;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.line(dbX + 8, midY, dbX + dbW - 8, midY);

    const d1Cy = boxY + dbH / 4;
    const d1Cx = dbX + 22;
    doc.setFillColor(255, 255, 255);
    doc.circle(d1Cx, d1Cy, 14, 'F');
    doc.setFillColor(0, 31, 91);
    doc.rect(d1Cx - 7, d1Cy - 5, 14, 11, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(d1Cx - 5, d1Cy - 3, 4, 3, 'F');
    doc.rect(d1Cx + 1, d1Cy - 3, 4, 3, 'F');
    doc.rect(d1Cx - 5, d1Cy + 2, 4, 3, 'F');
    doc.rect(d1Cx + 1, d1Cy + 2, 4, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(160, 190, 240);
    doc.text('FECHA', dbX + 44, d1Cy - 5);
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(fecha || '', dbX + 44, d1Cy + 10);

    const d2Cy = boxY + (3 * dbH) / 4;
    const d2Cx = dbX + 22;
    doc.setFillColor(255, 255, 255);
    doc.circle(d2Cx, d2Cy, 14, 'F');
    doc.setFillColor(0, 31, 91);
    doc.circle(d2Cx, d2Cy, 9, 'F');
    doc.setFillColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('#', d2Cx - 3.5, d2Cy + 3.5);
    doc.setFontSize(9);
    doc.setTextColor(160, 190, 240);
    doc.text('COTIZACIÓN N°', dbX + 44, d2Cy - 5);
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(String(numero || ''), dbX + 44, d2Cy + 13);

    // ── INTRO TEXT (Editable) ───────────────────────────────────────────────
    const introY = boxY + cbH + 8;
    doc.setFontSize(10.5);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    
    const defaultIntro = 'De acuerdo a su amable solicitud tenemos el gusto de enviarle la siguiente propuesta comercial para su respectivo estudio:';
    const finalIntro = textoIntro || defaultIntro;
    
    const lines = doc.splitTextToSize(finalIntro, CW);
    doc.text(lines, ML, introY);

    // ── TABLE BAND ───────────────────────────────────────────────
    const lineCount = lines.length;
    const tblBandY = introY + (lineCount * 14) + 8;
    doc.setFillColor(0, 48, 135);
    doc.roundedRect(ML, tblBandY, CW, 28, 7, 7, 'F');
    doc.rect(ML, tblBandY + 14, CW, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(255, 255, 255);
    doc.text('SUMINISTRO E INSTALACIÓN DE:', ML + 18, tblBandY + 19);

    // ── SMART DYNAMIC TABLE SIZING ───────────────────────────────
    const TABLE_START   = tblBandY + 28;
    const AFTER_TABLE   = 15 + 85 + 4 + 12 + 60 + 6 + 70 + 15;
    const availH        = pageHeight - TABLE_START - AFTER_TABLE;

    const descColW = CW - 30 - 52 - 40 - 48 - 70 - 70 - 30 - 20; // Ajustamos para columna descuento

    let chosenFontSize = 9;
    let chosenPad      = 4;

    for (let fs = 9; fs >= 6.5; fs -= 0.5) {
      doc.setFontSize(fs);
      const lineH = fs * 1.15;

      let totalVisualLines = 0;
      items.forEach(it => {
        const lines = doc.splitTextToSize(it.desc || '', descColW).length;
        totalVisualLines += Math.max(lines, 1);
      });

      for (let pad = 4; pad >= 1; pad--) {
        const rowH      = lineH + pad * 2;
        const headerH   = lineH + 6;
        const bodyH     = totalVisualLines * rowH;
        const totalH    = headerH + bodyH;
        if (totalH <= availH) {
          chosenFontSize = fs;
          chosenPad      = pad;
          break;
        }
      }
      if ((doc.setFontSize(chosenFontSize), true) && chosenFontSize === fs) {
        const lineHCheck = fs * 1.15;
        let totalVL = 0;
        items.forEach(it => {
          totalVL += Math.max(doc.splitTextToSize(it.desc || '', descColW).length, 1);
        });
        if ((lineHCheck + chosenPad * 2) * totalVL + (lineHCheck + 6) <= availH) break;
      }
    }

    // ── ITEMS TABLE (with discount column) ───────────────────────────────────────────────
    const tableData = items.map((it, i) => [
      `1.${i + 1}`,
      it.desc,
      it.marca || '',
      it.unidad,
      it.cant,
      formatNumber(it.precio),
      it.descuento || 0,
      formatNumber(calcularSubtotalItem(it)),
    ]);

    autoTable(doc, {
      startY: TABLE_START,
      head: [['Ítem', 'Descripción', 'Marca', 'Unidad', 'Cantidad', 'Valor Unitario', 'Desc. %', 'Valor Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [10, 55, 145],
        textColor: 255,
        fontSize: chosenFontSize,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: { top: chosenPad + 1, bottom: chosenPad + 1, left: 3, right: 3 },
      },
      bodyStyles: {
        fontSize: chosenFontSize,
        textColor: [35, 35, 35],
        cellPadding: { top: chosenPad, bottom: chosenPad, left: 3, right: 3 },
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 52 },
        3: { halign: 'center', cellWidth: 40 },
        4: { halign: 'center', cellWidth: 48 },
        5: { halign: 'right',  cellWidth: 70 },
        6: { halign: 'center', cellWidth: 30 },
        7: { halign: 'right',  cellWidth: 70, fontStyle: 'bold' },
      },
      margin: { left: ML, right: MR },
      tableLineColor: [200, 210, 228],
      tableLineWidth: 0.4,
      didDrawPage: (data) => {
        if (data.pageNumber > 1) drawCorners(pageHeight);
      },
    });

    // ── TOTALS (updated with discounts and tax type) ────────────────────────────────────────────────────
    const totals = [
      { lbl: 'SUBTOTAL',                               val: subtotal, bold: true,  blue: false },
    ];
    
    if (tipoImpuesto === 'AIU') {
      totals.push({ lbl: `Administración ${porcentajes.admin}%`,   val: vAdmin,   bold: false, blue: false });
      totals.push({ lbl: `Imprevistos ${porcentajes.imprev}%`,     val: vImprev,  bold: false, blue: false });
      totals.push({ lbl: `Utilidad ${porcentajes.util}%`,          val: vUtil,    bold: false, blue: false });
    }
    
    totals.push({ lbl: `${tipoImpuesto === 'AIU' ? 'IVA sobre utilidad' : 'IVA'} ${porcentajes.iva}%`,    val: vImpuesto, bold: false, blue: false });
    totals.push({ lbl: 'TOTAL', val: total, bold: true, blue: true });

    const rowH = 17;
    const totW = 248;
    const totX = pageWidth - MR - totW;
    const totY = doc.lastAutoTable.finalY + 6;

    totals.forEach((t, i) => {
      const ry = totY + i * rowH;
      if (t.blue) {
        doc.setFillColor(0, 48, 135);
        doc.roundedRect(totX, ry, totW, rowH + 2, 6, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12.5);
      } else {
        if (i % 2 === 0) {
          doc.setFillColor(243, 246, 255);
          doc.rect(totX, ry, totW, rowH, 'F');
        }
        doc.setFont('helvetica', t.bold ? 'bold' : 'normal');
        doc.setFontSize(10);
        doc.setTextColor(45, 45, 45);
      }
      doc.text(t.lbl, totX + 10, ry + (t.blue ? 15 : 14));
      doc.text(formatNumber(t.val), totX + totW - 10, ry + (t.blue ? 15 : 14), { align: 'right' });
    });

    // ── FOOTER CARDS ─────────────────────────────────────────────
    const ftY  = totY + totals.length * rowH + 12;
    const gap  = 8;
    const crdW = (CW - gap * 2) / 3;
    const crdH = 60;
    const icoR = 14;

    const cards = [
      {
        title: 'TIEMPO DE ENTREGA',
        body:  '15 días después de orden de compra y generado el anticipo',
        drawIcon: (cx, cy) => {
          doc.setFillColor(255, 255, 255);
          doc.circle(cx, cy, icoR * 0.65, 'F');
          doc.setFillColor(0, 48, 135);
          doc.circle(cx, cy, icoR * 0.55, 'F');
          doc.setFillColor(255, 255, 255);
          doc.rect(cx - 1, cy - icoR * 0.45, 2, icoR * 0.45, 'F');
          doc.rect(cx, cy - 1, icoR * 0.35, 2, 'F');
          doc.circle(cx, cy, 2, 'F');
        },
      },
      {
        title: 'GARANTÍA',
        body:  '1 año por defectos de fabricación y mano de obra',
        drawIcon: (cx, cy) => {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(cx - 7, cy - 9, 14, 14, 3, 3, 'F');
          doc.setFillColor(0, 48, 135);
          doc.rect(cx - 4, cy - 1, 3, 2, 'F');
          doc.rect(cx - 1, cy - 3, 2, 6, 'F');
        },
      },
      {
        title: 'CONDICIONES COMERCIALES',
        body:  'Contado',
        drawIcon: (cx, cy) => {
          doc.setFillColor(255, 255, 255);
          doc.rect(cx - 6, cy - 2, 12, 2.5, 'F');
          doc.rect(cx - 6, cy + 2, 12, 2.5, 'F');
        },
      },
    ];

    cards.forEach((card, i) => {
      const cx = ML + i * (crdW + gap);
      doc.setFillColor(237, 242, 251);
      doc.roundedRect(cx, ftY, crdW, crdH, 10, 10, 'F');
      const icoCx = cx + icoR + 10;
      const icoCy = ftY + crdH / 2;
      doc.setFillColor(0, 48, 135);
      doc.circle(icoCx, icoCy, icoR, 'F');
      card.drawIcon(icoCx, icoCy);
      const txtX = icoCx + icoR + 8;
      const txtW = crdW - (txtX - cx) - 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 48, 135);
      const titleLines = doc.splitTextToSize(card.title, txtW);
      doc.text(titleLines, txtX, ftY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(70, 70, 70);
      const bodyLines = doc.splitTextToSize(card.body, txtW);
      doc.text(bodyLines, txtX, ftY + 18 + titleLines.length * 10 + 3);
    });

    // ── SIGNATURE ────────────────────────────────────────────────
    const sigBaseY  = ftY + crdH + 6;
    const sigStartX = 115;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Cordialmente,', sigStartX, sigBaseY);

    const fW = 70;
    const fH = (firmaImg.height / firmaImg.width) * fW;
    doc.addImage(firmaImg, 'PNG', sigStartX - 4, sigBaseY + 5, fW, fH);

    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(1);
    doc.line(sigStartX - 4, sigBaseY + fH + 8, sigStartX + fW + 14, sigBaseY + fH + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(25, 25, 25);
    doc.text('Pablo Jiménez', sigStartX + 10, sigBaseY + fH + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Director Comercial', sigStartX + 4, sigBaseY + fH + 28);

    // ── THANK-YOU (centered beside signature block) ────────────────
    const sigBlockH = fH + 36;
    const tyX       = pageWidth - MR - 210;
    const tyBlockH  = 28 + 18;
    const tyY       = sigBaseY + (sigBlockH - tyBlockH) / 2;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(85, 85, 85);
    doc.text('Agradecemos su confianza y quedamos atentos', tyX, tyY);
    doc.text('a cualquier observación.', tyX, tyY + 14);
    doc.text('Será un gusto poder atenderle.', tyX, tyY + 28);

    // ── SOCIAL ICONS ─────────────────────────────────────────────
    const socials = [
      { img: tkImg,  url: 'https://www.tiktok.com/@redescolombiaingenieria' },
      { img: waImg,  url: 'https://wa.me/573203458316' },
      { img: webImg, url: 'https://redescolombia.com.co/' },
    ];
    const iconSize    = 18;
    const iconGap     = 6;
    const iconsY      = tyY + 42;
    const totalIconsW = socials.length * iconSize + (socials.length - 1) * iconGap;
    const iconsStartX = tyX + (210 - totalIconsW) / 2;

    socials.forEach((s, si) => {
      const ix = iconsStartX + si * (iconSize + iconGap);
      doc.addImage(s.img, 'PNG', ix, iconsY, iconSize, iconSize);
      doc.link(ix, iconsY, iconSize, iconSize, { url: s.url });
    });

    // ── SAVE ─────────────────────────────────────────────────────
    const filename = `Cotizacion_${numero || 'RC'}_${(cliente.ref || 'cliente').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);

  } catch (err) {
    console.error(err);
    throw err;
  }
}
