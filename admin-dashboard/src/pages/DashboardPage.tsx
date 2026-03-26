import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { FolderKanban, FileText, Award, FlaskConical } from 'lucide-react';

export function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    articles: 0,
    certificates: 0,
    research: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [projects, articles, certificates, research] = await Promise.all([
        api.getProjects(),
        api.getArticles(),
        api.getCertificates(),
        api.getResearch(),
      ]);
      setStats({
        projects: projects.length,
        articles: articles.length,
        certificates: certificates.length,
        research: research.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { name: 'Projects', count: stats.projects, icon: FolderKanban, color: 'from-purple-500 to-purple-600' },
    { name: 'Articles', count: stats.articles, icon: FileText, color: 'from-blue-500 to-blue-600' },
    { name: 'Certificates', count: stats.certificates, icon: Award, color: 'from-green-500 to-green-600' },
    { name: 'Research', count: stats.research, icon: FlaskConical, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.name}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="text-white" size={24} />
            </div>
            <p className="text-zinc-500 text-sm mb-1">{card.name}</p>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : card.count}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Start</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 mb-4">
            Welcome to your portfolio admin dashboard. Here you can manage all your content:
          </p>
          <ul className="space-y-2 text-zinc-500">
            <li>• <strong className="text-zinc-300">Projects:</strong> Showcase your work and side projects</li>
            <li>• <strong className="text-zinc-300">Articles:</strong> Write blog posts and tutorials</li>
            <li>• <strong className="text-zinc-300">Certificates:</strong> Display your certifications</li>
            <li>• <strong className="text-zinc-300">Research:</strong> Share your research papers</li>
            <li>• <strong className="text-zinc-300">Opportunities:</strong> Share internships, scholarships, and programs</li>
            <li>• <strong className="text-zinc-300">Settings:</strong> Update your personal info and social links</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
