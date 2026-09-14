import React, { useState } from 'react';
import { Network, Search, Check, Copy } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function SubnetCalculator() {
  const [ip, setIp] = useState('192.168.1.100');
  const [cidr, setCidr] = useState(24);

  // CIDR Subnet Calculations
  const calculateSubnet = () => {
    try {
      const parts = ip.split('.').map(Number);
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
        return { error: 'Invalid IPv4 address format (e.g. 192.168.1.1)' };
      }

      const ipInt = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
      const maskInt = ~((1 << (32 - cidr)) - 1);
      const netInt = ipInt & maskInt;
      const bcastInt = netInt | ~maskInt;

      const intToIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

      const mask = intToIp(maskInt);
      const network = intToIp(netInt);
      const broadcast = intToIp(bcastInt);
      const firstHost = intToIp(netInt + 1);
      const lastHost = intToIp(bcastInt - 1);
      const totalHosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);

      return { mask, network, broadcast, firstHost, lastHost, totalHosts, cidr };
    } catch (e) {
      return { error: 'Subnet calculation error' };
    }
  };

  const res = calculateSubnet();

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Input Form */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="control-group" style={{ marginBottom: 0 }}>
            <label className="control-label">IPv4 Address</label>
            <input className="form-input" value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.1" />
          </div>

          <div className="control-group" style={{ marginBottom: 0 }}>
            <label className="control-label">CIDR Subnet Mask (/{cidr})</label>
            <select className="form-input" value={cidr} onChange={e => setCidr(+e.target.value)}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>/{n} — {Math.pow(2, 32 - n) - 2 > 0 ? Math.pow(2, 32 - n) - 2 : 0} Hosts</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result Grid */}
      {res.error ? (
        <div style={{ background: 'var(--red-soft)', border: '1px solid var(--red-border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--red)' }}>
          {res.error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Netmask</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.2rem', color: 'var(--accent)' }}>{res.mask}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Network ID</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{res.network}/{res.cidr}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Broadcast IP</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{res.broadcast}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Usable Host Range</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{res.firstHost} - {res.lastHost}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Total Usable Hosts</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green)', marginTop: '0.2rem' }}>{res.totalHosts.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
