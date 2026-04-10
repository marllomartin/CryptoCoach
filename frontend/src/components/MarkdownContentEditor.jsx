import React, { useRef, useState, useEffect, useCallback } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import {
  ImageIcon, HelpCircle, X, Upload, Copy, Check,
  Trash2, ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';

// ── Help modal ────────────────────────────────────────────────────────────────

const SNIPPETS = [
  {
    label: 'Basic image',
    code: '![Description of image](https://your-image-url.com/image.jpg)',
    note: 'Place this line wherever you want the image to appear.',
  },
  {
    label: 'Image with spacing',
    code: '\n![Description](https://your-image-url.com/image.jpg)\n',
    note: 'Surround with blank lines to separate it from surrounding paragraphs.',
  },
  {
    label: 'Image with caption',
    code: '![Bitcoin price chart](https://your-image-url.com/chart.jpg)\n*Figure 1 — Bitcoin price history 2009–2024*',
    note: 'Add italic text on the next line as a caption.',
  },
];

function CopyButton({ text, size = 'sm' }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="p-1 rounded hover:bg-slate-600 transition-colors text-slate-400 hover:text-white"
      title="Copy"
    >
      {copied
        ? <Check className={size === 'sm' ? 'w-3.5 h-3.5 text-green-400' : 'w-4 h-4 text-green-400'} />
        : <Copy className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
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
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ol className="space-y-3 mb-6">
          {[
            'Click "Upload Image" to upload your file.',
            'Copy the image\'s markdown from the Image Library and paste it wherever you want it in the editor.',
            'To reposition it, cut the image line (Ctrl+X) and paste it (Ctrl+V) at the desired location.',
            'Use the Preview tab to see exactly how it will look in the lesson.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Image Library</p>
        <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 mb-6 space-y-2 text-sm text-slate-300">
          <p>All images uploaded to this lesson are saved in the <span className="text-primary font-medium">Image Library</span>, found below the editor.</p>
          <p>From there you can:</p>
          <ul className="space-y-1 ml-2">
            {[
              'Hover an image thumbnail and click the copy icon to get its markdown snippet.',
              'Click the trash icon to permanently delete it from Cloudflare and the database.',
              'Deleting an image here does not remove it from the lesson body — you must also delete the ![...](url) line from the editor manually.',
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-slate-400 text-xs">
                <span className="shrink-0 text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

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

        <div className="mt-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            <span className="font-semibold">Tip:</span> Use descriptive alt text (the part in square brackets) — it becomes the caption visible to readers.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────

function DeleteModal({ image, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white">Delete image?</h3>
            <p className="text-sm text-slate-400 mt-1">
              This will permanently remove the image from Cloudflare. If it's still referenced in the lesson body, it will appear broken.
            </p>
          </div>
        </div>
        {image.public_url && (
          <img
            src={image.public_url}
            alt=""
            className="w-full h-24 object-cover rounded-lg border border-gray-700 mb-4"
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-sm text-slate-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm text-white font-medium transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image library panel ───────────────────────────────────────────────────────

function ImageLibrary({ lessonId, token, refreshKey }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // image record
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/lessons/${lessonId}/content-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(data.images || []);
      if (data.images?.length > 0) setOpen(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [lessonId, token]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${API}/admin/lessons/${lessonId}/content-images/${confirmDelete.image_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Image deleted');
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  if (!lessonId) return null;

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden mt-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors text-sm"
        >
          <span className="flex items-center gap-2 font-medium text-slate-300">
            <ImageIcon className="w-4 h-4 text-primary" />
            Image Library
            {images.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-semibold">
                {images.length}
              </span>
            )}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {open && (
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No images uploaded for this lesson yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map(img => {
                  const markdown = `![${img.filename || 'image'}](${img.public_url})`;
                  return (
                    <div
                      key={img.image_id}
                      className="group relative border border-border rounded-lg overflow-hidden bg-gray-900/40"
                    >
                      <img
                        src={img.public_url}
                        alt={img.filename || ''}
                        className="w-full h-24 object-cover"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <CopyButton text={markdown} size="md" />
                        <button
                          onClick={() => setConfirmDelete(img)}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors text-slate-400 hover:text-red-400"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Filename */}
                      {img.filename && (
                        <p className="px-2 py-1 text-[10px] text-slate-500 truncate border-t border-border">
                          {img.filename}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-slate-600 mt-3">
              Hover an image to copy its markdown or delete it from storage.
            </p>
          </div>
        )}
      </div>

      {confirmDelete && (
        <DeleteModal
          image={confirmDelete}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          deleting={deleting}
        />
      )}
    </>
  );
}

// ── Main editor component ─────────────────────────────────────────────────────

export function MarkdownContentEditor({ value, onChange, token, lessonId }) {
  const fileInputRef = useRef(null);
  const editorApiRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [libraryRefresh, setLibraryRefresh] = useState(0);

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
      // 1. Get Cloudflare direct upload URL
      const { data } = await axios.get(`${API}/admin/image/upload-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Upload to Cloudflare
      const form = new FormData();
      form.append('file', file);
      const cfResp = await fetch(data.upload_url, { method: 'POST', body: form });
      if (!cfResp.ok) throw new Error('Cloudflare upload failed');

      // 3. Save record to DB (if we have a lessonId)
      const filename = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      if (lessonId) {
        await axios.post(
          `${API}/admin/lessons/${lessonId}/content-images`,
          { image_id: data.image_id, public_url: data.public_url, filename },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLibraryRefresh(r => r + 1);
      }

      // 4. Insert markdown at cursor
      const markdown = `\n\n![${filename}](${data.public_url})\n\n`;
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
          commands.heading,
          commands.divider,
          commands.unorderedListCommand, commands.orderedListCommand,
          commands.divider,
          commands.link, commands.quote, commands.code, commands.codeBlock,
          commands.divider,
          uploadImageCmd,
        ]}
        extraCommands={[commands.codeEdit, commands.codeLive, commands.codePreview]}
      />

      {/* Image Library */}
      <ImageLibrary lessonId={lessonId} token={token} refreshKey={libraryRefresh} />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default MarkdownContentEditor;
