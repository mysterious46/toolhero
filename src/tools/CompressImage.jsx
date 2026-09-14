import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileArchive, Minimize2 } from 'lucide-react';
import JSZip from 'jszip';

export default function CompressImage() {
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState(25); // 10% = Light compression, 90% = Max compression
  const [format, setFormat] = useState('image/webp');
  const ref = useRef(null);

  const fmt = (b) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(2) + ' MB';

  const addFiles = (list) => {
    const valid = Array.from(list).filter(f => f.type.startsWith('image/'));
    const entries = valid.map(f => ({ id: Math.random().toString(36).slice(2), file: f, origSize: f.size, url: URL.createObjectURL(f), compressed: null }));
    setFiles(prev => [...prev, ...entries]);
  };

  useEffect(() => {
    if (!files.length) return;

    const quality = Math.max(0.05, Math.min(0.95, (100 - compressionLevel) / 100));

    Promise.all(files.map(item => new Promise(resolve => {
      const img = new Image();
      img.src = item.url;
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0);

        const mime = format === 'original' ? (item.file.type || 'image/jpeg') : format;
        c.toBlob(blob => {
          if (blob) {
            resolve({
              ...item,
              compressed: {
                url: URL.createObjectURL(blob),
                size: blob.size,
                blob,
                ext: mime.split('/')[1] || 'webp'
              }
            });
          } else {
            resolve(item);
          }
        }, mime, quality);
      };
    }))).then(setFiles);
  }, [compressionLevel, format, files.length]);

  const dlOne = (item) => {
    if (!item.compressed) return;
    const a = document.createElement('a');
    a.href = item.compressed.url;
    const base = item.file.name.replace(/\.[^.]+$/, '');
    a.download = `${base}-compressed.${item.compressed.ext}`;
    a.click();
  };

  const dlAll = async () => {
    if (files.length === 1) {
      dlOne(files[0]);
      return;
    }

    const zip = new JSZip();
    files.forEach(item => {
      if (item.compressed?.blob) {
        const base = item.file.name.replace(/\.[^.]+$/, '');
        zip.file(`${base}-compressed.${item.compressed.ext}`, item.compressed.blob);
      }
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'compressed-images.zip';
    a.click();
  };

  const getCompressionLabel = (val) => {
    if (val <= 20) return 'Light (High Quality)';
    if (val <= 50) return 'Balanced (Recommended)';
    if (val <= 75) return 'Strong Reduction';
    return 'Maximum Compression (Smallest File)';
  };

  if (!files.length) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => addFiles(e.target.files)} accept="image/*" multiple hidden />
      <div className="dropzone-icon"><Minimize2 size={22} /></div>
      <div className="dropzone-title">Upload images to compress</div>
      <div className="dropzone-subtitle">PNG, JPG, WebP — batch supported</div>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        
        {/* Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.15rem' }}>
          
          {/* Compression Level Slider */}
          <div className="control-group" style={{ marginBottom: 0 }}>
            <div className="control-label">
              <span>Compression Level</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {compressionLevel}% ({getCompressionLabel(compressionLevel)})
              </span>
            </div>
            <input
              type="range"
              className="custom-slider"
              min="5"
              max="90"
              value={compressionLevel}
              onChange={e => setCompressionLevel(+e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              <span>5% (Best Quality)</span>
              <span>50% (Balanced)</span>
              <span>90% (Smallest Size)</span>
            </div>
          </div>

          {/* Target Format */}
          <div className="control-group" style={{ marginBottom: 0 }}>
            <div className="control-label">Target Format</div>
            <select className="form-input" value={format} onChange={e => setFormat(e.target.value)}>
              <option value="image/webp">WebP (Recommended for Web)</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="original">Keep Original Format</option>
            </select>
          </div>

        </div>

        {/* Action Toolbar Row (Prevents overflow across all viewports) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem', marginTop: '1.15rem', paddingTop: '1rem', borderTop: '1px solid var(--border-main)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => ref.current?.click()}>
            <Upload size={13} /> Add More Images
          </button>

          {files.length > 1 ? (
            <button className="btn btn-green btn-sm" onClick={dlAll}>
              <FileArchive size={14} /> Download All {files.length} Images (.ZIP)
            </button>
          ) : (
            <button className="btn btn-green btn-sm" onClick={() => dlOne(files[0])}>
              <Download size={14} /> Download Compressed Image
            </button>
          )}

          <input type="file" ref={ref} onChange={e => addFiles(e.target.files)} accept="image/*" multiple hidden />
        </div>

      </div>

      {/* Compressed File Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {files.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.85rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '160px' }}>
              <img src={item.compressed?.url || item.url} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-main)' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Original: {fmt(item.origSize)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {item.compressed && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green)' }}>{fmt(item.compressed.size)}</div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--green)', background: 'var(--green-soft)', padding: '1px 5px', borderRadius: '3px' }}>
                    {item.origSize > item.compressed.size ? `-${Math.round(((item.origSize - item.compressed.size) / item.origSize) * 100)}% Reduced` : 'Optimized'}
                  </span>
                </div>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => dlOne(item)}>
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
