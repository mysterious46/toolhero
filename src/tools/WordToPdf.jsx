import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, RefreshCw, Eye, ZoomIn, ZoomOut, Printer, CheckCircle2 } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [arrayBuf, setArrayBuf] = useState(null);
  const [rendered, setRendered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const fileRef = useRef(null);
  const containerRef = useRef(null);

  const loadFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext !== 'docx') {
      alert('Please upload a .docx file. Older .doc format is not supported.');
      return;
    }
    setBusy(true);
    setRendered(false);
    setPageCount(0);
    try {
      const buf = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size });
      setArrayBuf(buf);
    } catch (err) {
      console.error(err);
      alert('Failed to read the file.');
      setBusy(false);
    }
  };

  // Render DOCX when arrayBuf changes
  useEffect(() => {
    if (!arrayBuf || !containerRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const docxPreview = await import('docx-preview');

        // Clear previous render
        containerRef.current.innerHTML = '';

        await docxPreview.renderAsync(arrayBuf, containerRef.current, null, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
          experimental: true,
          trimXmlDeclaration: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });

        if (!cancelled) {
          // Calculate realistic page count based on A4 aspect ratio (297/210 ≈ 1.414)
          const sections = containerRef.current.querySelectorAll('section');
          let estimatedPages = 0;
          sections.forEach(s => {
            const h = s.offsetHeight || 0;
            const w = s.offsetWidth || 794;
            const sub = Math.max(1, Math.ceil((h - 20) / (w * 1.414)));
            estimatedPages += sub;
          });
          setPageCount(estimatedPages || (sections.length || 1));
          setRendered(true);
        }
      } catch (err) {
        console.error('DOCX render error:', err);
        if (!cancelled) alert('Failed to render the document. Make sure it\'s a valid .docx file.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => { cancelled = true; };
  }, [arrayBuf]);

  const convertToPdf = async () => {
    if (!rendered || !containerRef.current) return;
    setConverting(true);
    setProgressMsg('Preparing document pages...');

    const origTransform = containerRef.current.style.transform;

    try {
      // Temporarily reset preview zoom for high-res capture
      containerRef.current.style.transform = 'none';

      // Find all sections or pages rendered by docx-preview
      let sections = Array.from(containerRef.current.querySelectorAll('section'));
      if (!sections.length) {
        sections = Array.from(containerRef.current.querySelectorAll('.docx-wrapper > *, [class*="docx-wrapper"] > *'));
      }
      if (!sections.length) {
        sections = Array.from(containerRef.current.querySelectorAll('.docx, [class*="docx"]'));
      }
      if (!sections.length && containerRef.current.children.length) {
        sections = Array.from(containerRef.current.children);
      }

      if (!sections.length) {
        alert('No rendered pages found to convert. Please try reloading your file.');
        setConverting(false);
        containerRef.current.style.transform = origTransform;
        return;
      }

      const { default: html2canvas } = await import('html2canvas-pro');
      const { jsPDF } = await import('jspdf');

      const pageImages = [];

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        setProgressMsg(`Processing page ${i + 1} of ${sections.length}...`);

        const canvas = await html2canvas(section, {
          scale: 2, // 2x high resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });

        pageImages.push({
          dataUrl: canvas.toDataURL('image/jpeg', 0.95),
          width: canvas.width,
          height: canvas.height,
        });
      }

      if (!pageImages.length) {
        alert('Failed to capture document pages.');
        setConverting(false);
        containerRef.current.style.transform = origTransform;
        return;
      }

      setProgressMsg('Assembling PDF document...');

      // Standard A4 dimensions in mm
      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const A4_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM; // ~1.4142

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      let isFirstPage = true;

      for (let i = 0; i < pageImages.length; i++) {
        const img = pageImages[i];
        const pageHeightPx = img.width * A4_RATIO;
        const subPages = Math.max(1, Math.ceil((img.height - 15) / pageHeightPx));

        if (subPages === 1) {
          // Normal single page
          if (!isFirstPage) pdf.addPage('a4', 'portrait');
          isFirstPage = false;
          pdf.addImage(img.dataUrl, 'JPEG', 0, 0, A4_WIDTH_MM, (img.height / img.width) * A4_WIDTH_MM);
        } else {
          // Multi-page continuous section: slice into A4 chunks
          const imgObj = new Image();
          imgObj.src = img.dataUrl;
          await new Promise((res) => { imgObj.onload = res; });

          for (let p = 0; p < subPages; p++) {
            const sY = p * pageHeightPx;
            const sH = Math.min(pageHeightPx, img.height - sY);

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = img.width;
            sliceCanvas.height = pageHeightPx;
            const ctx = sliceCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(imgObj, 0, sY, img.width, sH, 0, 0, img.width, sH);

            if (!isFirstPage) pdf.addPage('a4', 'portrait');
            isFirstPage = false;

            pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
          }
        }
      }

      const outName = (file?.name || 'document').replace(/\.docx$/i, '') + '.pdf';
      pdf.save(outName);
      setProgressMsg('Done! Downloading PDF...');
    } catch (err) {
      console.error('PDF conversion error:', err);
      alert('PDF conversion failed: ' + (err.message || 'Please try again.'));
    } finally {
      if (containerRef.current) {
        containerRef.current.style.transform = origTransform;
      }
      setConverting(false);
      setProgressMsg('');
    }
  };

  const printDocument = () => {
    if (!containerRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up was blocked. Please allow pop-ups for this site, or use the direct "Download as PDF" button.');
      return;
    }

    const docStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${(file?.name || 'Document').replace(/\.docx$/i, '')}</title>
          ${docStyles}
          <style>
            @page { margin: 15mm; size: auto; }
            body { margin: 0; padding: 20px; background: white !important; font-family: system-ui, sans-serif; }
            .docx-wrapper { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
            section.docx, section { box-shadow: none !important; margin: 0 auto 20px auto !important; background: white !important; page-break-after: always; break-after: page; }
            @media print {
              body { padding: 0 !important; }
              section.docx, section { margin: 0 !important; box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          ${containerRef.current.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (!file) return (
    <div>
      <AdBanner slotType="leaderboard" />
      <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileRef.current?.click()}>
        <input type="file" ref={fileRef} onChange={e => loadFile(e.target.files[0])} accept=".docx" hidden />
        <div className="dropzone-icon"><FileText size={24} /></div>
        <div className="dropzone-title">Upload Word Document (.docx)</div>
        <div className="dropzone-subtitle">Your document will be rendered exactly as it looks, then converted to high-quality PDF</div>
        <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select DOCX File</button>
      </div>
    </div>
  );

  return (
    <div>
      <AdBanner slotType="leaderboard" />
      <div className="tool-box">
        {/* File info bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-main)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{formatSize(file.size)}</span>
              {rendered && (
                <>
                  <span>·</span>
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CheckCircle2 size={12} /> {pageCount} {pageCount === 1 ? 'page' : 'pages'} rendered
                  </span>
                </>
              )}
              {busy && <span>· Rendering document...</span>}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setArrayBuf(null); setRendered(false); if (containerRef.current) containerRef.current.innerHTML = ''; }}>
            <RefreshCw size={13} /> Change File
          </button>
        </div>

        {/* Zoom & View Controls */}
        {rendered && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={14} color="var(--text-tertiary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Document Preview</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.max(25, z - 15))} style={{ padding: '3px 8px' }}>
                <ZoomOut size={14} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '38px', textAlign: 'center' }}>{zoom}%</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.min(200, z + 15))} style={{ padding: '3px 8px' }}>
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {busy && (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rendering document...</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>Preserving original layout, fonts, and formatting</div>
          </div>
        )}

        {/* DOCX Preview Scroll Viewport - Always mounted so containerRef.current is ready */}
        <div
          style={{
            display: rendered ? 'block' : 'none',
            maxHeight: '540px',
            overflow: 'auto',
            background: '#525659',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-main)',
            padding: '1.25rem 0.5rem',
            marginBottom: '1.25rem',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <div
            ref={containerRef}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          />
        </div>

        {/* Conversion In-Progress */}
        {converting && (
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{progressMsg}</div>
          </div>
        )}

        {/* Action Buttons */}
        {rendered && !converting && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.6rem' }}>
            <button
              className="btn btn-blue"
              style={{ padding: '0.85rem', fontSize: '0.95rem' }}
              onClick={convertToPdf}
            >
              <Download size={16} />
              Download as PDF
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.1rem', fontSize: '0.9rem' }}
              onClick={printDocument}
              title="Open browser print dialog to save as vector PDF with selectable text"
            >
              <Printer size={16} />
              Print / Save as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
