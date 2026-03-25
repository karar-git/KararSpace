import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  problem?: string;
  approach?: string;
  insights?: string;
  mainImage?: string;
  projectUrl?: string;
  githubUrl?: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  publishedAt?: string;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(project: Partial<Project>) {
    try {
      if (isNew) {
        await api.createProject(project);
      } else if (editing) {
        await api.updateProject(editing.id, project);
      }
      setEditing(null);
      setIsNew(false);
      loadProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  async function togglePublished(project: Project) {
    try {
      await api.updateProject(project.id, {
        published: !project.published,
        publishedAt: !project.published ? new Date().toISOString() : null,
      });
      loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  }

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button
          onClick={() => {
            setIsNew(true);
            setEditing({
              id: '',
              title: '',
              slug: '',
              tags: [],
              featured: false,
              published: false,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Projects list */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No projects yet. Create your first project!
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  {project.featured && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                      Featured
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      project.published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm">{project.shortDescription}</p>
                {project.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(project)}
                  className="p-2 text-zinc-500 hover:text-white transition"
                  title={project.published ? 'Unpublish' : 'Publish'}
                >
                  {project.published ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => {
                    setEditing(project);
                    setIsNew(false);
                  }}
                  className="p-2 text-zinc-500 hover:text-white transition"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <ProjectModal
          project={editing}
          isNew={isNew}
          onSave={handleSave}
          onClose={() => {
            setEditing(null);
            setIsNew(false);
          }}
        />
      )}
    </div>
  );
}

function ProjectModal({
  project,
  isNew,
  onSave,
  onClose,
}: {
  project: Project;
  isNew: boolean;
  onSave: (data: Partial<Project>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(project);
  const [tagInput, setTagInput] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">
            {isNew ? 'New Project' : 'Edit Project'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Short Description</label>
            <textarea
              value={form.shortDescription || ''}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Project URL</label>
              <input
                type="url"
                value={form.projectUrl || ''}
                onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">GitHub URL</label>
              <input
                type="url"
                value={form.githubUrl || ''}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Problem</label>
            <textarea
              value={form.problem || ''}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Approach</label>
            <textarea
              value={form.approach || ''}
              onChange={(e) => setForm({ ...form, approach: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Insights</label>
            <textarea
              value={form.insights || ''}
              onChange={(e) => setForm({ ...form, insights: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700"
              />
              <span className="text-zinc-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700"
              />
              <span className="text-zinc-300">Published</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
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
  );
}
