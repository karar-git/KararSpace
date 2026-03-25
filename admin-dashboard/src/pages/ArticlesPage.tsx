import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  featuredImage?: string;
  readingTime?: number;
  tags: string[];
  published: boolean;
  publishedAt?: string;
}

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      const data = await api.getArticles();
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(article: Partial<Article>) {
    try {
      if (isNew) {
        await api.createArticle(article);
      } else if (editing) {
        await api.updateArticle(editing.id, article);
      }
      setEditing(null);
      setIsNew(false);
      loadArticles();
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return;
    try {
      await api.deleteArticle(id);
      loadArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  }

  if (loading) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Articles</h1>
        <button
          onClick={() => {
            setIsNew(true);
            setEditing({ id: '', title: '', slug: '', tags: [], published: false });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No articles yet.</div>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded ${article.published ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm">{article.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditing(article); setIsNew(false); }} className="p-2 text-zinc-500 hover:text-white transition">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(article.id)} className="p-2 text-zinc-500 hover:text-red-400 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">{isNew ? 'New Article' : 'Edit Article'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editing); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title *</label>
                <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" required />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Summary</label>
                <textarea value={editing.summary || ''} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} rows={2} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Content</label>
                <textarea value={editing.content || ''} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={10} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Reading Time (minutes)</label>
                <input type="number" value={editing.readingTime || ''} onChange={(e) => setEditing({ ...editing, readingTime: parseInt(e.target.value) || undefined })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="w-5 h-5 rounded bg-zinc-800 border-zinc-700" />
                <span className="text-zinc-300">Published</span>
              </label>
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
