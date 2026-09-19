import React, { useState, useMemo } from 'react';
import { Search, Hash, ShieldCheck, Copy, Check, Info, TrendingUp } from 'lucide-react';

/* ─── Hash Pattern Definitions ───
   Each pattern has:
   - popularity: base weight (higher = more common in real-world usage)
   - specificity: how unique the regex is (higher = fewer false positives)
   - category: grouping for display
*/
const HASH_PATTERNS = [
  { name: 'MD5',     len: 32,  regex: /^[a-fA-F0-9]{32}$/,                          desc: '128-bit hash value. Widely used for checksums, file integrity, and legacy password storage.', popularity: 95, specificity: 50, category: 'Common' },
  { name: 'SHA-1',   len: 40,  regex: /^[a-fA-F0-9]{40}$/,                          desc: '160-bit hash value. Used in Git commits. Deprecated for cryptographic signatures.', popularity: 85, specificity: 90, category: 'Common' },
  { name: 'SHA-256', len: 64,  regex: /^[a-fA-F0-9]{64}$/,                          desc: '256-bit hash value. Industry standard for Bitcoin, SSL certificates, and digital signatures.', popularity: 90, specificity: 95, category: 'Common' },
  { name: 'SHA-512', len: 128, regex: /^[a-fA-F0-9]{128}$/,                         desc: '512-bit hash value. High security cryptographic hash for sensitive applications.', popularity: 60, specificity: 98, category: 'Common' },
  { name: 'SHA-384', len: 96,  regex: /^[a-fA-F0-9]{96}$/,                          desc: '384-bit hash value. Part of SHA-2 family, used in TLS and certificate chains.', popularity: 35, specificity: 97, category: 'Common' },
  { name: 'SHA-224', len: 56,  regex: /^[a-fA-F0-9]{56}$/,                          desc: '224-bit hash value. Truncated version of SHA-256, used in some IoT and constrained environments.', popularity: 15, specificity: 90, category: 'Common' },
  { name: 'NTLM',    len: 32,  regex: /^[a-fA-F0-9]{32}$/,                          desc: '32 hex characters. Used in Windows authentication and Active Directory protocols.', popularity: 30, specificity: 50, category: 'Auth' },
  { name: 'MySQL5',  len: 40,  regex: /^\*[A-F0-9]{40}$/,                            desc: 'MySQL 5.x password hash. Prefixed with * followed by 40 hex uppercase chars.', popularity: 25, specificity: 95, category: 'Database' },
  { name: 'CRC32',   len: 8,   regex: /^[a-fA-F0-9]{8}$/,                           desc: '32-bit cyclic redundancy check value for data integrity verification.', popularity: 40, specificity: 70, category: 'Checksum' },
  { name: 'CRC32B',  len: 8,   regex: /^[a-fA-F0-9]{8}$/,                           desc: 'CRC-32B variant. Used in ZIP files, PNG, and Ethernet frame checks.', popularity: 20, specificity: 70, category: 'Checksum' },
  { name: 'Adler-32',len: 8,   regex: /^[a-fA-F0-9]{8}$/,                           desc: '32-bit checksum used in zlib compression. Faster but less reliable than CRC32.', popularity: 10, specificity: 70, category: 'Checksum' },
  { name: 'Bcrypt',  len: null, regex: /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/,   desc: 'Blowfish-based password hashing with salt and configurable cost factor.', popularity: 80, specificity: 100, category: 'Password' },
  { name: 'Scrypt',  len: null, regex: /^\$s0\$[a-fA-F0-9]+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/, desc: 'Memory-hard key derivation function. Used for password hashing in cryptocurrency.', popularity: 30, specificity: 100, category: 'Password' },
  { name: 'SHA3-256',len: 64,  regex: /^[a-fA-F0-9]{64}$/,                          desc: '256-bit Keccak-based hash. Next generation standard after SHA-2.', popularity: 20, specificity: 50, category: 'Advanced' },
  { name: 'SHA3-512',len: 128, regex: /^[a-fA-F0-9]{128}$/,                         desc: '512-bit Keccak-based hash. Maximum security from the SHA-3 family.', popularity: 10, specificity: 50, category: 'Advanced' },
  { name: 'RIPEMD-160', len: 40, regex: /^[a-fA-F0-9]{40}$/,                        desc: '160-bit hash used in Bitcoin address generation and PGP.', popularity: 15, specificity: 50, category: 'Advanced' },
  { name: 'MD4',     len: 32,  regex: /^[a-fA-F0-9]{32}$/,                          desc: '128-bit hash. Predecessor to MD5, considered insecure. Used in legacy NTLM.', popularity: 5,  specificity: 50, category: 'Legacy' },
  { name: 'Whirlpool', len: 128, regex: /^[a-fA-F0-9]{128}$/,                       desc: '512-bit hash based on AES. Used in some disk encryption tools.', popularity: 5, specificity: 50, category: 'Advanced' },
];

/**
 * Calculate confidence score (0-100) for each matching pattern.
 * Factors: specificity of regex, popularity/prevalence, uniqueness at that length.
 */
