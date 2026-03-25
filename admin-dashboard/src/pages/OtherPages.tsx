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

// Ideas Page
export function IdeasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { loadData(); }, []);
  async function loadData() { try { setItems(await api.getIdeas()); } catch (e) { console.error(e); } finally { setLoading(false); } }
  async function handleSave(item: any) { try { if (isNew) await api.createIdea(item); else await api.updateIdea(item.id, item); setEditing(null); setIsNew(false); loadData(); } catch (e) { console.error(e); } }
  async function handleDelete(id: string) { if (!confirm('Delete?')) return; try { await api.deleteIdea(id); loadData(); } catch (e) { console.error(e); } }

  if (loading) return <div className="text-zinc-500">Loading...</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Ideas</h1>
        <button onClick={() => { setIsNew(true); setEditing({ id: '', title: '', slug: '', published: false }); }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg"><Plus size={20} />New Idea</button>
      </div>
      <div className="space-y-4">
        {items.length === 0 ? <div className="text-center py-12 text-zinc-500">No ideas yet.</div> : items.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
            <div><h3 className="text-lg font-semibold text-white">{item.title}</h3></div>
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
            <div className="flex items-center justify-between p-6 border-b border-zinc-800"><h2 className="text-xl font-bold text-white">{isNew ? 'New' : 'Edit'} Idea</h2><button onClick={() => { setEditing(null); setIsNew(false); }} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing); }} className="p-6 space-y-4">
              <input type="text" placeholder="Title *" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" required />
              <textarea placeholder="Content" value={editing.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={6} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="w-5 h-5" /><span className="text-zinc-300">Published</span></label>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-3 bg-white text-black rounded-lg">{isNew ? 'Create' : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Life Page
export function LifePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { loadData(); }, []);
  async function loadData() { try { setItems(await api.getLifeContent()); } catch (e) { console.error(e); } finally { setLoading(false); } }
  async function handleSave(item: any) { try { if (isNew) await api.createLifeContent(item); else await api.updateLifeContent(item.id, item); setEditing(null); setIsNew(false); loadData(); } catch (e) { console.error(e); } }
  async function handleDelete(id: string) { if (!confirm('Delete?')) return; try { await api.deleteLifeContent(id); loadData(); } catch (e) { console.error(e); } }

  if (loading) return <div className="text-zinc-500">Loading...</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Life</h1>
        <button onClick={() => { setIsNew(true); setEditing({ id: '', title: '', slug: '', published: false }); }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg"><Plus size={20} />New Post</button>
      </div>
      <div className="space-y-4">
        {items.length === 0 ? <div className="text-center py-12 text-zinc-500">No life content yet.</div> : items.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
            <div><h3 className="text-lg font-semibold text-white">{item.title}</h3><p className="text-zinc-500 text-sm">{item.excerpt}</p></div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-2 text-zinc-500 hover:text-white"><Pencil size={18} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800"><h2 className="text-xl font-bold text-white">{isNew ? 'New' : 'Edit'} Life Post</h2><button onClick={() => { setEditing(null); setIsNew(false); }} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing); }} className="p-6 space-y-4">
              <input type="text" placeholder="Title *" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" required />
              <input type="text" placeholder="Excerpt" value={editing.excerpt || ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
              <textarea placeholder="Content" value={editing.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={8} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="w-5 h-5" /><span className="text-zinc-300">Published</span></label>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-3 bg-white text-black rounded-lg">{isNew ? 'Create' : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Now Focus Page
export function NowFocusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { loadData(); }, []);
  async function loadData() { try { setItems(await api.getNowFocus()); } catch (e) { console.error(e); } finally { setLoading(false); } }
  async function handleSave(item: any) { try { if (isNew) await api.createNowFocus(item); else await api.updateNowFocus(item.id, item); setEditing(null); setIsNew(false); loadData(); } catch (e) { console.error(e); } }
  async function handleDelete(id: string) { if (!confirm('Delete?')) return; try { await api.deleteNowFocus(id); loadData(); } catch (e) { console.error(e); } }

  if (loading) return <div className="text-zinc-500">Loading...</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Now Focus</h1>
        <button onClick={() => { setIsNew(true); setEditing({ id: '', title: '', status: 'active' }); }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg"><Plus size={20} />New Focus</button>
      </div>
      <div className="space-y-4">
        {items.length === 0 ? <div className="text-center py-12 text-zinc-500">No focus items yet.</div> : items.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
            <div><h3 className="text-lg font-semibold text-white">{item.title}</h3><p className="text-zinc-500 text-sm">{item.description}</p></div>
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
            <div className="flex items-center justify-between p-6 border-b border-zinc-800"><h2 className="text-xl font-bold text-white">{isNew ? 'New' : 'Edit'} Focus</h2><button onClick={() => { setEditing(null); setIsNew(false); }} className="text-zinc-500 hover:text-white"><X size={24} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing); }} className="p-6 space-y-4">
              <input type="text" placeholder="Title *" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white" required />
              <textarea placeholder="Description" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white resize-none" />
              <select value={editing.status || 'active'} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-3 bg-white text-black rounded-lg">{isNew ? 'Create' : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
