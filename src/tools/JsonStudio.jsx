import React, { useState, useEffect } from 'react';
import { Code, Copy, Check, AlertCircle } from 'lucide-react';

export default function JsonStudio() {
  const [jsonInput, setJsonInput] = useState(`{\n  "name": "iLoveTools",\n  "version": 1.0,\n  "features": ["Favicon", "Compressor", "PDF", "QR", "JSON"],\n  "isPrivacyFirst": true\n}`);
  const [indent] = useState(2);
  const [targetType, setTargetType] = useState('ts');
  const [outputCode, setOutputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, indent));
      setErrorMsg(null);
      generateCode(parsed, targetType);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const generateCode = (obj, type) => {
    if (typeof obj !== 'object' || obj === null) return;
    if (type === 'ts') {
      let result = 'export interface RootObject {\n';
      for (const [key, val] of Object.entries(obj)) {
        let valType = typeof val;
        if (Array.isArray(val)) valType = val.length > 0 ? `${typeof val[0]}[]` : 'any[]';
        else if (val === null) valType = 'any';
        result += `  ${key}: ${valType};\n`;
      }
      result += '}';
      setOutputCode(result);
    } else if (type === 'pydantic') {
      let result = 'from pydantic import BaseModel\nfrom typing import List, Any\n\nclass RootModel(BaseModel):\n';
      for (const [key, val] of Object.entries(obj)) {
        let pyType = 'Any';
        if (typeof val === 'string') pyType = 'str';
        else if (typeof val === 'number') pyType = Number.isInteger(val) ? 'int' : 'float';
        else if (typeof val === 'boolean') pyType = 'bool';
        else if (Array.isArray(val)) {
          const itemType = val.length > 0 ? (typeof val[0] === 'string' ? 'str' : 'Any') : 'Any';
          pyType = `List[${itemType}]`;
        }
        result += `    ${key}: ${pyType}\n`;
      }
      setOutputCode(result);
    }
  };

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      setErrorMsg(null);
      generateCode(parsed, targetType);
    } catch (e) {
      setErrorMsg(e.message);
    }
  }, [jsonInput, targetType]);

  const copyOutput = () => {
    navigator.clipboard.writeText(outputCode || jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>JSON Formatter & Type Generator</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Format JSON and generate TypeScript interfaces or Python Pydantic models.
        </p>
      </div>


      {/* Toolbar */}
      <div style={{
        background: 'var(--bg-elevated)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-main)',
        marginBottom: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary btn-sm" onClick={formatJson}>
            <Code size={13} /> Format
          </button>
          <select className="search-input" style={{ width: 'auto', padding: '0.2rem 0.55rem', fontSize: '0.78rem' }} value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            <option value="ts">TypeScript</option>
            <option value="pydantic">Python Pydantic</option>
          </select>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={copyOutput}>
          {copied ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(196,93,62,0.08)', border: '1px solid var(--accent-border)', color: 'var(--accent)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.35rem' }}>Input JSON</label>
          <textarea
            className="code-box"
            style={{ width: '100%', minHeight: '320px', color: '#d4d4d4', resize: 'vertical' }}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.35rem' }}>
            {targetType === 'ts' ? 'TypeScript Interface' : 'Python Pydantic Model'}
          </label>
          <pre className="code-box" style={{ minHeight: '320px', color: '#9cdcfe' }}>
            {outputCode || '// Types will appear here'}
          </pre>
        </div>
      </div>
    </div>
  );
}
