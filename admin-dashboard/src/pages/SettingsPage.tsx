import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ExternalLink, Save, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Settings {
  name?: string;
  title?: string;
  bio?: string;
  email?: string;
  location?: string;
  avatarUrl?: string;
  cvUrl?: string;
  socialLinks?: { name: string; url: string }[];
  interests?: { symbol: string; label: string }[];
}

export function SettingsPage() {
  const { admin } = useAuth();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [message, setMessage] = useState('');
  const [credentialEmail, setCredentialEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (admin?.email) setCredentialEmail(admin.email);
  }, [admin?.email]);

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

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('CV PDF must be less than 10MB');
      return;
    }

    setUploadingCv(true);
    setMessage('');
    try {
      const result = await api.uploadCv(file);
      const nextSettings = { ...settings, cvUrl: result.url };
      setSettings(nextSettings);
      await api.updateSettings(nextSettings);
      setMessage('CV uploaded and saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.message || 'Failed to upload CV');
    } finally {
      setUploadingCv(false);
    }
  }

  async function handleCredentialsSave() {
    setSaving(true);
    setMessage('');
    try {
      await api.updateCredentials({
        email: credentialEmail,
        currentPassword,
        newPassword: newPassword || undefined,
      });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Admin credentials updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.message || 'Failed to update credentials');
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

        {/* CV */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">CV</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">CV URL</label>
              <input
                type="url"
                value={settings.cvUrl || ''}
                onChange={(e) => setSettings({ ...settings, cvUrl: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="https://... or leave empty to use /cv.pdf"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Public stable link: https://kararspace.com/cv
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 transition cursor-pointer">
                <Upload size={18} />
                {uploadingCv ? 'Uploading...' : 'Upload PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvUpload}
                  disabled={uploadingCv}
                  className="hidden"
                />
              </label>
              <a
                href="https://kararspace.com/cv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition"
              >
                <ExternalLink size={18} />
                Open public CV
              </a>
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

        {/* Admin Credentials */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Admin Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Admin Email</label>
              <input
                type="email"
                value={credentialEmail}
                onChange={(e) => setCredentialEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="Required to update credentials"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-500"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <button
              onClick={handleCredentialsSave}
              disabled={saving || !currentPassword}
              className="px-4 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
            >
              Update Admin Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
