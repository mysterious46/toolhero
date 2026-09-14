import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Crop } from 'lucide-react';

export default function CropImage() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [imgDim, setImgDim] = useState({ w: 0, h: 0 });
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(100);
  const [cropH, setCropH] = useState(100);
  const ref = useRef(null);

  const load = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { setImgDim({ w: img.width, h: img.height }); setCropW(img.width); setCropH(img.height); setCropX(0); setCropY(0); setSrc(e.target.result); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const download = () => {
    const img = new Image(); img.src = src;
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = cropW; c.height = cropH;
      c.getContext('2d').drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const a = document.createElement('a'); a.href = c.toDataURL('image/png');
      a.download = name.replace(/\.[^.]+$/, '') + '-cropped.png'; a.click();
    };
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); load(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => load(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><Crop size={22} /></div>
      <div className="dropzone-title">Upload an image to crop</div>
      <div className="dropzone-subtitle">Set exact crop coordinates in pixels</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ maxWidth: '100%', overflow: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)', display: 'inline-block' }}>
          <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '300px', display: 'block' }} />
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>{name} — {imgDim.w} × {imgDim.h} px</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">X offset</label>
          <input type="number" className="form-input" value={cropX} min={0} max={imgDim.w} onChange={e => setCropX(+e.target.value)} />
        </div>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Y offset</label>
          <input type="number" className="form-input" value={cropY} min={0} max={imgDim.h} onChange={e => setCropY(+e.target.value)} />
        </div>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Width</label>
          <input type="number" className="form-input" value={cropW} min={1} onChange={e => setCropW(+e.target.value)} />
        </div>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Height</label>
          <input type="number" className="form-input" value={cropH} min={1} onChange={e => setCropH(+e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setSrc(null)}>Change Image</button>
        <button className="btn btn-green" onClick={download}><Download size={15} /> Crop & Download</button>
      </div>
    </div>
  );
}
