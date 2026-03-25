import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  issuer?: string;
  credentialId?: string;
  credentialLink?: string;
  issueDate?: string;
}

export function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await api.getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(item: Partial<Certificate>) {
    try {
      if (isNew) await api.createCertificate(item);
      else if (editing) await api.updateCertificate(editing.id, item);
      setEditing(null);
      setIsNew(false);
      loadData();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this certificate?')) return;
    try {
      await api.deleteCertificate(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  if (loading) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Certificates</h1>
        <button onClick={() => { setIsNew(true); setEditing({ id: '', title: '' }); }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition">
          <Plus size={20} />
          New Certificate
        </button>
      </div>

      <div className="space-y-4">
        {certificates.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No certificates yet.</div>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{cert.title}</h3>
                <p className="text-zinc-500 text-sm">{cert.issuer} {cert.issueDate && `• ${new Date(cert.issueDate).toLocaleDateString()}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditing(cert); setIsNew(false); }} className="p-2 text-zinc-500 hover:text-white transition"><Pencil size={18} /></button>
                <button onClick={() => handleDelete(cert.id)} className="p-2 text-zinc-500 hover:text-red-400 transition"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">{isNew ? 'New Certificate' : 'Edit Certificate'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title *</label>
                <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" required />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Issuer</label>
                <input type="text" value={editing.issuer || ''} onChange={(e) => setEditing({ ...editing, issuer: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Credential Link</label>
                <input type="url" value={editing.credentialLink || ''} onChange={(e) => setEditing({ ...editing, credentialLink: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Issue Date</label>
                <input type="date" value={editing.issueDate ? editing.issueDate.split('T')[0] : ''} onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition">{isNew ? 'Create' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
