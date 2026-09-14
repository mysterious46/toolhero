import React, { useState } from 'react';
import { Lock, Unlock, Copy, Check, Shield, Code2 } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function CryptoStudio() {
  const [activeTab, setActiveTab] = useState('aes'); // 'aes', 'base64', 'hex'

  // AES State
  const [aesInput, setAesInput] = useState('');
  const [aesPass, setAesPass] = useState('');
  const [aesResult, setAesResult] = useState('');
  const [aesMode, setAesMode] = useState('encrypt');

  // Base64 & Hex State
  const [encoderInput, setEncoderInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Simple AES-GCM Encryption / Decryption via Web Crypto API
  const processAes = async () => {
    if (!aesInput || !aesPass) return;
    try {
      const enc = new TextEncoder();
      const dec = new TextDecoder();

      // Derive key from passphrase
      const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(aesPass), { name: 'PBKDF2' }, false, ['deriveKey']
      );
      const salt = enc.encode('iLoveToolsSalt2026');
      const key = await crypto.subtle.deriveKey(
        { name: 'AES-GCM', length: 256 },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      if (aesMode === 'encrypt') {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(aesInput));
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        const b64 = btoa(String.fromCharCode(...combined));
        setAesResult(b64);
      } else {
        const str = atob(aesInput);
        const combined = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) combined[i] = str.charCodeAt(i);
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        setAesResult(dec.decode(decrypted));
      }
    } catch (e) {
      setAesResult('Error: Decryption failed. Incorrect passphrase or invalid format.');
    }
  };

  // Base64 helpers
  const base64Encoded = encoderInput ? btoa(unescape(encodeURIComponent(encoderInput))) : '';
  let base64Decoded = '';
  if (encoderInput) {
    try {
      base64Decoded = decodeURIComponent(escape(atob(encoderInput)));
    } catch (e) {
      base64Decoded = 'Invalid Base64 string';
    }
  }

  // Hex helpers
  const hexEncoded = encoderInput ? Array.from(new TextEncoder().encode(encoderInput)).map(b => b.toString(16).padStart(2, '0')).join('') : '';

  const copyText = (t) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button className={`btn ${activeTab === 'aes' ? 'btn-purple' : 'btn-secondary'}`} onClick={() => setActiveTab('aes')}>
          <Lock size={15} /> AES Encryption & Decryption
        </button>
        <button className={`btn ${activeTab === 'base64' ? 'btn-purple' : 'btn-secondary'}`} onClick={() => setActiveTab('base64')}>
          Base64 Encoder / Decoder
        </button>
        <button className={`btn ${activeTab === 'hex' ? 'btn-purple' : 'btn-secondary'}`} onClick={() => setActiveTab('hex')}>
          Hexadecimal Converter
        </button>
      </div>

      {/* ──── AES Tab ──── */}
      {activeTab === 'aes' && (
        <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className={`btn btn-sm ${aesMode === 'encrypt' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAesMode('encrypt'); setAesResult(''); }}>
              <Lock size={13} /> Encrypt Text
            </button>
            <button className={`btn btn-sm ${aesMode === 'decrypt' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAesMode('decrypt'); setAesResult(''); }}>
              <Unlock size={13} /> Decrypt Text
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="control-group" style={{ marginBottom: 0 }}>
              <label className="control-label">{aesMode === 'encrypt' ? 'Text to Encrypt' : 'Encrypted Base64 String'}</label>
              <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={aesInput} onChange={e => setAesInput(e.target.value)} placeholder={aesMode === 'encrypt' ? 'Enter secret message...' : 'Paste Base64 encrypted string...'} />
            </div>

            <div className="control-group" style={{ marginBottom: 0 }}>
              <label className="control-label">Secret Passphrase / Key</label>
              <input className="form-input" type="password" value={aesPass} onChange={e => setAesPass(e.target.value)} placeholder="Enter secret key..." />
            </div>
          </div>

          <button className="btn btn-purple" style={{ width: '100%', marginBottom: '1rem' }} onClick={processAes} disabled={!aesInput || !aesPass}>
            {aesMode === 'encrypt' ? 'Encrypt Payload with AES-256' : 'Decrypt Payload with Key'}
          </button>

          {aesResult && (
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>Result Output</span>
                <button className="btn btn-secondary btn-sm" onClick={() => copyText(aesResult)}>
                  {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{aesResult}</div>
            </div>
          )}
        </div>
      )}

      {/* ──── Base64 Tab ──── */}
      {activeTab === 'base64' && (
        <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Input Text or Base64 String</label>
            <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={encoderInput} onChange={e => setEncoderInput(e.target.value)} placeholder="Enter text or Base64 string..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>Base64 Encoded</span>
                <button className="btn btn-secondary btn-sm" onClick={() => copyText(base64Encoded)} disabled={!base64Encoded}>
                  {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', wordBreak: 'break-all' }}>{base64Encoded || '—'}</div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>Base64 Decoded</span>
                <button className="btn btn-secondary btn-sm" onClick={() => copyText(base64Decoded)} disabled={!base64Decoded}>
                  {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', wordBreak: 'break-all' }}>{base64Decoded || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ──── Hex Tab ──── */}
      {activeTab === 'hex' && (
        <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Input Text</label>
            <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={encoderInput} onChange={e => setEncoderInput(e.target.value)} placeholder="Enter text to convert to hex..." />
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>Hexadecimal Output</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyText(hexEncoded)} disabled={!hexEncoded}>
                {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy Hex
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', wordBreak: 'break-all' }}>{hexEncoded || '—'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
