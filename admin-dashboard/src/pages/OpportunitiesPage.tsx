import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  type: string;
  organization?: string;
  link?: string;
  deadline?: string;
  location?: string;
  published: boolean;
}

const opportunityTypes = [
  'Internship',
  'Scholarship',
  'Fellowship',
  'Program',
  'Competition',
  'Grant',
  'Other',
];

export function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await api.getOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(item: Partial<Opportunity>) {
    try {
      if (isNew) await api.createOpportunity(item);
      else if (editing) await api.updateOpportunity(editing.id, item);
      setEditing(null);
      setIsNew(false);
      loadData();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this opportunity?')) return;
    try {
      await api.deleteOpportunity(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  function getNewOpportunity(): Opportunity {
    return {
      id: '',
      title: '',
      type: 'Internship',
      published: true,
    };
  }

  if (loading) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Opportunities</h1>
          <p className="text-zinc-500 mt-1">Share internships, scholarships, and programs you find</p>
        </div>
        <button 
          onClick={() => { setIsNew(true); setEditing(getNewOpportunity()); }} 
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition"
        >
          <Plus size={20} />
          New Opportunity
        </button>
      </div>

      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No opportunities yet.</div>
        ) : (
          opportunities.map((opp) => (
            <div key={opp.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{opp.title}</h3>
                    <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded">{opp.type}</span>
                    {!opp.published && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-900/50 text-yellow-500 rounded">Draft</span>
                    )}
                  </div>
                  {opp.organization && (
                    <p className="text-zinc-400 text-sm mb-1">{opp.organization}</p>
                  )}
                  <div className="flex items-center gap-4 text-zinc-500 text-sm">
                    {opp.location && <span>{opp.location}</span>}
                    {opp.deadline && (
                      <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                    )}
                    {opp.link && (
                      <a href={opp.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-zinc-400 hover:text-white">
                        <ExternalLink size={14} />
                        Link
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(opp); setIsNew(false); }} className="p-2 text-zinc-500 hover:text-white transition">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(opp.id)} className="p-2 text-zinc-500 hover:text-red-400 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">{isNew ? 'New Opportunity' : 'Edit Opportunity'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title *</label>
                <input 
                  type="text" 
                  value={editing.title} 
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} 
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" 
                  placeholder="e.g., Google STEP Internship 2026"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Type *</label>
                <select 
                  value={editing.type} 
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })} 
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                >
                  {opportunityTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Organization</label>
                <input 
                  type="text" 
                  value={editing.organization || ''} 
                  onChange={(e) => setEditing({ ...editing, organization: e.target.value })} 
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" 
                  placeholder="e.g., Google, OpenAI, MIT"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Description</label>
                <textarea 
                  value={editing.description || ''} 
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} 
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 min-h-[100px]" 
                  placeholder="Brief description of the opportunity..."
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Link</label>
                <input 
                  type="url" 
                  value={editing.link || ''} 
                  onChange={(e) => setEditing({ ...editing, link: e.target.value })} 
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" 
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Location</label>
                  <input 
                    type="text" 
                    value={editing.location || ''} 
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })} 
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" 
                    placeholder="Remote, USA, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Deadline</label>
                  <input 
                    type="date" 
                    value={editing.deadline ? editing.deadline.split('T')[0] : ''} 
                    onChange={(e) => setEditing({ ...editing, deadline: e.target.value })} 
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="published" 
                  checked={editing.published} 
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })} 
                  className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-white focus:ring-0"
                />
                <label htmlFor="published" className="text-sm text-zinc-400">Published (visible on website)</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setEditing(null); setIsNew(false); }} 
                  className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition"
                >
                  {isNew ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
