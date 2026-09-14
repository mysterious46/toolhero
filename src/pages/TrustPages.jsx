import React, { useState } from 'react';
import { ShieldCheck, Mail, CheckCircle2, Lock, ArrowLeft, Send, Zap, Cpu, FileText, Image, AlignLeft, Shield, Music, Sparkles, HelpCircle, MessageSquare } from 'lucide-react';

export function AboutPage({ navigate }) {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem 0' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={13} /> Back to Home
      </button>

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '999px', backgroundColor: 'rgba(196, 93, 62, 0.08)', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Sparkles size={14} /> Mission & Platform Architecture
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: 1.2 }}>
          About ToolHero – The Privacy-First Web Utilities Platform
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          ToolHero was built to solve a fundamental security flaw in traditional online file tools: <strong style={{ color: 'var(--text-primary)' }}>privacy risks caused by uploading sensitive user documents to remote cloud servers.</strong>
        </p>
      </div>

      {/* Core Principles Grid */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Our 4 Core Platform Principles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-main)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>100% Client-Side Privacy</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              All PDF manipulations, image resizes, audio trims, and cryptographic calculations occur directly inside your browser using HTML5, WebAudio, and WebAssembly APIs. Your confidential files never touch our servers.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-main)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Zero Upload Delays</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Traditional cloud converters require waiting for large 50MB files to upload across slow networks. ToolHero processes files at local CPU speed in milliseconds without network transfer lag.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-main)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>High-Performance Web APIs</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              We leverage modern browser technologies including PDF.js, PDF-Lib, Canvas2D, and Web Crypto APIs to deliver desktop-grade file conversion right inside Chrome, Safari, Firefox, and Edge.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-main)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(196, 93, 62, 0.1)', color: '#c45d3e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Unlimited & Free Forever</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              ToolHero is completely free for personal, academic, and commercial use. We do not require credit cards, account registration, or subscriptions to access any of our 36+ tools.
            </p>
          </div>
        </div>
      </section>

      {/* Tool Ecosystem Breakdown */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Our Comprehensive Utility Suites</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} /> PDF Tools Suite
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Comprehensive PDF tools including PDF Compression with customizable quality levels, PDF Merger, PDF Splitter, PDF to JPG Image Converter, JPG to PDF Creator, Page Rotation, Watermarking, and Text Extractor.
            </p>
          </div>

          <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={18} /> Image Processing Studio
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Official Passport Photo 4x6 Sheet Generator, Background Remover, Image Compressor, Resizer, Format Converter (WEBP, PNG, JPG), Favicon Generator, Image Watermark, Meme Maker, and Color Palette Extractor.
            </p>
          </div>

          <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlignLeft size={18} /> Text & Developer Tools
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Real-time Word & Character Counter, Password Generator with entropy gauge, Text Diff Checker, Case Converter, JSON Formatter with TypeScript Interface generator, and QR Code Generator with logo branding.
            </p>
          </div>

          <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} /> Security & Cryptography Suite
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              AES-256 Encryption & Decryption Studio, Hash Identifier, JWT Token Decoder, Password Strength Analyzer, RSA 2048-bit Key Generator, and IP Subnet CIDR Calculator.
            </p>
          </div>
        </div>
      </section>

      {/* Commitment to Transparency */}
      <section style={{ padding: '1.75rem', borderRadius: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-main)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Our Commitment to User Trust</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1rem' }}>
          ToolHero is maintained by an independent team of software engineers dedicated to digital privacy. We operate transparently and welcome user suggestions, bug reports, and feature requests.
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/contact')}>
          <Mail size={14} /> Contact ToolHero Support
        </button>
      </section>
    </div>
  );
}

export function ContactPage({ navigate }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Query', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Also trigger mailto link so the message is sent directly to support email!
    const mailtoUrl = `mailto:contact.toolhero@gmail.com?subject=${encodeURIComponent(`[ToolHero Contact] ${formData.subject}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 0' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={13} /> Back to Home
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Contact ToolHero Support</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Have a question, technical issue, or feature suggestion? Get in touch with our team. All inquiries are answered directly by our platform engineers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Contact Details Card */}
        <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-main)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} color="var(--accent)" /> Direct Support Email
            </h3>
            <a href="mailto:contact.toolhero@gmail.com" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', wordBreak: 'break-all' }}>
              contact.toolhero@gmail.com
            </a>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
              Guaranteed response within 24 to 48 business hours.
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Inquiry Categories:</h4>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingLeft: '1.2rem' }}>
              <li>🐛 Technical Bug Reports</li>
              <li>✨ New Tool & Feature Requests</li>
              <li>🤝 Business Partnerships & Advertising</li>
              <li>🔒 Privacy & Security Questions</li>
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Infrastructure & Security</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Hosted globally via Google Cloud Infrastructure & Firebase Anycast CDN.
            </p>
          </div>
        </div>

        {/* Interactive Form */}
        <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
          {submitted ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <CheckCircle2 size={42} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.4rem' }}>Opening Email Client...</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Your message has been pre-filled. If your email app didn't open automatically, send directly to <strong>contact.toolhero@gmail.com</strong>.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => setSubmitted(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)', fontSize: '0.88rem' }}
                >
                  <option value="General Support">General Support</option>
                  <option value="Bug Report">Report a Bug / Issue</option>
                  <option value="Feature Request">Suggest a New Tool</option>
                  <option value="Advertising">Advertising & Business Inquiry</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Message Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe how we can assist you..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                <Send size={15} /> Send Support Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage({ navigate }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 0' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={13} /> Back to Home
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Privacy Policy</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>Last updated: September 1, 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Local File Processing</h3>
          <p>
            ToolHero operates on a strict zero-server file policy. When you convert, compress, or edit PDF documents, images, audio clips, or text files, all computation is executed locally inside your web browser's memory. Your files are never uploaded to, transmitted across, or stored on any remote server.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Data Collection</h3>
          <p>
            We do not collect personal information, user accounts, or tracking data. ToolHero does not require sign-ups, passwords, or registration.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Third-Party Advertising & Cookies</h3>
          <p>
            ToolHero displays non-intrusive advertisements served by Google AdSense to support server hosting costs. Google AdSense uses standard browser cookies to serve relevant advertisements. You can manage or disable ad personalization cookies through your browser security settings or Google's ad preferences.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>4. Contact Information</h3>
          <p>
            If you have questions regarding this Privacy Policy, please contact us at contact.toolhero@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsPage({ navigate }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 0' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={13} /> Back to Home
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Terms of Service</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>Last updated: September 1, 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h3>
          <p>
            By accessing or using ToolHero (https://toolhero.xyz), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our web tools.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>2. Permitted Use</h3>
          <p>
            ToolHero grants you a free, non-exclusive, non-transferable license to use our web utilities for personal, educational, and commercial purposes.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3. Disclaimer of Warranties</h3>
          <p>
            All tools and services on ToolHero are provided "as is" without warranty of any kind. While we strive for 100% accuracy, ToolHero is not responsible for any file conversion errors or data loss resulting from local browser execution.
          </p>
        </section>
      </div>
    </div>
  );
}
