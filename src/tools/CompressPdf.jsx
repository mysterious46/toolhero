import React, { useState, useRef } from 'react';
import { Download, Minimize2, Check, AlertCircle, FileText, Zap } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

/* ─── Compression Level Options ─── */
const COMPRESSION_LEVELS = [
  {
    id: 'ultra',
    title: 'Ultra Compact (Max Compression)',
    desc: 'Smallest file size (~75-90% reduction). Ideal for strict email & portal limits.',
    scale: 0.6,
    quality: 0.25,
    badge: 'Max Reduction'
  },
  {
    id: 'extreme',
    title: 'Strong Compression',
    desc: 'High size reduction (~60-75% reduction) with good text clarity.',
    scale: 0.8,
    quality: 0.45,
    badge: 'High Reduction'
  },
  {
    id: 'recommended',
    title: 'Recommended Compression',
    desc: 'Balanced quality & size (~40-60% reduction). Perfect for everyday use.',
    scale: 1.0,
    quality: 0.65,
    badge: 'Recommended'
  },
  {
    id: 'less',
    title: 'Low Compression',
    desc: 'Subtle compression (~20-40% reduction), preserves sharp image detail.',
    scale: 1.3,
    quality: 0.82,
    badge: 'High Quality'
  },
];

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('recommended');
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const fmt = (b) => {
    if (!b) return '0 B';
    return b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setFile({ name: f.name, buf: await f.arrayBuffer(), size: f.size });
    setResult(null);
    setProgress('');
  };

  const compressPdf = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);

    const config = COMPRESSION_LEVELS.find(l => l.id === level) || COMPRESSION_LEVELS[2];

    try {
      setProgress('Initializing PDF compressor...');
      let pdfDoc;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(file.buf),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true
        });
        pdfDoc = await loadingTask.promise;
      } catch (wErr) {
        console.warn('Worker blocked, using inline parser:', wErr);
        const fallbackTask = pdfjsLib.getDocument({
          data: new Uint8Array(file.buf),
          disableWorker: true
        });
        pdfDoc = await fallbackTask.promise;
      }
      const totalPages = pdfDoc.numPages;

      const outPdf = await PDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        setProgress(`Compressing page ${i} of ${totalPages}...`);
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: config.scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        const jpegDataUrl = canvas.toDataURL('image/jpeg', config.quality);
        const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());

        const embeddedImg = await outPdf.embedJpg(jpegBytes);
        const outPage = outPdf.addPage([viewport.width / config.scale, viewport.height / config.scale]);
        outPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: viewport.width / config.scale,
          height: viewport.height / config.scale,
        });
      }

      setProgress('Optimizing compressed PDF streams...');
      let compressedBytes = await outPdf.save({ useObjectStreams: true });

      // SMART SIZE GUARD: If rasterization resulted in a larger file (e.g. multi-page text PDF),
      // automatically fallback to native object stream optimization!
      if (compressedBytes.byteLength >= file.size) {
        setProgress('Applying native PDF stream optimization...');
        const nativeDoc = await PDFDocument.load(file.buf);
        const nativeBytes = await nativeDoc.save({ useObjectStreams: true });
        
        if (nativeBytes.byteLength < file.size) {
          compressedBytes = nativeBytes;
        } else {
          compressedBytes = new Uint8Array(file.buf);
        }
      }

      const compressedSize = compressedBytes.byteLength;
      const savings = Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100));

      setResult({
        bytes: compressedBytes,
        size: compressedSize,
        savings,
        originalSize: file.size,
      });
    } catch (err) {
      console.warn('Canvas compression fallback invoked:', err);
      try {
        setProgress('Optimizing PDF structure...');
        const doc = await PDFDocument.load(file.buf);
        let bytes = await doc.save({ useObjectStreams: true });
        if (bytes.byteLength >= file.size) {
          bytes = new Uint8Array(file.buf);
        }
        const compressedSize = bytes.byteLength;
        const savings = Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100));
        setResult({
          bytes,
          size: compressedSize,
          savings,
          originalSize: file.size,
        });
      } catch (e) {
        alert('Could not process this PDF file. Please try another file.');
      }
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([result.bytes], { type: 'application/pdf' }));
    a.download = file.name.replace(/\.[^.]+$/, '') + '-compressed.pdf';
    a.click();
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
      <div className="dropzone-icon"><Minimize2 size={24} /></div>
      <div className="dropzone-title">Upload PDF to compress</div>
      <div className="dropzone-subtitle">Reduce PDF file size by up to 90% with custom browser-side compression presets</div>
      <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select PDF Document</button>
    </div>
  );

  return (
    <div className="tool-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Original Size: {fmt(file.size)}</div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setResult(null); }}>
          Change Document
        </button>
      </div>

      {!result && (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
              Select Compression Preset
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {COMPRESSION_LEVELS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setLevel(opt.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: `1.5px solid ${level === opt.id ? '#2563eb' : 'var(--border-main)'}`,
                    backgroundColor: level === opt.id ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: level === opt.id ? '#2563eb' : 'var(--text-primary)' }}>
                      {opt.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: level === opt.id ? '#2563eb' : 'var(--bg-elevated)', color: level === opt.id ? '#ffffff' : 'var(--text-secondary)' }}>
                      {opt.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {busy && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(37, 99, 235, 0.06)', borderRadius: '8px', marginBottom: '1rem', color: '#2563eb', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} className="animate-spin" /> {progress}
            </div>
          )}

          <button
            className="btn btn-blue"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
            disabled={busy}
            onClick={compressPdf}
          >
            {busy ? progress || 'Compressing PDF...' : 'Compress PDF File'}
          </button>
        </>
      )}

      {result && (
        <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.06)', border: '1px solid rgba(22, 163, 74, 0.2)', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <Check size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.2rem' }}>PDF Compressed Successfully!</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {result.savings > 0 
              ? `Reduced from ${fmt(result.originalSize)} to ${fmt(result.size)} (${result.savings}% size reduction).`
              : `Optimized at minimum size ${fmt(result.size)} (Already fully compressed).`
            }
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-green" style={{ padding: '0.65rem 1.25rem' }} onClick={downloadResult}>
              <Download size={16} /> Download Compressed PDF
            </button>
            <button className="btn btn-secondary" onClick={() => { setFile(null); setResult(null); }}>
              Compress Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
