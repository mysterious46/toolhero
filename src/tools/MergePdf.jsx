import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Layers, AlertCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  const addFiles = async (list) => {
    setError('');
    const pdfs = Array.from(list).filter(f => f.type === 'application/pdf');
    const entries = [];
    try {
      for (const f of pdfs) {
        const buf = await f.arrayBuffer();
        const doc = await PDFDocument.load(buf);
        entries.push({ id: Math.random().toString(36).slice(2), file: f, pages: doc.getPageCount(), buf });
      }
      setFiles(prev => [...prev, ...entries]);
    } catch (err) {
      console.error(err);
      setError('Could not read one of the selected PDF files. Please ensure files are not encrypted.');
    }
  };

  const merge = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const merged = await PDFDocument.create();
      for (const item of files) {
        const src = await PDFDocument.load(item.buf);
        const copied = await merged.copyPages(src, src.getPageIndices());
        copied.forEach(p => merged.addPage(p));
      }
      download(await merged.save(), 'merged-document.pdf');
    } catch (e) {
      console.error(e);
      setError('Failed to merge PDF files. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const download = (bytes, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    a.download = name;
    a.click();
  };

  if (files.length === 0) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => addFiles(e.target.files)} accept=".pdf" multiple hidden />
      <div className="dropzone-icon"><Layers size={22} /></div>
      <div className="dropzone-title">Upload PDFs to merge</div>
      <div className="dropzone-subtitle">Select multiple PDF files — they'll be combined in order</div>
      {error && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="tool-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{files.length} PDFs Selected</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => ref.current?.click()}>+ Add More PDFs</button>
        <input type="file" ref={ref} onChange={e => addFiles(e.target.files)} accept=".pdf" multiple hidden />
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {files.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
              <FileText size={16} color="#2563eb" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idx + 1}. {item.file.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({item.pages} pgs)</span>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => setFiles(files.filter(f => f.id !== item.id))}>Remove</button>
          </div>
        ))}
      </div>

      <button className="btn btn-blue" style={{ width: '100%', padding: '0.75rem' }} disabled={busy} onClick={merge}>
        {busy ? 'Merging Documents...' : 'Merge All PDF Files'}
      </button>
    </div>
  );
}
