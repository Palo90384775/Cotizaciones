import { useState } from 'react';
import { FileText, Folder, Package, Plus, Trash2, Pencil, Download, X, Check, Copy } from 'lucide-react';
import { generatePDF } from './generatePDF';
import Swal from 'sweetalert2';

// Toast helper using SweetAlert2 (bottom-right, no overlap with header)
const toast = {
  success: (msg) => Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: msg, showConfirmButton: false, timer: 3000, timerProgressBar: true }),
  error:   (msg) => Swal.fire({ toast: true, position: 'bottom-end', icon: 'error',   title: msg, showConfirmButton: false, timer: 3500, timerProgressBar: true }),
};

const DEFAULT_PORCENTAJES = { admin: 2, imprev: 2, util: 10, iva: 19 };

const SAMPLE_PRODUCTS = [
  { id: 1, nombre: 'Punto de red categoría 6A (incluye materiales)', marca: 'DAHUA', unidad: 'UND', precio: 620000, cat: 'Redes' },
  { id: 2, nombre: 'Cable UTP Cat 6A x 100m', marca: 'DAHUA', unidad: 'UND', precio: 220000, cat: 'Cableado' },
  { id: 3, nombre: 'Organización horizontal 2UR (incluye accesorios, tapa y etiquetado según norma)', marca: 'DAHUA', unidad: 'UND', precio: 150000, cat: 'Redes' },
  { id: 4, nombre: 'Patch panel categoría 6A x 24 puertos', marca: 'DAHUA', unidad: 'UND', precio: 760000, cat: 'Redes' },
  { id: 5, nombre: 'Gabinete de comunicaciones 19" 12UR', marca: 'THORSMAN', unidad: 'UND', precio: 320000, cat: 'Rack' },
  { id: 6, nombre: 'Switch 24 puertos + 2 SFP', marca: 'TP-LINK', unidad: 'UND', precio: 2400000, cat: 'Activos' },
  { id: 7, nombre: 'Organizador vertical 2UR', marca: 'POWEST', unidad: 'UND', precio: 240000, cat: 'Rack' },
  { id: 8, nombre: 'Patch cord 1.5m categoría 6A', marca: 'AMP', unidad: 'UND', precio: 8000, cat: 'Cableado' },
  { id: 9, nombre: 'Canaleta PVC 20x12mm', marca: 'RCI', unidad: 'GL', precio: 240000, cat: 'Instalación' },
  { id: 10, nombre: 'Tornillos, chazos, bridas, cintas y accesorios de instalación', marca: 'GENÉRICA', unidad: 'GL', precio: 350000, cat: 'Instalación' },
  { id: 11, nombre: 'Certificación de red categoría 6A (incluye informe)', marca: 'RCI', unidad: 'UND', precio: 420000, cat: 'Servicios' },
  { id: 12, nombre: 'Pequeño diseño e implementación de diagrama lógico', marca: 'RCI', unidad: 'UND', precio: 220000, cat: 'Servicios' },
  { id: 13, nombre: 'Mano de obra para montaje y pruebas de conectividad', marca: 'RCI', unidad: 'UND', precio: 210000, cat: 'Servicios' },
  { id: 14, nombre: 'Desplazamiento técnico para visita de instalación / verificación', marca: 'RCI', unidad: 'ML', precio: 35000, cat: 'Servicios' },
];

function fmt(n) {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

function uid() {
  return Date.now() + Math.random();
}

// ── LOGO ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <img src="/Logo.png" alt="Logo Redes Colombia" style={{ width: 64, height: 64, objectFit: 'contain' }} />
  );
}

