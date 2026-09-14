import React, { useState, useRef } from 'react';
import { Download, Maximize2 } from 'lucide-react';

export default function ResizeImage() {
  const [src, setSrc] = useState(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [name, setName] = useState('');
  const ref = useRef(null);

  const load = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { setOrigW(img.width); setOrigH(img.height); setW(img.width); setH(img.height); setSrc(e.target.result); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const onW = (val) => { const nw = +val; setW(nw); if (lock && origW) setH(Math.round(nw * (origH / origW))); };
  const onH = (val) => { const nh = +val; setH(nh); if (lock && origH) setW(Math.round(nh * (origW / origH))); };

  const download = () => {
    const img = new Image(); img.src = src;
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      const a = document.createElement('a'); a.href = c.toDataURL('image/png', 1.0); a.download = name.replace(/\.[^.]+$/, '') + `-${w}x${h}.png`; a.click();
    };
  };

  const applyPreset = (targetW, targetH) => {
    if (lock && origW && origH) {
      onW(targetW);
    } else {
      setW(targetW);
      setH(targetH);
    }
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); load(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => load(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><Maximize2 size={22} /></div>
      <div className="dropzone-title">Upload an image to resize</div>
      <div className="dropzone-subtitle">Resize to 720p, 1080p Full HD, 4K Ultra HD, or custom pixel dimensions</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <img src={src} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }} />
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Original: {origW} × {origH} px</div>
        </div>
      </div>

      {/* HD Preset Buttons */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label className="control-label" style={{ marginBottom: '0.4rem' }}>Quick HD Presets</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(1280, 720)}>720p HD (1280px)</button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(1920, 1080)}>1080p Full HD (1920px)</button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(2560, 1440)}>2K QHD (2560px)</button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(3840, 2160)}>4K Ultra HD (3840px)</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Width (px)</label>
          <input type="number" className="form-input" value={w} onChange={e => onW(e.target.value)} />
        </div>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Height (px)</label>
          <input type="number" className="form-input" value={h} onChange={e => onH(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={lock} onChange={() => setLock(!lock)} /> Lock ratio
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setSrc(null)}>Change Image</button>
        <button className="btn btn-green" onClick={download}><Download size={15} /> Download {w}×{h} HD Image</button>
      </div>
    </div>
  );
}
