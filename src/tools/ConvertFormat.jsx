import React, { useState, useRef } from 'react';
import { Download, ArrowRightLeft } from 'lucide-react';

export default function ConvertFormat() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('image/webp');
  const ref = useRef(null);

  const load = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => setSrc(e.target.result);
    reader.readAsDataURL(f);
  };

  const convert = () => {
    const img = new Image(); img.src = src;
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0);
      const ext = target.split('/')[1];
      const a = document.createElement('a'); a.href = c.toDataURL(target, 0.98);
      a.download = name.replace(/\.[^.]+$/, '') + '.' + ext; a.click();
    };
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); load(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => load(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><ArrowRightLeft size={22} /></div>
      <div className="dropzone-title">Upload an image to convert</div>
      <div className="dropzone-subtitle">Convert between PNG, JPG, and WebP</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <img src={src} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }} />
        <div><div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{name}</div></div>
      </div>
      <div className="control-group" style={{ maxWidth: '300px' }}>
        <label className="control-label">Convert to</label>
        <select className="form-input" value={target} onChange={e => setTarget(e.target.value)}>
          <option value="image/webp">WebP</option>
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setSrc(null)}>Change Image</button>
        <button className="btn btn-green" onClick={convert}><Download size={15} /> Convert & Download</button>
      </div>
    </div>
  );
}
