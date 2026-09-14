import React, { useState } from 'react';
import { Code, Check, Copy, ShieldAlert, CheckCircle2, Clock, Info } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function JwtDecoder() {
  const [jwt, setJwt] = useState('');
  const [copied, setCopied] = useState(null);

  // Decode JWT Header & Payload
  const decodeToken = (token) => {
    if (!token.trim()) return null;
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) return { error: 'Invalid JWT format. A valid JWT contains 3 dot-separated parts (Header.Payload.Signature).' };

      const b64Decode = (str) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
        return decodeURIComponent(escape(atob(padded)));
      };

      const header = JSON.parse(b64Decode(parts[0]));
      const payload = JSON.parse(b64Decode(parts[1]));
      const signature = parts[2];

      // Check Expiration
      let isExpired = false;
      let expDate = null;
      if (payload.exp) {
        expDate = new Date(payload.exp * 1000);
        isExpired = expDate < new Date();
      }

      return { header, payload, signature, isExpired, expDate };
    } catch (e) {
      return { error: 'Failed to decode JWT token. Ensure valid JSON payload encoding.' };
    }
  };

  const decoded = decodeToken(jwt);

  const copyJson = (obj, key) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Input JWT Token */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <label className="control-label">Encoded JWT Token</label>
          {jwt && <button className="btn btn-secondary btn-sm" onClick={() => setJwt('')}>Clear</button>}
        </div>
        <textarea
          className="form-input"
          style={{ width: '100%', minHeight: '90px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', resize: 'vertical' }}
          value={jwt}
          onChange={e => setJwt(e.target.value)}
          placeholder="Paste encoded JWT token..."
        />
      </div>

      {/* Output Area */}
      {!jwt ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
          <Info size={24} color="var(--text-tertiary)" style={{ marginBottom: '0.4rem' }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Paste a JWT token above to inspect</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Decodes header, payload claims, expiration timestamps, and signature structure.
          </div>
        </div>
      ) : decoded?.error ? (
        <div style={{ background: 'var(--red-soft)', border: '1px solid var(--red-border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontSize: '0.85rem', fontWeight: 600 }}>
          {decoded.error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Header */}
          <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--red)' }}>HEADER: ALGORITHM & TOKEN TYPE</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyJson(decoded.header, 'header')}>
                {copied === 'header' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy
              </button>
            </div>
            <pre className="code-box" style={{ margin: 0, minHeight: '120px' }}>
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload & Claims */}
          <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--purple)' }}>PAYLOAD: DATA CLAIMS</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyJson(decoded.payload, 'payload')}>
                {copied === 'payload' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy
              </button>
            </div>
            <pre className="code-box" style={{ margin: 0, minHeight: '120px' }}>
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>

            {decoded.expDate && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: decoded.isExpired ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                <Clock size={14} />
                <span>Expiration: {decoded.expDate.toLocaleString()} ({decoded.isExpired ? 'EXPIRED' : 'VALID'})</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
