import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, RefreshCw, Eye, ZoomIn, ZoomOut, Printer, CheckCircle2, Sparkles } from 'lucide-react';
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
          hideWrapperOnPrint: true,
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
          const sections = containerRef.current.querySelectorAll('section');
          let count = sections.length;
          if (!count) {
            // Continuous single section estimation
            const h = containerRef.current.offsetHeight || 0;
            const w = containerRef.current.offsetWidth || 794;
            count = Math.max(1, Math.ceil((h - 20) / (w * 1.414)));
          }
          setPageCount(count);
          setRendered(true);
        }
      } catch (err) {
        console.error('DOCX render error:', err);
        if (!cancelled) alert('Failed to render the document: ' + (err.message || ''));
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => { cancelled = true; };
  }, [arrayBuf]);

  /**
   * Direct high-resolution PDF generation (1-click download)
   */
  const convertToPdf = async () => {
    if (!rendered || !containerRef.current) return;
    setConverting(true);
    setProgressMsg('Preparing high-res document capture...');

    const origTransform = containerRef.current.style.transform;

    try {
      containerRef.current.style.transform = 'none';

      // Find all rendered page sections
      let sections = Array.from(containerRef.current.querySelectorAll('section.docx, section'));
      if (!sections.length) {
        sections = Array.from(containerRef.current.querySelectorAll('.docx-wrapper > *'));
      }
      if (!sections.length && containerRef.current.children.length) {
        sections = Array.from(containerRef.current.children);
      }

      if (!sections.length) {
        alert('No rendered pages found to convert.');
        setConverting(false);
        containerRef.current.style.transform = origTransform;
        return;
      }

      const { default: html2canvas } = await import('html2canvas-pro');
      const { jsPDF } = await import('jspdf');

      const A4_WIDTH_MM = 210;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let isFirstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        setProgressMsg(`Capturing page ${i + 1} of ${sections.length} (Ultra-HD)...`);

        const canvas = await html2canvas(section, {
          scale: 2, // 2x crisp high-res
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });

        const pageHeightMm = (canvas.height / canvas.width) * A4_WIDTH_MM;

        if (!isFirstPage) {
          pdf.addPage([A4_WIDTH_MM, pageHeightMm], pageHeightMm > A4_WIDTH_MM ? 'portrait' : 'landscape');
        }
        isFirstPage = false;

        pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, A4_WIDTH_MM, pageHeightMm);
      }

      setProgressMsg('Finalizing and saving PDF...');
      const outName = (file?.name || 'document').replace(/\.docx$/i, '') + '.pdf';
      pdf.save(outName);
      setProgressMsg('Done! PDF downloaded.');
    } catch (err) {
      console.error('PDF conversion error:', err);
      alert('PDF generation failed: ' + (err.message || 'Please try again.'));
    } finally {
      if (containerRef.current) {
        containerRef.current.style.transform = origTransform;
      }
      setConverting(false);
      setProgressMsg('');
    }
  };

  /**
   * Native vector print export using invisible background iframe
   */
  const printDocument = () => {
    if (!containerRef.current) return;

    let iframe = document.getElementById('docx-print-frame');
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'docx-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const docStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    const printDoc = iframe.contentWindow.document;
    printDoc.open();
    printDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${(file?.name || 'Document').replace(/\.docx$/i, '')}</title>
          ${docStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-family: Aptos, Calibri, "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif !important;
              width: 100% !important;
            }
            .docx-wrapper {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              width: 100% !important;
              display: block !important;
            }
            .docx-wrapper > section.docx,
            section.docx,
            section {
              box-shadow: none !important;
              border: none !important;
              margin: 0 auto !important;
              margin-bottom: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: 0 !important; /* Cancels 297mm inline style that causes 2nd blank page */
              height: auto !important;
              max-height: none !important;
              background: white !important;
              box-sizing: border-box !important;
              overflow: visible !important;
              display: block !important; /* CRITICAL: Must be block (NOT flex) so Chrome paginates every page */
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: always !important;
              break-after: page !important;
            }
            .docx-wrapper > section.docx:last-child,
            section.docx:last-child,
            section:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            table {
              border-collapse: collapse !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${containerRef.current.innerHTML}
        </body>
      </html>
    `);
    printDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        console.error('Print error:', e);
      }
    }, 450);
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

        {/* DOCX Preview Scroll Viewport */}
        <div
          style={{
            display: rendered ? 'block' : 'none',
            maxHeight: '540px',
            overflow: 'auto',
            background: '#525659',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-main)',
            padding: '1.25rem 0.5rem',
            marginBottom: '1rem',
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
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <button
                className="btn btn-blue"
                style={{ padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center' }}
                onClick={convertToPdf}
              >
                <Download size={16} />
                Download as PDF
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center' }}
                onClick={printDocument}
                title="Opens browser print dialog with vector fonts"
              >
                <Printer size={16} />
                Print / Save as PDF (Vector)
              </button>
            </div>

            {/* Print configuration tip */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.65rem 0.85rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={14} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Recommendation:</strong> Use <strong>Download as PDF</strong> for 1-click direct high-res export (exact {pageCount} {pageCount === 1 ? 'page' : 'pages'}, no setup needed). If using <strong>Print</strong>, uncheck <em>Headers and footers</em> and check <em>Background graphics</em>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
