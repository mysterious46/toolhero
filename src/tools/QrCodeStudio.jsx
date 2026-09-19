import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Copy, Check, Upload, X, ChevronDown, ChevronUp, Image as ImageIcon, Palette, Sliders, Type, Frame, MessageSquare } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

/* ─── Social Presets ─── */
const PRESETS = [
  { name: 'Website', id: 'website', color: '#1a1a1a', prefix: 'https://', placeholder: 'example.com' },
  { name: 'WhatsApp', id: 'whatsapp', color: '#25D366', prefix: 'https://wa.me/', placeholder: '919876543210' },
  { name: 'Instagram', id: 'instagram', color: '#E4405F', prefix: 'https://instagram.com/', placeholder: 'username' },
  { name: 'YouTube', id: 'youtube', color: '#FF0000', prefix: 'https://youtube.com/@', placeholder: 'channel' },
  { name: 'Facebook', id: 'facebook', color: '#1877F2', prefix: 'https://facebook.com/', placeholder: 'page' },
  { name: 'Twitter / X', id: 'twitter', color: '#1DA1F2', prefix: 'https://x.com/', placeholder: 'handle' },
  { name: 'LinkedIn', id: 'linkedin', color: '#0A66C2', prefix: 'https://linkedin.com/in/', placeholder: 'profile' },
  { name: 'Pinterest', id: 'pinterest', color: '#E60023', prefix: 'https://pinterest.com/', placeholder: 'user' },
  { name: 'Telegram', id: 'telegram', color: '#26A5E4', prefix: 'https://t.me/', placeholder: 'username' },
  { name: 'Email', id: 'email', color: '#EA4335', prefix: 'mailto:', placeholder: 'you@email.com' },
  { name: 'Phone', id: 'phone', color: '#34A853', prefix: 'tel:', placeholder: '+919876543210' },
  { name: 'Wi-Fi', id: 'wifi', color: '#FF9800', prefix: 'WIFI:', placeholder: 'S:MyNetwork;T:WPA;P:password;;' },
  { name: 'Bitcoin', id: 'bitcoin', color: '#F7931A', prefix: 'bitcoin:', placeholder: '1111111111111111111111111111111111' },
];

