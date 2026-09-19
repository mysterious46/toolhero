import React, { useState } from 'react';
import { Key, Copy, Check, RefreshCw, Lock } from 'lucide-react';

export default function RsaGenerator() {
  const [modulusLength, setModulusLength] = useState(2048);
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [busy, setBusy] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Helper to convert ArrayBuffer to PEM string
  const arrayBufferToPem = (buffer, label) => {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const formattedB64 = b64.match(/.{1,64}/g)?.join('\n') || b64;
    return `-----BEGIN ${label}-----\n${formattedB64}\n-----END ${label}-----`;
  };

  const generateKeys = async () => {
    setBusy(true);
    setPublicKeyPem('');
    setPrivateKeyPem('');

    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );

      const pubBuf = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privBuf = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      setPublicKeyPem(arrayBufferToPem(pubBuf, 'PUBLIC KEY'));
      setPrivateKeyPem(arrayBufferToPem(privBuf, 'PRIVATE KEY'));
    } catch (e) {
      console.error(e);
      alert('Key generation failed');
    } finally {
      setBusy(false);
    }
  };

  const copyPem = (pem, type) => {
    navigator.clipboard.writeText(pem);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div>

      {/* Options Header */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="control-group" style={{ marginBottom: 0, minWidth: '180px' }}>
          <label className="control-label">Key Size</label>
          <select className="form-input" value={modulusLength} onChange={e => setModulusLength(+e.target.value)}>
            <option value={2048}>RSA 2048-bit (Standard)</option>
            <option value={4096}>RSA 4096-bit (High Security)</option>
          </select>
        </div>

        <button className="btn btn-purple" onClick={generateKeys} disabled={busy} style={{ height: '38px', marginTop: '1rem' }}>
          <Key size={15} /> {busy ? 'Generating RSA Key Pair...' : 'Generate New RSA Key Pair'}
        </button>
      </div>

      {/* Output PEM Boxes */}
      {(publicKeyPem || privateKeyPem) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Public Key */}
          <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green)' }}>PUBLIC KEY (PEM)</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyPem(publicKeyPem, 'pub')}>
                {copiedKey === 'pub' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy Public Key
              </button>
            </div>
            <pre className="code-box" style={{ margin: 0, minHeight: '180px' }}>
              {publicKeyPem}
            </pre>
          </div>

          {/* Private Key */}
          <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--red)' }}>PRIVATE KEY (PEM)</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyPem(privateKeyPem, 'priv')}>
                {copiedKey === 'priv' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy Private Key
              </button>
            </div>
            <pre className="code-box" style={{ margin: 0, minHeight: '180px' }}>
              {privateKeyPem}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
