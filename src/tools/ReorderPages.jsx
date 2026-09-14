import React, { useState, useRef } from 'react';
import { Download, Move, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function ReorderPages() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    const buf = await f.arrayBuffer();
    const doc = await PDFDocument.load(buf);
    const count = doc.getPageCount();
    setFile({ name: f.name, buf });
    setPages(Array.from({ length: count }, (_, i) => i));
  };

  const moveUp = (i) => {
    if (i === 0) return;
    setPages(prev => { const n = [...prev]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; });
  };
  const moveDown = (i) => {
    if (i === pages.length - 1) return;
    setPages(prev => { const n = [...prev]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; });
  };

  const reorder = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await PDFDocument.load(file.buf);
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(src, pages);
      copied.forEach(p => newPdf.addPage(p));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([await newPdf.save()], { type: 'application/pdf' }));
      a.download = 'reordered.pdf'; a.click();
    } catch (e) { alert('Reorder failed'); }
    setBusy(false);
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
      <div className="dropzone-icon"><Move size={22} /></div>
      <div className="dropzone-title">Upload a PDF to reorder pages</div>
      <div className="dropzone-subtitle">Move pages up or down to rearrange their order</div>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}><strong>{file.name}</strong> — {pages.length} pages. Use arrows to reorder:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', maxHeight: '350px', overflowY: 'auto' }}>
        {pages.map((origIdx, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--blue)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Page {origIdx + 1}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => moveUp(i)} disabled={i === 0} style={{ padding: '0.25rem 0.4rem' }}><ArrowUp size={14} /></button>
              <button className="btn btn-secondary btn-sm" onClick={() => moveDown(i)} disabled={i === pages.length - 1} style={{ padding: '0.25rem 0.4rem' }}><ArrowDown size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setFile(null)}>Change File</button>
        <button className="btn btn-blue" onClick={reorder} disabled={busy}><Download size={15} /> {busy ? 'Saving...' : 'Save & Download'}</button>
      </div>
    </div>
  );
}