/* ─── Decorative Frames Definitions ─── */
const DECORATIVE_FRAMES = [
  { id: 'none', name: 'No Frame', defaultCta: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" strokeDasharray="3 3"/></svg> },
  { id: 'scan-me-top', name: 'SCAN ME Top Badge', defaultCta: 'SCAN ME', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="13" rx="2"/><rect x="6" y="3" width="12" height="5" rx="1" fill="currentColor"/></svg> },
  { id: 'scan-me-bottom', name: 'SCAN ME Bottom Pill', defaultCta: 'SCAN ME', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="13" rx="2"/><rect x="5" y="18" width="14" height="4" rx="2" fill="currentColor"/></svg> },
  { id: 'shopping-bag', name: 'Shopping Bag', defaultCta: 'SHOP NOW', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8h12v13H6z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/></svg> },
  { id: 'gift-box', name: 'Gift Box Bow', defaultCta: 'UNWRAP GIFT', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 13h18"/><path d="M8 8c-1.5 0-3-1-3-2.5S6.5 3 8 5c1 1.5 4 3 4 3s3-1.5 4-3c1.5-2 3-2 3-.5S17.5 8 16 8" fill="currentColor"/></svg> },
  { id: 'polaroid', name: 'Polaroid Photo Card', defaultCta: 'SCAN TO OPEN', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="2" width="18" height="20" rx="2" fill="currentColor" fillOpacity="0.1"/><rect x="6" y="5" width="12" height="10"/></svg> },
  { id: 'smartphone', name: 'Smartphone Frame', defaultCta: 'TAP OR SCAN', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="4" r="1" fill="currentColor"/><rect x="8" y="7" width="8" height="10"/></svg> },
  { id: 'heart-badge', name: 'Heart Badge', defaultCta: 'WITH LOVE', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M12 21l-3-2.5C6 16 4 14.5 4 12c0-2 1.5-3.5 3.5-3.5 1.2 0 2.4.6 3 1.5.6-.9 1.8-1.5 3-1.5 2 0 3.5 1.5 3.5 3.5 0 2.5-2 4-5 6.5L12 21z" fill="currentColor"/></svg> },
  { id: 'ticket', name: 'Event Ticket Stub', defaultCta: 'EVENT PASS', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0-6h20a3 3 0 0 1 0 6v6a3 3 0 0 1 0 6H2a3 3 0 0 1 0-6V9z"/></svg> },
  { id: 'coffee', name: 'Cafe Menu', defaultCta: 'VIEW MENU', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8h1a3 3 0 0 1 0 6h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/></svg> },
  { id: 'envelope', name: 'Mail Envelope', defaultCta: 'READ LETTER', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg> },
  { id: 'floral', name: 'Floral Wreath', defaultCta: 'WELCOME', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="5" width="14" height="14"/><circle cx="4" cy="4" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg> },
  { id: 'gold-luxury', name: 'Golden Border', defaultCta: 'EXCLUSIVE', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20"/><rect x="6" y="6" width="12" height="12"/></svg> },
  { id: 'music-badge', name: 'Music Player', defaultCta: 'PLAY NOW', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M9 18V9l6-2v9" fill="currentColor"/></svg> },
  { id: 'modern-box', name: 'Minimal Box', defaultCta: 'SCAN QR CODE', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="12" height="12"/></svg> },
];

/* ─── Body Shapes (Supported Engine Types) ─── */
const BODY_SHAPES = [
  { id: 'square', name: 'Square Matrix', engine: 'square', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8"/><rect x="14" y="2" width="8" height="8"/><rect x="2" y="14" width="8" height="8"/><rect x="14" y="14" width="8" height="8"/></svg> },
  { id: 'dots', name: 'Dots Grid', engine: 'dots', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="6" r="4"/><circle cx="18" cy="6" r="4"/><circle cx="6" cy="18" r="4"/><circle cx="18" cy="18" r="4"/></svg> },
  { id: 'rounded', name: 'Rounded Squares', engine: 'rounded', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="2.5"/><rect x="14" y="2" width="8" height="8" rx="2.5"/><rect x="2" y="14" width="8" height="8" rx="2.5"/><rect x="14" y="14" width="8" height="8" rx="2.5"/></svg> },
  { id: 'extra-rounded', name: 'Organic Pills', engine: 'extra-rounded', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="4"/><rect x="14" y="2" width="8" height="8" rx="4"/><rect x="2" y="14" width="8" height="8" rx="4"/><rect x="14" y="14" width="8" height="8" rx="4"/></svg> },
  { id: 'classy', name: 'Classy Diamond Cut', engine: 'classy', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="4" ry="0"/><rect x="14" y="2" width="8" height="8" rx="0" ry="4"/><rect x="2" y="14" width="8" height="8" rx="0" ry="4"/><rect x="14" y="14" width="8" height="8" rx="4" ry="0"/></svg> },
  { id: 'classy-rounded', name: 'Curved Leaves', engine: 'classy-rounded', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="4" ry="2"/><rect x="14" y="2" width="8" height="8" rx="2" ry="4"/><rect x="2" y="14" width="8" height="8" rx="2" ry="4"/><rect x="14" y="14" width="8" height="8" rx="4" ry="2"/></svg> },
];

/* ─── Eye Frame Shapes ─── */
const FRAME_SHAPES = [
  { id: 'square', name: 'Square Frame', engine: 'square', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="18" height="18"/></svg> },
  { id: 'extra-rounded', name: 'Rounded Frame', engine: 'extra-rounded', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="18" height="18" rx="6"/></svg> },
  { id: 'dot', name: 'Circle Ring', engine: 'dot', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="9"/></svg> },
];

/* ─── Eye Ball Shapes ─── */
const BALL_SHAPES = [
  { id: 'square', name: 'Square Ball', engine: 'square', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg> },
  { id: 'dot', name: 'Circle Ball', engine: 'dot', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg> },
];

/* ─── Shape Picker Card ─── */
function ShapePickerCard({ selected, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '8px',
        border: selected ? '2px solid var(--accent)' : '1px solid var(--border-main)',
        background: selected ? 'var(--accent-soft)' : 'var(--bg-card)',
        color: selected ? 'var(--accent)' : 'var(--text-primary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'var(--transition)',
        padding: '6px'
      }}
    >
      {children}
    </button>
  );
}

export default function QrCodeStudio() {
  // Accordion open states
  const [openSections, setOpenSections] = useState({
    content: true,
    colors: false,
    logo: true,
    design: true,
    frame: true,
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // State
  const [activePreset, setActivePreset] = useState('website');
  const [text, setText] = useState('https://example.com');

  // Colors
  const [fgColor, setFgColor] = useState('#1a1a1a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor2, setGradientColor2] = useState('#4285F4');
  const [gradientType, setGradientType] = useState('linear');

  // Custom Eye Colors
  const [customEyeColors, setCustomEyeColors] = useState(false);
  const [cornerSquareColor, setCornerSquareColor] = useState('#1a1a1a');
  const [cornerDotColor, setCornerDotColor] = useState('#1a1a1a');

  // Shapes
  const [selectedBodyShapeId, setSelectedBodyShapeId] = useState('square');
  const [selectedFrameShapeId, setSelectedFrameShapeId] = useState('square');
  const [selectedBallShapeId, setSelectedBallShapeId] = useState('square');

  // Decorative Frame State
  const [decorativeFrameId, setDecorativeFrameId] = useState('none');
  const [ctaText, setCtaText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#1a1a1a');

  // Logo
  const [rawLogoSrc, setRawLogoSrc] = useState('');
  const [processedLogoSrc, setProcessedLogoSrc] = useState('');
  const [removeLogoBg, setRemoveLogoBg] = useState(true);
  const [logoSize, setLogoSize] = useState(0.32);
  const [logoMargin, setLogoMargin] = useState(8);

  // Size & Export
  const [qrSize, setQrSize] = useState(2000);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);

  // Update default CTA text when frame preset changes
  const selectDecorativeFrame = (frame) => {
    setDecorativeFrameId(frame.id);
    if (frame.defaultCta) {
      setCtaText(frame.defaultCta);
    }
  };

  // Smart Corner Sampling Background Removal & White Rounded Card Badge
  useEffect(() => {
    if (!rawLogoSrc) {
      setProcessedLogoSrc('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawLogoSrc;
    img.onload = () => {
      const pad = 24;
      const canvas = document.createElement('canvas');
      canvas.width = img.width + pad * 2;
      canvas.height = img.height + pad * 2;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      const radius = Math.min(canvas.width, canvas.height) * 0.15;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
      } else {
        ctx.rect(0, 0, canvas.width, canvas.height);
      }
      ctx.fill();

      if (removeLogoBg) {
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = img.width;
        sampleCanvas.height = img.height;
        const sampleCtx = sampleCanvas.getContext('2d');
        sampleCtx.drawImage(img, 0, 0);

        try {
          const imgData = sampleCtx.getImageData(0, 0, img.width, img.height);
          const data = imgData.data;
          const cornerR = data[0];
          const cornerG = data[1];
          const cornerB = data[2];

          const tolerance = 48;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const dist = Math.sqrt((r - cornerR) ** 2 + (g - cornerG) ** 2 + (b - cornerB) ** 2);
            if (dist < tolerance) {
              data[i + 3] = 0;
            }
          }

          sampleCtx.putImageData(imgData, 0, 0);
          ctx.drawImage(sampleCanvas, pad, pad);
        } catch {
          ctx.drawImage(img, pad, pad);
        }
      } else {
        ctx.drawImage(img, pad, pad);
      }

      setProcessedLogoSrc(canvas.toDataURL('image/png'));
    };
  }, [rawLogoSrc, removeLogoBg]);

  // Preset Selection
  const selectPreset = (preset) => {
    setActivePreset(preset.id);
    setText(preset.prefix + preset.placeholder);
    setFgColor(preset.color);
    setFrameColor(preset.color);
    if (customEyeColors) {
      setCornerSquareColor(preset.color);
      setCornerDotColor(preset.color);
    }
  };

  // Build Options for High-DPI Sharpness
  const buildOptions = useCallback((overrideSize) => {
    const activeBody = BODY_SHAPES.find(s => s.id === selectedBodyShapeId) || BODY_SHAPES[0];
    const activeFrame = FRAME_SHAPES.find(s => s.id === selectedFrameShapeId) || FRAME_SHAPES[0];
    const activeBall = BALL_SHAPES.find(s => s.id === selectedBallShapeId) || BALL_SHAPES[0];
    const targetSize = overrideSize || Math.max(1200, qrSize);

    const opts = {
      width: targetSize,
      height: targetSize,
      data: text || 'https://example.com',
      margin: 12,
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: {
        type: activeBody.engine,
        ...(useGradient ? {
          gradient: {
            type: gradientType,
            colorStops: [
              { offset: 0, color: fgColor },
              { offset: 1, color: gradientColor2 },
            ]
          }
        } : { color: fgColor }),
      },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: {
        type: activeFrame.engine,
        color: customEyeColors ? cornerSquareColor : fgColor
      },
      cornersDotOptions: {
        type: activeBall.engine,
        color: customEyeColors ? cornerDotColor : fgColor
      },
      image: processedLogoSrc || undefined,
    };

    if (processedLogoSrc) {
      opts.imageOptions = {
        crossOrigin: 'anonymous',
        margin: logoMargin,
        imageSize: logoSize,
        hideBackgroundDots: true,
      };
    } else {
      opts.imageOptions = {
        crossOrigin: 'anonymous',
        margin: 0,
        imageSize: 0,
      };
    }

    return opts;
  }, [text, fgColor, bgColor, useGradient, gradientColor2, gradientType, selectedBodyShapeId, selectedFrameShapeId, selectedBallShapeId, customEyeColors, cornerSquareColor, cornerDotColor, processedLogoSrc, logoSize, logoMargin, qrSize]);

  // Init & Update Canvas cleanly using qrRef
  useEffect(() => {
    const opts = buildOptions(1000);
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(opts);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrRef.current.append(containerRef.current);
      }
    } else {
      qrRef.current.update(opts);
    }
  }, [buildOptions]);

  // Render Decorative Outer Frame Composite onto Output Canvas
  const renderCompositeCanvas = useCallback(async (outputSize = 1200) => {
    // Re-render QR code canvas at exact output size for crisp HD vector sharpness
    const opts = buildOptions(outputSize);
    const tempQr = new QRCodeStyling(opts);
    const blob = await tempQr.getRawData('png');
    const qrImg = new Image();
    qrImg.src = URL.createObjectURL(blob);
    await new Promise(r => { qrImg.onload = r; });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (decorativeFrameId === 'none') {
      canvas.width = outputSize;
      canvas.height = outputSize;
      ctx.drawImage(qrImg, 0, 0, outputSize, outputSize);
      return canvas;
    }

    const framePad = Math.round(outputSize * 0.16);
    const headerH = (decorativeFrameId === 'scan-me-top' || decorativeFrameId === 'gift-box' || decorativeFrameId === 'smartphone' || decorativeFrameId === 'shopping-bag') ? Math.round(outputSize * 0.18) : 0;
    const footerH = (decorativeFrameId !== 'scan-me-top' && decorativeFrameId !== 'gift-box') ? Math.round(outputSize * 0.22) : 0;

    canvas.width = outputSize + framePad * 2;
    canvas.height = outputSize + framePad * 2 + headerH + footerH;

    // Fill Canvas Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cW = canvas.width;
    const cH = canvas.height;

    ctx.strokeStyle = frameColor;
    ctx.fillStyle = frameColor;
    ctx.lineWidth = Math.max(6, Math.round(outputSize * 0.015));

    // ──── DRAW DECORATIVE OUTER FRAME ILLUSTRATIONS ────
    if (decorativeFrameId === 'shopping-bag') {
      // Draw Shopping Bag Outline & Handles
      const handleW = Math.round(cW * 0.35);
      const handleH = Math.round(headerH * 0.85);
      
      ctx.beginPath();
      ctx.arc(cW / 2, handleH + 10, handleW / 2, Math.PI, 0, false);
      ctx.stroke();

      // Bag Body Outer Border
      ctx.beginPath();
      ctx.roundRect(framePad / 2, headerH, cW - framePad, cH - headerH - 10, 16);
      ctx.stroke();
    } else if (decorativeFrameId === 'gift-box') {
      // Draw Ribbon Loops on Top
      ctx.beginPath();
      ctx.ellipse(cW / 2 - 30, headerH / 2, 25, 12, -Math.PI / 6, 0, 2 * Math.PI);
      ctx.ellipse(cW / 2 + 30, headerH / 2, 25, 12, Math.PI / 6, 0, 2 * Math.PI);
      ctx.fill();

      // Gift Box Outer Border
      ctx.beginPath();
      ctx.roundRect(framePad / 2, headerH, cW - framePad, cH - headerH - framePad / 2, 16);
      ctx.stroke();
    } else if (decorativeFrameId === 'smartphone') {
      // Phone Body Frame
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(12, 12, cW - 24, cH - 24, 36);
      else ctx.rect(12, 12, cW - 24, cH - 24);
      ctx.fill();

      // Camera Notch
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect((cW - 80) / 2, 22, 80, 14, 7);
      else ctx.rect((cW - 80) / 2, 22, 80, 14);
      ctx.fill();

      // Inner Screen Card
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(24, headerH + 16, cW - 48, outputSize + framePad, 20);
      else ctx.rect(24, headerH + 16, cW - 48, outputSize + framePad);
      ctx.fill();
    } else if (decorativeFrameId === 'polaroid') {
      // Polaroid White Card
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 18;
      ctx.fillRect(16, 16, cW - 32, cH - 32);
      ctx.strokeRect(16, 16, cW - 32, cH - 32);
      ctx.shadowColor = 'transparent';
    } else if (decorativeFrameId === 'ticket') {
      // Event Ticket Notch Cuts (Semi-circles on Left & Right)
      ctx.strokeRect(16, 16, cW - 32, cH - 32);
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(16, cH / 2, 20, 0, Math.PI * 2);
      ctx.arc(cW - 16, cH / 2, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (decorativeFrameId === 'gold-luxury' || decorativeFrameId === 'modern-box') {
      // Double Frame
      ctx.strokeRect(12, 12, cW - 24, cH - 24);
      ctx.strokeRect(20, 20, cW - 40, cH - 40);
    } else {
      // Default Rounded Frame
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(16, 16, cW - 32, cH - 32, 20);
      else ctx.rect(16, 16, cW - 32, cH - 32);
      ctx.stroke();
    }

    // Draw QR Code Centered Inside Frame
    const qrX = framePad;
    const qrY = framePad + headerH;
    ctx.drawImage(qrImg, qrX, qrY, outputSize, outputSize);

    // Draw CTA Text Banner & Badge
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (decorativeFrameId === 'scan-me-top' || decorativeFrameId === 'gift-box' || decorativeFrameId === 'smartphone') {
      // Top CTA Banner
      const badgeW = Math.round(cW * 0.65);
      const badgeH = Math.round(headerH * 0.65);
      const badgeX = (cW - badgeW) / 2;
      const badgeY = 24;

      ctx.fillStyle = frameColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
      else ctx.rect(badgeX, badgeY, badgeW, badgeH);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.round(badgeH * 0.45)}px 'DM Sans', sans-serif`;
      ctx.fillText(ctaText.toUpperCase(), cW / 2, badgeY + badgeH / 2);
    } else if (ctaText) {
      // Bottom CTA Banner
      const badgeW = Math.round(cW * 0.72);
      const badgeH = Math.round(outputSize * 0.12);
      const badgeX = (cW - badgeW) / 2;
      const badgeY = cH - badgeH - 28;

      ctx.fillStyle = frameColor;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9999);
      else ctx.rect(badgeX, badgeY, badgeW, badgeH);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${Math.round(badgeH * 0.42)}px 'DM Sans', sans-serif`;
      ctx.fillText(ctaText.toUpperCase(), cW / 2, badgeY + badgeH / 2);
    }

    return canvas;
  }, [buildOptions, decorativeFrameId, ctaText, frameColor, bgColor]);

  // Update Live Composite Canvas Preview
  useEffect(() => {
    let active = true;
    renderCompositeCanvas(280).then(compCanvas => {
      if (active && previewCanvasRef.current) {
        previewCanvasRef.current.innerHTML = '';
        compCanvas.style.maxWidth = '100%';
        compCanvas.style.height = 'auto';
        compCanvas.style.display = 'block';
        compCanvas.style.margin = '0 auto';
        previewCanvasRef.current.appendChild(compCanvas);
      }
    });
    return () => { active = false; };
  }, [renderCompositeCanvas]);

  // High Quality Image Processing for Uploaded Logos
  const handleLogoUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const highResUrl = canvas.toDataURL('image/png', 1.0);
        setRawLogoSrc(highResUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  // Downloads
  const downloadPng = async () => {
    const compCanvas = await renderCompositeCanvas(qrSize);
    const a = document.createElement('a');
    a.download = `qrcode-${decorativeFrameId}.png`;
    a.href = compCanvas.toDataURL('image/png');
    a.click();
  };

  const downloadSvg = async () => {
    const fullQr = new QRCodeStyling({ ...buildOptions(), width: qrSize, height: qrSize });
    fullQr.download({ name: 'qrcode', extension: 'svg' });
  };

  const copyToClipboard = async () => {
    try {
      const compCanvas = await renderCompositeCanvas(qrSize);
      compCanvas.toBlob(async (blob) => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      {/* Hidden container for QRCodeStyling instance */}
      <div ref={containerRef} style={{ display: 'none' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Desktop 2-Column Split: Controls (Left) vs Sticky Preview (Right) */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* ──── LEFT COLUMN: Accordion Config Panels (60% width) ──── */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            {/* 1. ENTER CONTENT */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
              <div
                onClick={() => toggleSection('content')}
                style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-card)', borderBottom: openSections.content ? '1px solid var(--border-main)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Type size={16} color="var(--accent)" />
                  <span>1. ENTER CONTENT</span>
                </div>
                {openSections.content ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {openSections.content && (
                <div style={{ padding: '1.15rem' }}>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '65px', resize: 'vertical', marginBottom: '0.85rem' }}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter URL or text content..."
                  />

                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                    Quick Presets
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {PRESETS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectPreset(p)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                          border: activePreset === p.id ? `2px solid ${p.color}` : '1px solid var(--border-main)',
                          background: activePreset === p.id ? `${p.color}15` : 'var(--bg-card)',
                          color: activePreset === p.id ? p.color : 'var(--text-secondary)',
                          fontFamily: 'var(--font-body)', transition: 'var(--transition)',
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. SET COLORS */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
              <div
                onClick={() => toggleSection('colors')}
                style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-card)', borderBottom: openSections.colors ? '1px solid var(--border-main)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Palette size={16} color="var(--accent)" />
                  <span>2. SET COLORS</span>
                </div>
                {openSections.colors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {openSections.colors && (
                <div style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                    <div className="control-group" style={{ marginBottom: 0 }}>
                      <label className="control-label">Foreground Dots</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-main)', cursor: 'pointer', background: 'none', padding: 0 }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{fgColor}</span>
                      </div>
                    </div>
                    <div className="control-group" style={{ marginBottom: 0 }}>
                      <label className="control-label">Background</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-main)', cursor: 'pointer', background: 'none', padding: 0 }} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{bgColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gradient Switch */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.85rem' }}>
                    <input type="checkbox" checked={useGradient} onChange={() => setUseGradient(!useGradient)} /> Dots Color Gradient
                  </label>

                  {useGradient && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <label className="control-label">Gradient Color 2</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input type="color" value={gradientColor2} onChange={e => setGradientColor2(e.target.value)} style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-main)', cursor: 'pointer', background: 'none', padding: 0 }} />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{gradientColor2}</span>
                        </div>
                      </div>
                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <label className="control-label">Type</label>
                        <select className="form-input" value={gradientType} onChange={e => setGradientType(e.target.value)}>
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Separate Eye Frame & Ball Colors Switch */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={customEyeColors} onChange={() => setCustomEyeColors(!customEyeColors)} /> Custom Eye Corner Colors
                  </label>

                  {customEyeColors && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.65rem' }}>
                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <label className="control-label">Eye Frame Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input type="color" value={cornerSquareColor} onChange={e => setCornerSquareColor(e.target.value)} style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-main)', cursor: 'pointer', background: 'none', padding: 0 }} />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{cornerSquareColor}</span>
                        </div>
                      </div>
                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <label className="control-label">Eye Ball Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input type="color" value={cornerDotColor} onChange={e => setCornerDotColor(e.target.value)} style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-main)', cursor: 'pointer', background: 'none', padding: 0 }} />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{cornerDotColor}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. ADD LOGO IMAGE */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
              <div
                onClick={() => toggleSection('logo')}
                style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-card)', borderBottom: openSections.logo ? '1px solid var(--border-main)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ImageIcon size={16} color="var(--accent)" />
                  <span>3. ADD LOGO IMAGE</span>
                </div>
                {openSections.logo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {openSections.logo && (
                <div style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', border: '2px dashed var(--border-hover)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {processedLogoSrc ? (
                        <img src={processedLogoSrc} alt="Center logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>NO LOGO</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={13} /> Upload Image
                      </button>
                      {rawLogoSrc && (
                        <button className="btn btn-secondary btn-sm" onClick={() => { setRawLogoSrc(''); setProcessedLogoSrc(''); }}>
                          <X size={13} /> Remove Logo
                        </button>
                      )}
                      <input type="file" ref={fileInputRef} onChange={e => handleLogoUpload(e.target.files[0])} accept="image/*" hidden />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={removeLogoBg}
                      onChange={(e) => setRemoveLogoBg(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <span>Remove Background Behind Logo</span>
                  </label>

                  {rawLogoSrc && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <div className="control-label"><span>Logo Size</span><span>{Math.round(logoSize * 100)}%</span></div>
                        <input type="range" className="custom-slider" min="0.15" max="0.45" step="0.01" value={logoSize} onChange={e => setLogoSize(+e.target.value)} />
                      </div>
                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <div className="control-label"><span>Padding</span><span>{logoMargin}px</span></div>
                        <input type="range" className="custom-slider" min="0" max="16" value={logoMargin} onChange={e => setLogoMargin(+e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. DECORATIVE FRAMES & CTA BANNER (Visual SVG Card Pickers) */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
              <div
                onClick={() => toggleSection('frame')}
                style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-card)', borderBottom: openSections.frame ? '1px solid var(--border-main)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Frame size={16} color="var(--accent)" />
                  <span>4. DECORATIVE FRAMES & CTA</span>
                </div>
                {openSections.frame ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {openSections.frame && (
                <div style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="control-label" style={{ marginBottom: 0 }}>Frame Style Presets</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700 }}>15 Visual Styles</span>
                  </div>

                  {/* Visual SVG Frame Card Grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
                    {DECORATIVE_FRAMES.map(f => (
                      <ShapePickerCard
                        key={f.id}
                        selected={decorativeFrameId === f.id}
                        onClick={() => selectDecorativeFrame(f)}
                        title={f.name}
                      >
                        {f.icon}
                      </ShapePickerCard>
                    ))}
                  </div>

                  {decorativeFrameId !== 'none' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <label className="control-label">Call-to-Action Text</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MessageSquare size={14} color="var(--text-tertiary)" />
                          <input
                            type="text"
                            className="form-input"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            placeholder="SCAN ME"
                          />
                        </div>
                      </div>

                      <div className="control-group" style={{ marginBottom: 0 }}>
                        <label className="control-label">Frame & Badge Color</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <input
                            type="color"
                            value={frameColor}
                            onChange={(e) => setFrameColor(e.target.value)}
                            style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-main)', cursor: 'pointer', background: 'none', padding: 0 }}
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{frameColor}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. CUSTOMIZE SHAPES (Body, Frame, Ball Shapes) */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
              <div
                onClick={() => toggleSection('design')}
                style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-card)', borderBottom: openSections.design ? '1px solid var(--border-main)' : 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sliders size={16} color="var(--accent)" />
                  <span>5. CUSTOMIZE SHAPES</span>
                </div>
                {openSections.design ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {openSections.design && (
                <div style={{ padding: '1.15rem' }}>

                  {/* Body Shape Picker Grid */}
                  <div className="control-group">
                    <label className="control-label" style={{ marginBottom: '0.5rem' }}>Body Shape</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {BODY_SHAPES.map(s => (
                        <ShapePickerCard
                          key={s.id}
                          selected={selectedBodyShapeId === s.id}
                          onClick={() => setSelectedBodyShapeId(s.id)}
                          title={s.name}
                        >
                          {s.icon}
                        </ShapePickerCard>
                      ))}
                    </div>
                  </div>

                  {/* Eye Frame Shape Picker Grid */}
                  <div className="control-group">
                    <label className="control-label" style={{ marginBottom: '0.5rem' }}>Eye Frame Shape</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {FRAME_SHAPES.map(s => (
                        <ShapePickerCard
                          key={s.id}
                          selected={selectedFrameShapeId === s.id}
                          onClick={() => setSelectedFrameShapeId(s.id)}
                          title={s.name}
                        >
                          {s.icon}
                        </ShapePickerCard>
                      ))}
                    </div>
                  </div>

                  {/* Eye Ball Shape Picker Grid */}
                  <div className="control-group" style={{ marginBottom: 0 }}>
                    <label className="control-label" style={{ marginBottom: '0.5rem' }}>Eye Ball Shape</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {BALL_SHAPES.map(s => (
                        <ShapePickerCard
                          key={s.id}
                          selected={selectedBallShapeId === s.id}
                          onClick={() => setSelectedBallShapeId(s.id)}
                          title={s.name}
                        >
                          {s.icon}
                        </ShapePickerCard>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* ──── RIGHT COLUMN: Sticky Live Preview Sidebar (40% width / min 320px) ──── */}
          <div style={{ flex: '1 1 320px', position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
              
              {/* Composite Live Preview Canvas Container */}
              <div
                ref={previewCanvasRef}
                style={{
                  background: bgColor, padding: '0.85rem', borderRadius: '12px',
                  boxShadow: 'var(--shadow-sm)', marginBottom: '1.25rem',
                  border: '1px solid var(--border-main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: '290px'
                }}
              />

              {/* Quality & Resolution Slider */}
              <div style={{ width: '100%', marginBottom: '1.25rem' }}>
                <div className="control-label" style={{ fontSize: '0.78rem' }}>
                  <span>Low Quality</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{qrSize} × {qrSize} Px</span>
                  <span>High Quality</span>
                </div>
                <input type="range" className="custom-slider" min="200" max="2000" step="100" value={qrSize} onChange={e => setQrSize(+e.target.value)} />
              </div>

              {/* Main Download Actions */}
              <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginBottom: '0.6rem' }} onClick={downloadPng}>
                <Download size={16} /> Download PNG
              </button>

              <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={downloadSvg}>.SVG</button>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={downloadPng}>.PNG</button>
                <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>
                  {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Sidebar Ad Unit */}

          </div>

        </div>

      </div>
    </div>
  );
}
