// Simple placeholder pages for other sections
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

// Research Page
export function ResearchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { loadData(); }, []);
  async function loadData() {
    try { setItems(await api.getResearch()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }
  async function handleSave(item: any) {
    try {
      if (isNew) await api.createResearch(item);
      else await api.updateResearch(item.id, item);
      setEditing(null); setIsNew(false); loadData();
    } catch (e) { console.error(e); }
  }
  async function handleDelete(id: string) {
    if (!confirm('Delete?')) return;
    try { await api.deleteResearch(id); loadData(); } catch (e) { console.error(e); }
  }

  if (loading) return <div className="text-zinc-500">Loading...</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Research</h1>
        <button onClick={() => { setIsNew(true); setEditing({ id: '', title: '', slug: '' }); }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition">
          <Plus size={20} />New Research
        </button>
      </div>
      <div className="space-y-4">
        {items.length === 0 ? <div className="text-center py-12 text-zinc-500">No research yet.</div> : items.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
            <div><h3 className="text-lg font-semibold text-white">{item.title}</h3><p className="text-zinc-500 text-sm">{item.authors}</p></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-2 text-zinc-500 hover:text-white"><Pencil size={18} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">{isNew ? 'New' : 'Edit'} Research</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing); }} className="p-6 space-y-4">
              <input type="text" placeholder="Title *" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" required />
              <input type="text" placeholder="Authors" value={editing.authors || ''} onChange={(e) => setEditing({ ...editing, authors: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
              <textarea placeholder="Abstract" value={editing.abstract || ''} onChange={(e) => setEditing({ ...editing, abstract: e.target.value })} rows={4} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none" />
              <input type="url" placeholder="Paper URL" value={editing.paperUrl || ''} onChange={(e) => setEditing({ ...editing, paperUrl: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-white text-black rounded-lg">{isNew ? 'Create' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
