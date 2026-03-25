import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Save } from 'lucide-react';

interface Settings {
  name?: string;
  title?: string;
  bio?: string;
  email?: string;
  location?: string;
  avatarUrl?: string;
  socialLinks?: { name: string; url: string }[];
  interests?: { symbol: string; label: string }[];
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await api.getSettings();
      setSettings({
        ...data,
        socialLinks: data.socialLinks || [],
        interests: data.interests || [],
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      await api.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function updateSocialLink(index: number, field: string, value: string) {
    const links = [...(settings.socialLinks || [])];
    links[index] = { ...links[index], [field]: value };
    setSettings({ ...settings, socialLinks: links });
  }

  function addSocialLink() {
    setSettings({
      ...settings,
      socialLinks: [...(settings.socialLinks || []), { name: '', url: '' }],
    });
  }

  function removeSocialLink(index: number) {
    const links = [...(settings.socialLinks || [])];
    links.splice(index, 1);
    setSettings({ ...settings, socialLinks: links });
  }

  if (loading) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg ${message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Personal Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                value={settings.name || ''}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Title</label>
              <input
                type="text"
                value={settings.title || ''}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="AI/ML Engineer"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Bio</label>
              <textarea
                value={settings.bio || ''}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500 resize-none"
                placeholder="A short bio about yourself..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Location</label>
                <input
                  type="text"
                  value={settings.location || ''}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Social Links</h2>
            <button
              onClick={addSocialLink}
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-4">
            {(settings.socialLinks || []).map((link, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                  placeholder="Platform name"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  className="flex-[2] px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                  placeholder="https://..."
                />
                <button
                  onClick={() => removeSocialLink(index)}
                  className="px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  Remove
                </button>
              </div>
            ))}
            {(settings.socialLinks || []).length === 0 && (
              <p className="text-zinc-500 text-sm">No social links added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
