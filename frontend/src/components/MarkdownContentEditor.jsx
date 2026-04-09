import React, { useRef, useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { ImageIcon, HelpCircle, X, Upload, Copy, Check } from 'lucide-react';

// ── Image positioning help modal ──────────────────────────────────────────────

const SNIPPETS = [
  {
    label: 'Basic image',
    code: '![Description of image](https://your-image-url.com/image.jpg)',
    note: 'Place this line wherever you want the image to appear in the text.',
  },
  {
    label: 'Image with spacing',
    code: '\n![Description](https://your-image-url.com/image.jpg)\n',
    note: 'Surround with blank lines to separate it visually from surrounding paragraphs.',
  },
  {
    label: 'Image followed by a caption',
    code: '![Chart showing Bitcoin price history](https://your-image-url.com/chart.jpg)\n*Figure 1 — Bitcoin price history 2009–2024*',
    note: 'Add italic text on the next line as a caption.',
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="ml-2 p-1 rounded hover:bg-slate-600 transition-colors text-slate-400 hover:text-white"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">How to position images</h3>
            <p className="text-sm text-slate-400 mt-0.5">Images are placed using Markdown syntax.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-4 mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <ol className="space-y-3 mb-6">
          {[
            'Click "Upload Image" to upload your file to Cloudflare.',
            'The image markdown is inserted at your cursor position automatically.',
            'Move it anywhere in the text by cutting (Ctrl+X) and pasting (Ctrl+V).',
            'Use the Preview tab to see exactly how it will look.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        {/* Snippets */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Common patterns</p>
        <div className="space-y-4">
          {SNIPPETS.map(({ label, code, note }) => (
            <div key={label} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300">{label}</span>
                <CopyButton text={code} />
              </div>
              <pre className="text-xs text-green-400 bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                {code}
              </pre>
              <p className="text-xs text-slate-500 mt-2">{note}</p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            <span className="font-semibold">Tip:</span> Use descriptive alt text (the part in square brackets) — it helps with accessibility and SEO.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main editor component ─────────────────────────────────────────────────────

export function MarkdownContentEditor({ value, onChange, token, lessonId }) {
  const fileInputRef = useRef(null);
  const editorApiRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Custom toolbar command — stores the editor API ref then triggers file picker
  const uploadImageCmd = {
    name: 'upload-image',
    keyCommand: 'upload-image',
    buttonProps: { 'aria-label': 'Upload image', title: 'Upload image' },
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    execute: (_state, api) => {
      editorApiRef.current = api;
      fileInputRef.current?.click();
    },
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be smaller than 10 MB'); return; }

    setUploading(true);
    try {
      // 1. Get Cloudflare direct upload URL + pre-computed public URL
      const { data } = await axios.get(`${API}/admin/image/upload-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Upload directly to Cloudflare
      const form = new FormData();
      form.append('file', file);
      const cfResp = await fetch(data.upload_url, { method: 'POST', body: form });
      if (!cfResp.ok) throw new Error('Cloudflare upload failed');

      // 3. Insert markdown at cursor (or append if no API ref)
      const altText = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      const markdown = `\n\n![${altText}](${data.public_url})\n\n`;

      if (editorApiRef.current) {
        editorApiRef.current.replaceSelection(markdown);
      } else {
        onChange((value || '') + markdown);
      }

      toast.success('Image uploaded and inserted');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div data-color-mode="dark">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-slate-400">Content — Markdown</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            How to position images
          </button>
          <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            uploading
              ? 'bg-gray-700 text-gray-500 pointer-events-none'
              : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
          }`}>
            {uploading
              ? <><Upload className="w-3 h-3 animate-pulse" /> Uploading…</>
              : <><ImageIcon className="w-3 h-3" /> Upload Image</>
            }
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFile}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Editor */}
      <MDEditor
        value={value}
        onChange={onChange}
        height={340}
        data-color-mode="dark"
        commands={[
          commands.bold, commands.italic, commands.strikethrough,
          commands.divider,
          commands.title1, commands.title2, commands.title3,
          commands.divider,
          commands.unorderedListCommand, commands.orderedListCommand,
          commands.divider,
          commands.link, commands.quote, commands.code, commands.codeBlock,
          commands.divider,
          uploadImageCmd,
        ]}
        extraCommands={[commands.codeEdit, commands.codeLive, commands.codePreview]}
        previewOptions={{
          // Keep images renderable in preview
        }}
      />

      {/* Hidden file input triggered by toolbar button */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFile}
        disabled={uploading}
      />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default MarkdownContentEditor;
