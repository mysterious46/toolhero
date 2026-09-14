import React, { useState, useRef } from 'react';
import { Download, RefreshCw } from 'lucide-react';

export default function RotateFlipImage() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const ref = useRef(null);

  const load = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => setSrc(e.target.result);
    reader.readAsDataURL(f);
  };

  const download = () => {
    const img = new Image(); img.src = src;
    img.onload = () => {
      const isRotated = rotation === 90 || rotation === 270;
      const cw = isRotated ? img.height : img.width;
      const ch = isRotated ? img.width : img.height;
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const ctx = c.getContext('2d');
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const a = document.createElement('a'); a.href = c.toDataURL('image/png');
      a.download = name.replace(/\.[^.]+$/, '') + '-transformed.png'; a.click();
    };
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); load(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => load(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><RefreshCw size={22} /></div>
      <div className="dropzone-title">Upload an image to rotate or flip</div>
      <div className="dropzone-subtitle">Rotate 90°/180°/270° or flip horizontal/vertical</div>
    </div>
  );

  const previewStyle = {
    maxWidth: '100%', maxHeight: '220px', display: 'block', margin: '0 auto',
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: 'transform 0.3s ease',
  };

  return (
    <div>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center', overflow: 'hidden' }}>
        <img src={src} alt="" style={previewStyle} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setRotation((rotation + 90) % 360)}><RefreshCw size={13} /> Rotate 90°</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setRotation((rotation + 180) % 360)}>Rotate 180°</button>
        <button className={`btn btn-sm ${flipH ? 'btn-green' : 'btn-secondary'}`} onClick={() => setFlipH(!flipH)}>Flip Horizontal</button>
        <button className={`btn btn-sm ${flipV ? 'btn-green' : 'btn-secondary'}`} onClick={() => setFlipV(!flipV)}>Flip Vertical</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSrc(null); setRotation(0); setFlipH(false); setFlipV(false); }}>Change Image</button>
        <button className="btn btn-green" onClick={download}><Download size={15} /> Download</button>
      </div>
    </div>
  );
}
