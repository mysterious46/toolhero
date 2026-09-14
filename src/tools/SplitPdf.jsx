import React, { useState, useRef } from 'react';
import { Upload, Download, Scissors, AlertCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [range, setRange] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setError('');
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      setFile({ name: f.name, buf });
      setTotalPages(doc.getPageCount());
    } catch (err) {
      console.error(err);
      setError('Could not load PDF document. Please verify the file is valid.');
    }
  };

  const split = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const src = await PDFDocument.load(file.buf);
      let indices = [];
      if (!range.trim()) { indices = src.getPageIndices(); }
      else {
        for (const p of range.split(',')) {
          if (p.includes('-')) {
            const [s, e] = p.split('-').map(n => parseInt(n.trim()));
            for (let i = s; i <= e && i <= totalPages; i++) if (i >= 1) indices.push(i - 1);
          } else {
            const n = parseInt(p.trim());
            if (n >= 1 && n <= totalPages) indices.push(n - 1);
          }
        }
      }
      if (indices.length === 0) {
        setError('Please enter a valid page range (e.g. 1-3 or 2,4,6).');
        setBusy(false);
        return;
      }
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(src, indices);
      copied.forEach(p => newPdf.addPage(p));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([await newPdf.save()], { type: 'application/pdf' }));
      a.download = file.name.replace(/\.[^.]+$/, '') + '-split.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      setError('Could not split PDF document. Please check page range inputs.');
    } finally {
      setBusy(false);
    }
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
      <div className="dropzone-icon"><Scissors size={22} /></div>
      <div className="dropzone-title">Upload a PDF to split</div>
      <div className="dropzone-subtitle">Extract specific pages into a new PDF</div>
      {error && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="tool-box">
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        <strong>{file.name}</strong> — {totalPages} pages total
      </p>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
          Page Selection Range (e.g. 1-3, 5, 7-10)
        </label>
        <input
          type="text"
          placeholder={`Enter pages (1-${totalPages}) or leave empty for all`}
          value={range}
          onChange={e => setRange(e.target.value)}
          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-blue" style={{ flex: 1, padding: '0.75rem' }} disabled={busy} onClick={split}>
          {busy ? 'Extracting Pages...' : 'Split & Download Selected Pages'}
        </button>
        <button className="btn btn-secondary" onClick={() => { setFile(null); setError(''); }}>
          Change File
        </button>
      </div>
    </div>
  );
}
