import React, { useState, useRef } from 'react';
import { Upload, Download, ImagePlus } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function ImagesToPdf() {
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const addImages = (list) => {
    const valid = Array.from(list).filter(f => f.type.startsWith('image/'));
    valid.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, { id: Math.random().toString(36).slice(2), name: f.name, type: f.type, dataUrl: e.target.result }]);
      };
      reader.readAsDataURL(f);
    });
  };

  const convert = async () => {
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      for (const img of images) {
        const resp = await fetch(img.dataUrl);
        const buf = await resp.arrayBuffer();
        let embedded;
        if (img.type === 'image/png') embedded = await doc.embedPng(buf);
        else embedded = await doc.embedJpg(buf);
        const { width, height } = embedded.scale(1);
        const page = doc.addPage([width, height]);
        page.drawImage(embedded, { x: 0, y: 0, width, height });
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([await doc.save()], { type: 'application/pdf' }));
      a.download = 'images.pdf'; a.click();
    } catch (e) { console.error(e); alert('Conversion failed — try using PNG or JPG images'); }
    setBusy(false);
  };

  if (images.length === 0) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addImages(e.dataTransfer.files); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => addImages(e.target.files)} accept="image/*" multiple hidden />
      <div className="dropzone-icon"><ImagePlus size={22} /></div>
      <div className="dropzone-title">Upload images to convert to PDF</div>
      <div className="dropzone-subtitle">Each image becomes one page (PNG & JPG supported)</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {images.map((img, i) => (
          <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-main)', aspectRatio: '1' }}>
            <img src={img.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', top: 4, right: 4, fontSize: '0.6rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>{i + 1}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => ref.current?.click()}><Upload size={13} /> Add More</button>
        <button className="btn btn-blue" style={{ flex: 1 }} onClick={convert} disabled={busy}>
          <Download size={15} /> {busy ? 'Converting...' : `Convert ${images.length} Images to PDF`}
        </button>
        <input type="file" ref={ref} onChange={e => addImages(e.target.files)} accept="image/*" multiple hidden />
      </div>
    </div>
  );
}