// ── HEADER ───────────────────────────────────────────────────────────────────
function Header({ tab, setTab }) {
  const tabs = [
    { id: 'nueva', label: 'Nueva cotización', icon: FileText },
    { id: 'guardadas', label: 'Guardadas', icon: Folder },
    { id: 'clientes', label: 'Mis clientes', icon: Package }, // Reutilizamos icon por ahora
    { id: 'productos', label: 'Mis productos', icon: Package },
  ];
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-4 py-3 border-b border-gray-100">
          <Logo />
          <div>
            <div className="font-bold text-[#003087] text-lg leading-tight tracking-wide">REDES COLOMBIA INGENIERÍA S.A.S</div>
            <div className="text-xs text-gray-400 tracking-widest uppercase">Soluciones que conectan</div>
          </div>
        </div>
        <div className="flex gap-1">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-[#003087] text-[#003087]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── INPUT + LABEL helper ──────────────────────────────────────────────────────
function Field({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
      {...props}
    />
  );
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ── TAB: NUEVA COTIZACIÓN ─────────────────────────────────────────────────────
function NuevaCotizacion({ products, onSave, initialData, lastQuoteNumber, clients }) {
  const today = new Date().toISOString().split('T')[0];
  const [cliente, setCliente] = useState(initialData?.cliente || { ref: '', atencion: '', correo: '', tel: '' });
  const [numero, setNumero] = useState(initialData?.numero || lastQuoteNumber + 1);
  const [fecha, setFecha] = useState(initialData?.fecha || today);
  const [porc, setPorc] = useState(initialData?.porc || DEFAULT_PORCENTAJES);
  const [items, setItems] = useState(initialData?.items || []);
  const [newItem, setNewItem] = useState({ desc: '', marca: '', unidad: 'UND', cant: 1, precio: '', descuento: 0 });
  const [selectedProd, setSelectedProd] = useState('');
  const [exporting, setExporting] = useState(false);
  const [tipoImpuesto, setTipoImpuesto] = useState(initialData?.tipoImpuesto || 'IVA'); // 'IVA' o 'AIU'
  const [descuentoTotal, setDescuentoTotal] = useState(initialData?.descuentoTotal || 0); // % de descuento total
  const [descuentoTipo, setDescuentoTipo] = useState(initialData?.descuentoTipo || 'porcentaje'); // 'porcentaje' o 'monto'
  const [textoIntro, setTextoIntro] = useState(initialData?.textoIntro || 
    'De acuerdo a su amable solicitud tenemos el gusto de enviarle la siguiente propuesta comercial para su respectivo estudio:');

  // Calcular subtotal por ítem incluyendo descuentos por producto
  const calcularSubtotalItem = (item) => {
    const totalBruto = item.cant * item.precio;
    if (item.descuento && item.descuento > 0) {
      const descuentoValor = (item.descuento / 100) * totalBruto;
      return totalBruto - descuentoValor;
    }
    return totalBruto;
  };

  const subtotal = items.reduce((s, it) => s + calcularSubtotalItem(it), 0);
  const vAdmin = tipoImpuesto === 'AIU' ? subtotal * (porc.admin / 100) : 0;
  const vImprev = tipoImpuesto === 'AIU' ? subtotal * (porc.imprev / 100) : 0;
  const vUtil = tipoImpuesto === 'AIU' ? subtotal * (porc.util / 100) : 0;
  
  // Calcular impuesto (IVA o AIU)
  let vImpuesto;
  if (tipoImpuesto === 'IVA') {
    vImpuesto = subtotal * (porc.iva / 100);
  } else { // AIU
    vImpuesto = vUtil * (porc.iva / 100);
  }
  
  // Aplicar descuento total
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

  function handleProdSelect(e) {
    const idx = e.target.value;
    setSelectedProd(idx);
    if (idx === '') return;
    const p = products[parseInt(idx)];
    setNewItem(prev => ({ ...prev, desc: p.nombre, marca: p.marca, unidad: p.unidad, precio: p.precio }));
  }

  function addItem() {
    if (!newItem.desc) return;
    setItems(prev => [...prev, { 
      id: uid(), 
      ...newItem, 
      cant: Number(newItem.cant) || 1, 
      precio: Number(newItem.precio) || 0,
      descuento: Number(newItem.descuento) || 0
    }]);
    setNewItem({ desc: '', marca: '', unidad: 'UND', cant: 1, precio: '', descuento: 0 });
    setSelectedProd('');
  }

  function removeItem(id) {
    setItems(prev => prev.filter(x => x.id !== id));
  }

  function updateItem(id, field, val) {
    setItems(prev => prev.map(x => x.id === id ? { 
      ...x, 
      [field]: (field === 'cant' || field === 'precio' || field === 'descuento') ? Number(val) : val 
    } : x));
  }

  function handleSave() {
    if (!numero && !cliente.ref) { 
      toast.error('Agrega número de cotización o referencia'); 
      return; 
    }
    if (items.length === 0) { 
      toast.error('Agrega al menos un ítem'); 
      return; 
    }
    onSave({ 
      id: uid(), 
      cliente, 
      numero, 
      fecha, 
      porc, 
      items, 
      total, 
      tipoImpuesto, 
      descuentoTotal, 
      descuentoTipo, 
      textoIntro 
    });
    toast.success('Cotización guardada ✓');
  }

  async function handleExport() {
    if (items.length === 0) { 
      toast.error('Agrega ítems antes de exportar'); 
      return; 
    }
    setExporting(true);
    try {
      await generatePDF({ 
        cliente, 
        numero, 
        fecha, 
        items, 
        porcentajes: porc,
        tipoImpuesto,
        descuentoTotal,
        descuentoTipo,
        textoIntro
      });
      toast.success('PDF generado exitosamente!');
    } catch (e) {
      toast.error('Error al generar PDF: ' + e.message);
    }
    setExporting(false);
  }

  function handleClear() {
    setCliente({ ref: '', atencion: '', correo: '', tel: '' });
    setNumero(lastQuoteNumber + 1); 
    setFecha(today);
    setPorc(DEFAULT_PORCENTAJES);
    setItems([]);
    setTipoImpuesto('IVA');
    setDescuentoTotal(0);
    setDescuentoTipo('porcentaje');
    setTextoIntro('De acuerdo a su amable solicitud tenemos el gusto de enviarle la siguiente propuesta comercial para su respectivo estudio:');
    toast.success('Formulario limpiado');
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <div className="bg-[#003087] px-6 py-3">
          <span className="text-white font-semibold text-sm tracking-wide">DATOS DEL CLIENTE</span>
        </div>
        <div className="p-6 grid grid-cols-2 gap-8">
          {/* Cliente */}
          <div className="space-y-4">
            {clients.length > 0 && (
              <Field label="Seleccionar cliente existente">
                <Select 
                  value="" 
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                      const client = clients.find(c => c.id === selectedId);
                      if (client) {
                        setCliente(client);
                      }
                    }
                  }}
                >
                  <option value="">— Seleccionar cliente —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.ref}</option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label="Ref. / Proyecto">
              <Input placeholder="Ej: COTIZ. VILLAVICENCIO" value={cliente.ref} onChange={e => setCliente(p => ({ ...p, ref: e.target.value }))} />
            </Field>
            <Field label="Atención">
              <Input placeholder="Nombre del contacto" value={cliente.atencion} onChange={e => setCliente(p => ({ ...p, atencion: e.target.value }))} />
            </Field>
            <Field label="Correo">
              <Input placeholder="correo@empresa.com" value={cliente.correo} onChange={e => setCliente(p => ({ ...p, correo: e.target.value }))} />
            </Field>
            <Field label="Teléfono">
              <Input placeholder="Teléfono" value={cliente.tel} onChange={e => setCliente(p => ({ ...p, tel: e.target.value }))} />
            </Field>
          </div>
          {/* Cotización info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha">
                <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
              </Field>
              <Field label="Número de cotización">
                <Input type="number" placeholder="Ej: 556" value={numero} onChange={e => setNumero(e.target.value)} />
              </Field>
            </div>
            
            {/* Tipo de impuesto */}
            <div className="grid grid-cols-1 gap-3">
              <Field label="Tipo de impuesto">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setTipoImpuesto('IVA')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                      tipoImpuesto === 'IVA' 
                        ? 'bg-[#003087] text-white border-[#003087]' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#003087]'
                    }`}
                  >
                    IVA
                  </button>
                  <button 
                    onClick={() => setTipoImpuesto('AIU')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                      tipoImpuesto === 'AIU' 
                        ? 'bg-[#003087] text-white border-[#003087]' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#003087]'
                    }`}
                  >
                    AIU
                  </button>
                </div>
              </Field>
            </div>
            
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Fórmulas de cálculo</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ...(tipoImpuesto === 'AIU' ? [
                    { key: 'admin', label: 'Administración (%)' },
                    { key: 'imprev', label: 'Imprevistos (%)' },
                    { key: 'util', label: 'Utilidad (%)' }
                  ] : []),
                  { 
                    key: 'iva', 
                    label: tipoImpuesto === 'AIU' ? 'IVA sobre utilidad (%)' : 'IVA (%)' 
                  }
                ].map(f => (
                  <Field key={f.key} label={f.label}>
                    <Input type="number" value={porc[f.key]} onChange={e => setPorc(p => ({ ...p, [f.key]: Number(e.target.value) }))} className="text-right" />
                  </Field>
                ))}
              </div>
            </div>

            {/* Descuento total */}
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Descuento total</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDescuentoTipo('porcentaje')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                        descuentoTipo === 'porcentaje' 
                          ? 'bg-[#003087] text-white border-[#003087]' 
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      %
                    </button>
                    <button 
                      onClick={() => setDescuentoTipo('monto')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                        descuentoTipo === 'monto' 
                          ? 'bg-[#003087] text-white border-[#003087]' 
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      $
                    </button>
                  </div>
                </div>
                <Field label={descuentoTipo === 'porcentaje' ? 'Porcentaje' : 'Monto'} className="col-span-1">
                  <Input 
                    type="number" 
                    value={descuentoTotal} 
                    onChange={e => setDescuentoTotal(Number(e.target.value))} 
                    className="text-right" 
                    placeholder="0"
                  />
                </Field>
              </div>
            </div>

            {/* Texto intro editable */}
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-gray-100">
              <Field label="Texto introductorio">
                <textarea 
                  value={textoIntro} 
                  onChange={e => setTextoIntro(e.target.value)} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  rows={3}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Items section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <div className="bg-[#003087] px-6 py-3">
          <span className="text-white font-semibold text-sm tracking-wide">SUMINISTRO E INSTALACIÓN DE</span>
        </div>
        <div className="p-6">
          {/* Add item bar */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Agregar ítem</p>
            <div className="grid grid-cols-12 gap-3 items-end">
              <Field label="Del catálogo" className="col-span-2">
                <Select value={selectedProd} onChange={handleProdSelect}>
                  <option value="">— Seleccionar —</option>
                  {products.map((p, i) => (
                    <option key={p.id} value={i}>{p.nombre.slice(0, 45)}{p.nombre.length > 45 ? '…' : ''}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Descripción" className="col-span-3">
                <Input value={newItem.desc} onChange={e => setNewItem(p => ({ ...p, desc: e.target.value }))} placeholder="Descripción del ítem" />
              </Field>
              <Field label="Marca" className="col-span-1">
                <Input value={newItem.marca} onChange={e => setNewItem(p => ({ ...p, marca: e.target.value }))} />
              </Field>
              <Field label="Und." className="col-span-1">
                <Select value={newItem.unidad} onChange={e => setNewItem(p => ({ ...p, unidad: e.target.value }))}>
                  {['UND','GL','ML','M','KG','HR'].map(u => <option key={u}>{u}</option>)}
                </Select>
              </Field>
              <Field label="Cant." className="col-span-1">
                <Input type="number" value={newItem.cant} onChange={e => setNewItem(p => ({ ...p, cant: e.target.value }))} className="text-right" />
              </Field>
              <Field label="Valor unitario ($)" className="col-span-2">
                <Input type="number" value={newItem.precio} onChange={e => setNewItem(p => ({ ...p, precio: e.target.value }))} placeholder="0" className="text-right" />
              </Field>
              <Field label="Descuento (%)" className="col-span-2">
                <Input type="number" value={newItem.descuento} onChange={e => setNewItem(p => ({ ...p, descuento: e.target.value }))} placeholder="0" className="text-right" />
              </Field>
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={addItem} className="flex items-center gap-2 bg-[#003087] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002070] transition-colors">
                <Plus size={15} /> Agregar ítem
              </button>
            </div>
          </div>

          {/* Items table */}
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sin ítems. Agrega uno arriba.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#003087] text-white">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold w-12">Ítem</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold">Descripción</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold w-24">Marca</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-16">Und.</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-20">Cant.</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold w-32">Valor unit.</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold w-20">Desc. %</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold w-32">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={it.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400 text-xs text-center">1.{i + 1}</td>
                      <td className="px-3 py-2">
                        <input value={it.desc} onChange={e => updateItem(it.id, 'desc', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded px-1" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={it.marca} onChange={e => updateItem(it.id, 'marca', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded px-1" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={it.unidad} onChange={e => updateItem(it.id, 'unidad', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none text-center">
                          {['UND','GL','ML','M','KG','HR'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={it.cant} onChange={e => updateItem(it.id, 'cant', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded px-1 text-center" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={it.precio} onChange={e => updateItem(it.id, 'precio', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded px-1 text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={it.descuento || 0} onChange={e => updateItem(it.id, 'descuento', e.target.value)}
                          className="w-full text-sm bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded px-1 text-center" />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-[#003087]">{fmt(calcularSubtotalItem(it))}</td>
                      <td className="px-2 py-2">
                        <button onClick={() => removeItem(it.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <div className="flex justify-end mt-6">
              <div className="w-80 space-y-1">
                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                  <span className="text-gray-600">SUBTOTAL</span>
                  <span className="font-medium">{fmt(subtotal)}</span>
                </div>
                {tipoImpuesto === 'AIU' && (
                  <>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">{`Administración ${porc.admin}%`}</span>
                      <span className="font-medium">{fmt(vAdmin)}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">{`Imprevistos ${porc.imprev}%`}</span>
                      <span className="font-medium">{fmt(vImprev)}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">{`Utilidad ${porc.util}%`}</span>
                      <span className="font-medium">{fmt(vUtil)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                  <span className="text-gray-600">{`${tipoImpuesto === 'AIU' ? 'IVA sobre utilidad' : 'IVA'} ${porc.iva}%`}</span>
                  <span className="font-medium">{fmt(vImpuesto)}</span>
                </div>
                <div className="flex justify-between items-center bg-[#003087] text-white px-3 py-2.5 rounded-lg mt-2">
                  <span className="font-bold text-sm">TOTAL</span>
                  <span className="font-bold text-base">{fmt(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-100 pt-6">
            {[
              { title: 'TIEMPO DE ENTREGA', body: '15 días después de orden de compra y generado el anticipo' },
              { title: 'GARANTÍA', body: '1 año por defectos de fabricación y mano de obra' },
              { title: 'CONDICIONES COMERCIALES', body: 'Contado' },
            ].map(f => (
              <div key={f.title} className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-bold text-[#003087] mb-1">{f.title}</p>
                <p className="text-xs text-gray-600">{f.body}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={handleClear} className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Trash2 size={14} /> Limpiar
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 border border-[#003087] text-[#003087] px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              <Check size={14} /> Guardar
            </button>
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 bg-[#003087] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#002070] transition-colors disabled:opacity-60">
              <Download size={14} /> {exporting ? 'Generando…' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TAB: GUARDADAS ─────────────────────────────────────────────────────────────
function Guardadas({ cotizaciones, onDelete, onLoad }) {
  if (cotizaciones.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center text-gray-400">
        <Folder size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-sm">No hay cotizaciones guardadas aún.</p>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="grid grid-cols-2 gap-4">
        {cotizaciones.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-2xl font-bold text-[#003087]">N° {c.numero || '—'}</div>
                <div className="text-sm text-gray-500">{c.cliente.ref || 'Sin referencia'}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-[#003087]">{fmt(c.total)}</div>
                <div className="text-xs text-gray-400">{c.fecha}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-4 space-y-0.5">
              {c.cliente.atencion && <p>👤 {c.cliente.atencion}</p>}
              <p>📋 {c.items.length} ítem(s)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onLoad(c)} className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                <Copy size={12} /> Cargar
              </button>
              <button onClick={async () => { 
                const result = await Swal.fire({
                  title: '¿Eliminar cotización?',
                  text: `N° ${c.numero || '—'} — ${c.cliente.ref || 'Sin referencia'}`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#003087',
                  cancelButtonColor: '#e53e3e',
                  confirmButtonText: 'Sí, eliminar',
                  cancelButtonText: 'Cancelar',
                });
                if (result.isConfirmed) {
                  onDelete(c.id);
                  toast.success('Cotización eliminada');
                }
              }} className="flex items-center gap-1.5 border border-red-200 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors">
                <Trash2 size={12} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TAB: PRODUCTOS ─────────────────────────────────────────────────────────────
function Productos({ products, setProducts }) {
  const blank = { nombre: '', marca: '', unidad: 'UND', precio: '', cat: '' };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  function handleSave() {
    if (!form.nombre) { 
      toast.error('Ingresa el nombre del producto'); 
      return; 
    }
    const prod = { ...form, precio: Number(form.precio) || 0, id: editing !== null ? products[editing].id : uid() };
    if (editing !== null) {
      setProducts(prev => prev.map((p, i) => i === editing ? prod : p));
      setEditing(null);
      toast.success('Producto actualizado!');
    } else {
      setProducts(prev => [...prev, prod]);
      toast.success('Producto agregado!');
    }
    setForm(blank);
  }

  function startEdit(i) {
    setEditing(i);
    setForm({ ...products[i] });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(blank);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <div className="bg-[#003087] px-6 py-3">
          <span className="text-white font-semibold text-sm tracking-wide">
            {editing !== null ? 'EDITAR PRODUCTO' : 'AGREGAR PRODUCTO'}
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Field label="Nombre del producto" className="col-span-2">
              <Input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Cable UTP Cat 6A x 100m" />
            </Field>
            <Field label="Marca">
              <Input value={form.marca} onChange={e => setForm(p => ({ ...p, marca: e.target.value }))} placeholder="Ej: DAHUA" />
            </Field>
            <Field label="Unidad por defecto">
              <Select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}>
                {['UND','GL','ML','M','KG','HR'].map(u => <option key={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="Precio unitario ($)">
              <Input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} placeholder="0" className="text-right" />
            </Field>
            <Field label="Categoría">
              <Input value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))} placeholder="Ej: Redes, Cableado…" />
            </Field>
          </div>
          <div className="flex gap-2">
            {editing !== null && (
              <button onClick={cancelEdit} className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <X size={14} /> Cancelar
              </button>
            )}
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#003087] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002070] transition-colors">
              {editing !== null ? <><Check size={14} /> Guardar cambios</> : <><Plus size={14} /> Agregar producto</>}
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Sin productos. Agrega el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p, i) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-200">
              <div className="min-w-0 mr-3">
                <p className="font-medium text-sm text-gray-900 truncate">{p.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.marca && `${p.marca} · `}{p.cat && `${p.cat} · `}{p.unidad}</p>
                <p className="text-sm font-semibold text-[#003087] mt-1">{fmt(p.precio)}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => startEdit(i)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
                  <Pencil size={13} />
                </button>
                <button onClick={async () => { 
                  const result = await Swal.fire({
                    title: '¿Eliminar producto?',
                    text: p.nombre,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#003087',
                    cancelButtonColor: '#e53e3e',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                  });
                  if (result.isConfirmed) {
                    setProducts(prev => prev.filter((_,j)=>j!==i));
                    toast.success('Producto eliminado');
                  }
                }}
                  className="p-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TAB: CLIENTES ─────────────────────────────────────────────────────────────
function Clientes({ clients, setClients, onSelectClient }) {
  const blank = { ref: '', atencion: '', correo: '', tel: '' };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  function handleSave() {
    if (!form.ref) { 
      toast.error('Ingresa la referencia del cliente'); 
      return; 
    }
    const client = { ...form, id: editing !== null ? clients[editing].id : uid() };
    if (editing !== null) {
      setClients(prev => prev.map((c, i) => i === editing ? client : c));
      setEditing(null);
      toast.success('Cliente actualizado!');
    } else {
      setClients(prev => [...prev, client]);
      toast.success('Cliente agregado!');
    }
    setForm(blank);
  }

  function startEdit(i) {
    setEditing(i);
    setForm({ ...clients[i] });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(blank);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        <div className="bg-[#003087] px-6 py-3">
          <span className="text-white font-semibold text-sm tracking-wide">
            {editing !== null ? 'EDITAR CLIENTE' : 'AGREGAR CLIENTE'}
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Referencia/Proyecto">
              <Input value={form.ref} onChange={e => setForm(p => ({ ...p, ref: e.target.value }))} placeholder="Ej: Cliente ABC" />
            </Field>
            <Field label="Atención">
              <Input value={form.atencion} onChange={e => setForm(p => ({ ...p, atencion: e.target.value }))} placeholder="Nombre del contacto" />
            </Field>
            <Field label="Correo">
              <Input value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} placeholder="correo@empresa.com" />
            </Field>
            <Field label="Teléfono">
              <Input value={form.tel} onChange={e => setForm(p => ({ ...p, tel: e.target.value }))} placeholder="Teléfono" />
            </Field>
          </div>
          <div className="flex gap-2">
            {editing !== null && (
              <button onClick={cancelEdit} className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <X size={14} /> Cancelar
              </button>
            )}
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#003087] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#002070] transition-colors">
              {editing !== null ? <><Check size={14} /> Guardar cambios</> : <><Plus size={14} /> Agregar cliente</>}
            </button>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Sin clientes. Agrega el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {clients.map((c, i) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-200">
              <div className="min-w-0 mr-3">
                <p className="font-medium text-sm text-gray-900 truncate">{c.ref}</p>
                {c.atencion && <p className="text-xs text-gray-400 mt-0.5">👤 {c.atencion}</p>}
                {c.correo && <p className="text-xs text-gray-400">📧 {c.correo}</p>}
                {c.tel && <p className="text-xs text-gray-400">📞 {c.tel}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {onSelectClient && (
                  <button onClick={() => onSelectClient(c)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
                    <Copy size={13} />
                  </button>
                )}
                <button onClick={() => startEdit(i)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
                  <Pencil size={13} />
                </button>
                <button onClick={async () => { 
                  const result = await Swal.fire({
                    title: '¿Eliminar cliente?',
                    text: c.ref,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#003087',
                    cancelButtonColor: '#e53e3e',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                  });
                  if (result.isConfirmed) {
                    setClients(prev => prev.filter((_,j)=>j!==i));
                    toast.success('Cliente eliminado');
                  }
                }}
                  className="p-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('nueva');
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loadedCotiz, setLoadedCotiz] = useState(null);
  const [lastQuoteNumber, setLastQuoteNumber] = useState(569); // Empezamos en 569
  const [clients, setClients] = useState([]); // Estado para guardar clientes

  function handleSave(c) {
    setCotizaciones(prev => [c, ...prev]);
    // Actualizar el último número de cotización si el actual es mayor
    if (c.numero > lastQuoteNumber) {
      setLastQuoteNumber(c.numero);
    }
  }

  function handleLoad(c) {
    setLoadedCotiz(c);
    setTab('nueva');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header tab={tab} setTab={setTab} />
      {tab === 'nueva' && (
        <NuevaCotizacion
          key={loadedCotiz?.id || 'new'}
          products={products}
          onSave={handleSave}
          initialData={loadedCotiz}
          lastQuoteNumber={lastQuoteNumber}
          clients={clients}
        />
      )}
      {tab === 'guardadas' && (
        <Guardadas cotizaciones={cotizaciones} onDelete={id => setCotizaciones(prev => prev.filter(x => x.id !== id))} onLoad={handleLoad} />
      )}
      {tab === 'clientes' && (
        <Clientes clients={clients} setClients={setClients} />
      )}
      {tab === 'productos' && (
        <Productos products={products} setProducts={setProducts} />
      )}
    </div>
  );
}