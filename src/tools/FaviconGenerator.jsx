import React, { useState, useRef } from 'react';
import { Upload, Download, Copy, Check, Smartphone, Globe, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

const ICON_SIZES = [
  { name: 'favicon-16x16.png', size: 16, label: 'Standard Favicon' },
  { name: 'favicon-32x32.png', size: 32, label: 'Retina Favicon' },
  { name: 'favicon-48x48.png', size: 48, label: 'Browser Favicon' },
  { name: 'apple-touch-icon.png', size: 180, label: 'Apple Touch Icon' },
  { name: 'android-chrome-192x192.png', size: 192, label: 'Android PWA 192' },
  { name: 'android-chrome-512x512.png', size: 512, label: 'Android PWA 512' },
];

export default function FaviconGenerator() {
  const [imageSrc, setImageSrc] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const generateZip = async () => {
    if (!imageSrc) return;
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => { img.onload = resolve; });

      for (const iconDef of ICON_SIZES) {
        const canvas = document.createElement('canvas');
        canvas.width = iconDef.size;
        canvas.height = iconDef.size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, iconDef.size, iconDef.size);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(iconDef.name, base64Data, { base64: true });
      }

      const manifestContent = JSON.stringify({
        name: "My App",
        short_name: "App",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone"
      }, null, 2);
      zip.file('site.webmanifest', manifestContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'ilovetools-favicons.zip';
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const htmlSnippet = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;

  const copyCode = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Favicon & App Icon Generator</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Upload one image to generate all required favicon sizes for browsers, iOS, and Android.
        </p>
      </div>


      {!imageSrc ? (
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleImageUpload(e.target.files[0])}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="dropzone-icon"><Upload size={24} /></div>
          <div className="dropzone-title">Upload your logo or image</div>
          <div className="dropzone-subtitle">PNG, JPG, SVG, or WebP — processed entirely in your browser</div>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.4rem' }}>Choose File</button>
        </div>
      ) : (
        <div>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Preview & Export</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setImageSrc(null)}>
              <RefreshCw size={13} /> Change Image
            </button>
          </div>

          {/* Mockup Previews */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Browser Tab Mockup */}
            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                <Globe size={13} /> Browser Tab
              </div>
              <div style={{ background: '#fff', borderRadius: '6px 6px 0 0', padding: '0.45rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.45rem', width: '200px', border: '1px solid var(--border-main)' }}>
                <img src={imageSrc} alt="Favicon" style={{ width: '16px', height: '16px', borderRadius: '2px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  My Website
                </span>
              </div>
            </div>

            {/* Mobile App Icon Mockup */}
            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                <Smartphone size={13} /> App Icon
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-main)', background: '#fff' }}>
                  <img src={imageSrc} alt="App icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>iOS & Android</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>180×180 & 512×512</div>
                </div>
              </div>
            </div>
          </div>

          {/* Icon Sizes Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.6rem' }}>
              Sizes included in download
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
              {ICON_SIZES.map((icon, idx) => (
                <div key={idx} style={{ background: 'var(--bg-elevated)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)', textAlign: 'center' }}>
                  <img src={imageSrc} alt={icon.name} style={{ width: Math.min(icon.size, 36), height: Math.min(icon.size, 36), margin: '0 auto 0.35rem', display: 'block', objectFit: 'contain' }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>{icon.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{icon.size}×{icon.size}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Download */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
            onClick={generateZip}
            disabled={isGenerating}
          >
            <Download size={17} />
            <span>{isGenerating ? 'Packaging...' : 'Download Favicon Package (.zip)'}</span>
          </button>

          {/* HTML Snippet */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>HTML Code</span>
              <button className="btn btn-secondary btn-sm" onClick={copyCode}>
                {copied ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="code-box"><pre>{htmlSnippet}</pre></div>
          </div>
        </div>
      )}
    </div>
  );
}
