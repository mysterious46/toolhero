import React, { useState, useRef } from 'react';
import { Download, RotateCw, AlertCircle } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

export default function RotatePdf() {
  const [file, setFile] = useState(null);
  const [angle, setAngle] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setError('');
    try {
      const buf = await f.arrayBuffer();
      setFile({ name: f.name, buf });
    } catch (err) {
      console.error(err);
      setError('Could not load PDF document. Please verify the file is valid.');
    }
  };

  const rotate = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const doc = await PDFDocument.load(file.buf);
      doc.getPages().forEach(page => { page.setRotation(degrees(page.getRotation().angle + angle)); });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([await doc.save()], { type: 'application/pdf' }));
      a.download = file.name.replace(/\.[^.]+$/, '') + '-rotated.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      setError('Could not rotate PDF document. Please try another file.');
    } finally {
      setBusy(false);
    }
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
      <div className="dropzone-icon"><RotateCw size={22} /></div>
      <div className="dropzone-title">Upload a PDF to rotate</div>
      <div className="dropzone-subtitle">Rotate all pages by 90°, 180°, or 270°</div>
      {error && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="tool-box">
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}><strong>{file.name}</strong></p>
      
      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="control-group" style={{ maxWidth: '300px', marginBottom: '1rem' }}>
        <label className="control-label">Rotation angle</label>
        <select className="form-input" value={angle} onChange={e => setAngle(Number(e.target.value))}>
          <option value={90}>90° clockwise</option>
          <option value={180}>180°</option>
          <option value={270}>270° clockwise</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setError(''); }}>Change File</button>
        <button className="btn btn-blue" onClick={rotate} disabled={busy}><Download size={15} /> {busy ? 'Rotating...' : 'Rotate & Download'}</button>
      </div>
    </div>
  );
}