function scoreMatches(hash) {
  const matched = HASH_PATTERNS.filter(p => p.regex.test(hash));
  if (!matched.length) return [];

  // Count how many algorithms share the same length
  const lengthCounts = {};
  matched.forEach(p => {
    const key = p.len || 'special';
    lengthCounts[key] = (lengthCounts[key] || 0) + 1;
  });

  return matched.map(p => {
    const key = p.len || 'special';
    const competitors = lengthCounts[key];

    // Base score from specificity (how unique is the regex pattern?)
    // Unique regex like Bcrypt ($2a$...) gets full specificity score
    let score = p.specificity;

    // Popularity boost: more commonly encountered algorithms get a boost
    // Normalized to add up to 30 points max
    score += (p.popularity / 100) * 30;

    // Uniqueness penalty: if multiple algorithms share the same length/regex,
    // penalize proportionally. Sole match at a length gets no penalty.
    if (competitors > 1) {
      // Distribute penalty: less popular ones get penalized more
      const popularityRank = matched
        .filter(m => (m.len || 'special') === key)
        .sort((a, b) => b.popularity - a.popularity)
        .findIndex(m => m.name === p.name);
      score -= (popularityRank * 15); // each lower rank loses 15 points
    }

    // Bonus for format-specific patterns (Bcrypt, Scrypt, MySQL5 with prefix)
    if (p.specificity === 100) score += 10;

    // Clamp between 5 and 100
    const confidence = Math.max(5, Math.min(100, Math.round(score)));

    return { ...p, confidence };
  }).sort((a, b) => b.confidence - a.confidence);
}

/** Confidence badge color based on percentage */
function getConfidenceColor(confidence) {
  if (confidence >= 80) return { bg: 'rgba(34, 197, 94, 0.12)', text: '#22c55e', bar: '#22c55e' };
  if (confidence >= 50) return { bg: 'rgba(251, 191, 36, 0.12)', text: '#f59e0b', bar: '#f59e0b' };
  return { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', bar: '#ef4444' };
}

function getConfidenceLabel(confidence) {
  if (confidence >= 85) return 'Most Likely';
  if (confidence >= 65) return 'Likely';
  if (confidence >= 40) return 'Possible';
  return 'Unlikely';
}

export default function HashIdentifier() {
  const [inputHash, setInputHash] = useState('');
  const [copied, setCopied] = useState(false);

  const cleanHash = inputHash.trim();
  const scoredMatches = useMemo(() => scoreMatches(cleanHash), [cleanHash]);

  const copyInput = () => {
    navigator.clipboard.writeText(cleanHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>

      {/* Input Box */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enter Hash String to Identify</label>
          {cleanHash && (
            <button className="btn btn-secondary btn-sm" onClick={copyInput}>
              {copied ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        <input
          className="form-input"
          style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', padding: '0.75rem' }}
          value={inputHash}
          onChange={e => setInputHash(e.target.value)}
          placeholder="Paste MD5, SHA-256, SHA-512, Bcrypt, NTLM hash..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.65rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
          <span>Length: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{cleanHash.length} characters</strong></span>
          <span>Format: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{cleanHash ? (/^[a-fA-F0-9]+$/.test(cleanHash) ? 'Hexadecimal' : /^\$/.test(cleanHash) ? 'Modular Crypt Format' : 'Base64 / Other') : '—'}</strong></span>
        </div>
      </div>

      {/* Identification Results */}
      <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Search size={16} color="var(--accent)" /> Identified Hash Algorithms ({scoredMatches.length})
        </h4>

        {cleanHash ? (
          scoredMatches.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {scoredMatches.map((p, idx) => {
                const colors = getConfidenceColor(p.confidence);
                const label = getConfidenceLabel(p.confidence);
                return (
                  <div key={p.name} style={{
                    background: 'var(--bg-elevated)',
                    border: idx === 0 ? `1.5px solid ${colors.text}` : '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Top row: name + confidence badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: idx === 0 ? colors.text : 'var(--accent)' }}>{p.name}</span>
                        {idx === 0 && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px',
                            borderRadius: 'var(--radius-full)',
                            background: colors.bg, color: colors.text,
                            textTransform: 'uppercase', letterSpacing: '0.5px',
                          }}>
                            Best Match
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600, padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-card)', color: 'var(--text-tertiary)',
                          border: '1px solid var(--border-main)',
                        }}>
                          {p.category}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: colors.bg, color: colors.text,
                        }}>
                          {label} · {p.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div style={{
                      height: '4px', borderRadius: '2px',
                      background: 'var(--border-main)',
                      marginBottom: '0.45rem', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${p.confidence}%`,
                        background: colors.bar,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>

                    {/* Description + metadata */}
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>{p.desc}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      {p.len && <span>Length: {p.len} chars</span>}
                      <span>Bits: {p.len ? p.len * 4 : '—'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
              <Info size={24} color="var(--text-tertiary)" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>No exact standard algorithm matched</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                Check if the string is salted, truncated, or encoded in non-hex format.
              </div>
            </div>
          )
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <Info size={24} color="var(--text-tertiary)" style={{ marginBottom: '0.4rem' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Enter a hash string above to identify</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              Paste any MD5, SHA-1, SHA-256, SHA-512, Bcrypt, or NTLM hash string.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
