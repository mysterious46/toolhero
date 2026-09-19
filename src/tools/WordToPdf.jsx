import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, RefreshCw, Eye, ZoomIn, ZoomOut, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import JSZip from 'jszip';

function findSafeCutY(ctx, width, targetY, searchRange = 60) {
  const minY = Math.max(0, targetY - searchRange);
  const maxY = Math.min(ctx.canvas.height - 1, targetY + searchRange);

  try {
    const imgData = ctx.getImageData(0, minY, width, maxY - minY);
    const data = imgData.data;

    let bestY = targetY;
    let minDarkPixels = Infinity;

    for (let y = minY; y <= maxY; y++) {
      const rowOffset = (y - minY) * width * 4;
      let darkPixels = 0;
      for (let x = 0; x < width; x += 8) {
        const idx = rowOffset + x * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (r < 240 || g < 240 || b < 240) {
          darkPixels++;
        }
      }
      if (darkPixels === 0) {
        return y;
      }
      if (darkPixels < minDarkPixels) {
        minDarkPixels = darkPixels;
        bestY = y;
      }
    }
    return bestY;
  } catch {
    return targetY;
  }
}

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [arrayBuf, setArrayBuf] = useState(null);
  const [docMode, setDocMode] = useState('text'); // 'images' | 'text'
  const [imagePages, setImagePages] = useState([]);
  const [rendered, setRendered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const fileRef = useRef(null);
  const containerRef = useRef(null);

  const handleReset = () => {
    imagePages.forEach((p) => {
      try {
        URL.revokeObjectURL(p.url);
      } catch {}
    });
    setFile(null);
    setArrayBuf(null);
    setImagePages([]);
    setDocMode('text');
    setRendered(false);
    setPageCount(0);
    if (containerRef.current) containerRef.current.innerHTML = '';
  };

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
    setDocMode('text');
    setImagePages([]);

    try {
      const buf = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size });

      // Analyze DOCX structure using JSZip
      const zip = await JSZip.loadAsync(buf);
      const relsXml = (await zip.file('word/_rels/document.xml.rels')?.async('text')) || '';
      const docXml = (await zip.file('word/document.xml')?.async('text')) || '';

      const textMatches = docXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
      const fullText = textMatches.map((t) => t.replace(/<[^>]+>/g, '')).join(' ').trim();

      const relMap = {};
      for (const m of relsXml.matchAll(/Id=\"([^\"]+)\"[^>]*Target=\"([^\"]+)\"/g)) {
        relMap[m[1]] = m[2];
      }

      const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

      let orderedImages = [];
      for (const m of docXml.matchAll(/r:embed=\"([^\"]+)\"/g)) {
        const id = m[1];
        let target = relMap[id];
        if (target) {
          if (!target.startsWith('word/')) {
            target = 'word/' + target.replace(/^\.\.\//, '');
          }
          if (zip.file(target) && !orderedImages.includes(target)) {
            orderedImages.push(target);
          }
        }
      }

      if (orderedImages.length === 0) {
        orderedImages = Object.keys(zip.files)
          .filter((name) => /^word\/media\/image\d+\.(png|jpg|jpeg|webp)$/i.test(name))
          .sort(naturalSort);
      }

      // Check if document is image-backed (e.g. scanned, converted from PDF, slide deck)
      const isImageDoc =
        orderedImages.length > 0 &&
        (fullText.length < 200 || orderedImages.length >= Math.max(1, fullText.length / 80));

      if (isImageDoc) {
        setDocMode('images');
        const pages = [];
        for (let i = 0; i < orderedImages.length; i++) {
          const imgPath = orderedImages[i];
          const imgFile = zip.file(imgPath);
          const extName = imgPath.split('.').pop().toLowerCase();
          const mime = extName === 'png' ? 'image/png' : extName === 'webp' ? 'image/webp' : 'image/jpeg';
          const blob = await imgFile.async('blob');
          const url = URL.createObjectURL(blob);
          pages.push({
            id: i,
            url,
            path: imgPath,
            format: extName === 'png' ? 'PNG' : 'JPEG',
            mime,
          });
        }
        setImagePages(pages);
        setPageCount(pages.length);
        setRendered(true);
        setBusy(false);
      } else {
        setDocMode('text');
        // Ensure section breaks are recognized by docx-preview
        let processedBuf = buf;
        if (docXml.includes('<w:sectPr')) {
          const enhancedXml = docXml.replace(
            /(<w:pPr><w:sectPr[\s\S]*?<\/w:sectPr><\/w:pPr>)/g,
            '$1<w:r><w:br w:type="page"/></w:r>'
          );
          zip.file('word/document.xml', enhancedXml);
          processedBuf = await zip.generateAsync({ type: 'arraybuffer' });
        }
        setArrayBuf(processedBuf);
      }
    } catch (err) {
      console.error('Error loading DOCX:', err);
      alert('Failed to load document: ' + (err.message || ''));
      setBusy(false);
    }
  };

  // Render text-based DOCX with docx-preview
  useEffect(() => {
    if (!arrayBuf || docMode !== 'text' || !containerRef.current) return;

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
          const sections = containerRef.current.querySelectorAll('section.docx, section');
          let totalCount = 0;
          if (sections.length > 0) {
            sections.forEach((sec) => {
              const secW = sec.offsetWidth || 794;
              const secH = sec.offsetHeight || 1123;
              const nominalPageH = secW * 1.4142;
              const pagesInSec = Math.max(1, Math.round(secH / nominalPageH));
              totalCount += pagesInSec;
            });
          } else {
            const h = containerRef.current.offsetHeight || 0;
            const w = containerRef.current.offsetWidth || 794;
            totalCount = Math.max(1, Math.ceil((h - 20) / (w * 1.414)));
          }

          setPageCount(totalCount);
          setRendered(true);
        }
      } catch (err) {
        console.error('DOCX render error:', err);
        if (!cancelled) alert('Failed to render the document: ' + (err.message || ''));
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [arrayBuf, docMode]);

  /**
   * Direct high-resolution PDF generation and download
   * 1-to-1 page matching, zero blank pages, no print dialogs.
   */
  const convertToPdf = async () => {
    if (!rendered) return;
    setConverting(true);
    setProgressMsg('Initializing document capture...');

    try {
      const { jsPDF } = await import('jspdf');

      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      if (docMode === 'images' && imagePages.length > 0) {
        // Direct high-fidelity image-backed document assembly
        for (let i = 0; i < imagePages.length; i++) {
          setProgressMsg(`Processing Page ${i + 1} of ${imagePages.length} (Original Fidelity)...`);
          const page = imagePages[i];

          const img = new Image();
          img.src = page.url;
          await new Promise((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          });

          const naturalW = img.naturalWidth || 1488;
          const naturalH = img.naturalHeight || 2105;
          const isLandscape = naturalW > naturalH;

          if (i > 0) {
            pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
          }

          if (isLandscape) {
            const pageHeight = (naturalH / naturalW) * A4_HEIGHT_MM;
            pdf.addImage(page.url, page.format, 0, Math.max(0, (210 - pageHeight) / 2), A4_HEIGHT_MM, Math.min(210, pageHeight), undefined, 'FAST');
          } else {
            const pageHeight = (naturalH / naturalW) * A4_WIDTH_MM;
            const finalH = Math.abs(pageHeight - A4_HEIGHT_MM) < 8 ? A4_HEIGHT_MM : pageHeight;
            pdf.addImage(page.url, page.format, 0, 0, A4_WIDTH_MM, finalH, undefined, 'FAST');
          }
        }
      } else {
        // Formatted Text / Tables / Vector DOCX
        if (!containerRef.current) return;
        const origTransform = containerRef.current.style.transform;
        containerRef.current.style.transform = 'none';

        try {
          const { default: html2canvas } = await import('html2canvas-pro');
          let sections = Array.from(containerRef.current.querySelectorAll('section.docx, section'));
          if (!sections.length) {
            sections = Array.from(containerRef.current.querySelectorAll('.docx-wrapper > *'));
          }
          if (!sections.length && containerRef.current.children.length) {
            sections = Array.from(containerRef.current.children);
          }

          if (!sections.length) {
            alert('No rendered pages found to convert. Please reload your document.');
            return;
          }

          let isFirstPage = true;
          const A4_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM;

          for (let sIdx = 0; sIdx < sections.length; sIdx++) {
            const section = sections[sIdx];
            setProgressMsg(`Capturing Section ${sIdx + 1} of ${sections.length}...`);

            const canvas = await html2canvas(section, {
              scale: 2.0,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              scrollX: 0,
              scrollY: 0,
            });

            const nominalPageH = Math.round(canvas.width * A4_RATIO);

            if (canvas.height <= nominalPageH * 1.12) {
              // Single page section
              if (!isFirstPage) pdf.addPage('a4', 'portrait');
              isFirstPage = false;
              const pageHMm = (canvas.height / canvas.width) * A4_WIDTH_MM;
              pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_WIDTH_MM, pageHMm);
            } else {
              // Multi-page section: slice vertically into pages
              const numPages = Math.ceil(canvas.height / nominalPageH);
              let currentY = 0;
              const ctx = canvas.getContext('2d');

              for (let p = 0; p < numPages; p++) {
                setProgressMsg(`Processing Section ${sIdx + 1}, Page ${p + 1} of ${numPages}...`);
                const targetY = Math.min(canvas.height, currentY + nominalPageH);
                let cutY = targetY;

                if (targetY < canvas.height) {
                  cutY = findSafeCutY(ctx, canvas.width, targetY, Math.round(nominalPageH * 0.08));
                }

                const sliceH = cutY - currentY;
                if (sliceH <= 0) break;

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sliceH;
                const pageCtx = pageCanvas.getContext('2d');
                pageCtx.fillStyle = '#ffffff';
                pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                pageCtx.drawImage(canvas, 0, currentY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

                if (!isFirstPage) pdf.addPage('a4', 'portrait');
                isFirstPage = false;

                const sliceHMm = (sliceH / canvas.width) * A4_WIDTH_MM;
                pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_WIDTH_MM, sliceHMm);

                currentY = cutY;
                if (currentY >= canvas.height - 10) break;
              }
            }
          }
        } finally {
          if (containerRef.current) {
            containerRef.current.style.transform = origTransform;
          }
        }
      }

      setProgressMsg('Assembling and saving your PDF...');
      const outName = (file?.name || 'document').replace(/\.docx$/i, '') + '.pdf';
      pdf.save(outName);
      setProgressMsg('Complete! Downloading PDF...');
    } catch (err) {
      console.error('PDF conversion error:', err);
      alert('PDF generation failed: ' + (err.message || 'Please try again.'));
    } finally {
      setConverting(false);
      setProgressMsg('');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (!file)
    return (
      <div>
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            type="file"
            ref={fileRef}
            onChange={(e) => loadFile(e.target.files[0])}
            accept=".docx"
            hidden
          />
          <div className="dropzone-icon">
            <FileText size={24} />
          </div>
          <div className="dropzone-title">Upload Word Document (.docx)</div>
          <div className="dropzone-subtitle">
            Faithfully converts multi-page documents, formatted text, and graphics into crisp, professional PDF
          </div>
          <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>
            Select DOCX File
          </button>
        </div>
      </div>
    );

  return (
    <div>
      <div className="tool-box">
        {/* File info bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid var(--border-main)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{formatSize(file.size)}</span>
              {rendered && (
                <>
                  <span>·</span>
                  <span
                    style={{
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={13} /> {pageCount} {pageCount === 1 ? 'page' : 'pages'} ready to convert
                  </span>
                </>
              )}
              {busy && <span>· Rendering document preview...</span>}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            <RefreshCw size={13} /> Change File
          </button>
        </div>

        {/* Zoom & View Controls */}
        {rendered && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={14} color="var(--text-tertiary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Document Preview ({pageCount} {pageCount === 1 ? 'Page' : 'Pages'})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setZoom((z) => Math.max(25, z - 15))}
                style={{ padding: '3px 8px' }}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  minWidth: '38px',
                  textAlign: 'center',
                }}
              >
                {zoom}%
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setZoom((z) => Math.min(200, z + 15))}
                style={{ padding: '3px 8px' }}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {busy && (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Rendering document...
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              Preserving original layout, fonts, and formatting
            </div>
          </div>
        )}

        {/* DOCX Preview Scroll Viewport */}
        <div
          style={{
            display: rendered ? 'block' : 'none',
            maxHeight: '560px',
            overflow: 'auto',
            background: '#525659',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-main)',
            padding: '1.25rem 0.5rem',
            marginBottom: '1.25rem',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          {docMode === 'images' ? (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                width: '100%',
              }}
            >
              {imagePages.map((page, idx) => (
                <div
                  key={page.id}
                  style={{
                    position: 'relative',
                    background: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    borderRadius: '2px',
                    width: '100%',
                    maxWidth: '794px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '12px',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      zIndex: 2,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    Page {idx + 1} of {imagePages.length}
                  </div>
                  <img
                    src={page.url}
                    alt={`Page ${idx + 1}`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>

        {/* Conversion Progress Bar */}
        {converting && (
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div className="spinner" style={{ margin: '0 auto 0.6rem' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {progressMsg}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              Generating 100% pixel-perfect, clean PDF without blank pages
            </div>
          </div>
        )}

        {/* Main Action Button */}
        {rendered && !converting && (
          <div>
            <button
              className="btn btn-blue"
              style={{
                width: '100%',
                padding: '0.95rem',
                fontSize: '1rem',
                fontWeight: 700,
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              }}
              onClick={convertToPdf}
            >
              <Download size={18} />
              Convert & Download PDF ({pageCount} {pageCount === 1 ? 'Page' : 'Pages'})
            </button>

            {/* Feature highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.85rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <Zap size={14} color="#10b981" />
                <span>1-Click direct PDF download</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <ShieldCheck size={14} color="#3b82f6" />
                <span>100% private, processed in browser</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
