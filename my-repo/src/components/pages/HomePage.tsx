import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code2, Award, Zap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Articles, Projects, Certificates } from '@/entities';
import { Image } from '@/components/ui/image';

export default function HomePage() {
  const [latestArticles, setLatestArticles] = useState<Articles[]>([]);
  const [latestProjects, setLatestProjects] = useState<Projects[]>([]);
  const [latestCerts, setLatestCerts] = useState<Certificates[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [articlesResult, projectsResult, certsResult] = await Promise.all([
          BaseCrudService.getAll<Articles>('articles', {}, { limit: 2 }),
          BaseCrudService.getAll<Projects>('projects', {}, { limit: 2 }),
          BaseCrudService.getAll<Certificates>('certificates', {}, { limit: 2 })
        ]);
        setLatestArticles(articlesResult.items);
        setLatestProjects(projectsResult.items);
        setLatestCerts(certsResult.items);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const interests = [
    { symbol: '∑', label: 'Mathematics', color: 'from-blue-500/20 to-blue-600/20' },
    { symbol: '⚙', label: 'AI & ML', color: 'from-purple-500/20 to-purple-600/20' },
    { symbol: '♪', label: 'Violin', color: 'from-pink-500/20 to-pink-600/20' },
    { symbol: '◊', label: 'Calisthenics', color: 'from-orange-500/20 to-orange-600/20' },
    { symbol: '∞', label: 'Continuous Learning', color: 'from-green-500/20 to-green-600/20' },
    { symbol: '◆', label: 'Excellence', color: 'from-indigo-500/20 to-indigo-600/20' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* Symbolic Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="1200" height="600" fill="url(#grid)" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="2"/>
            <circle cx="1100" cy="500" r="60" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="2"/>
            <path d="M 200 300 Q 400 200 600 300 T 1000 300" fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="2"/>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-reveal">
            <div className="inline-flex items-center gap-3 mb-8 bg-indigo-500/10 px-6 py-3 rounded-full border border-indigo-400/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <span className="text-sm font-paragraph font-semibold text-indigo-200">Exploring the intersection of technology, mathematics, and human excellence</span>
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-slate-100 mb-8 leading-tight">
              I Build, Think & Create
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 font-paragraph mb-12 leading-relaxed max-w-2xl mx-auto">
              Passionate about mathematics, artificial intelligence, violin performance, and physical excellence. Exploring deep work and meaningful innovation.
            </p>

            {/* Interest Symbols */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {interests.map((interest, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${interest.color} px-5 py-3 rounded-lg backdrop-blur-sm border border-slate-400/20 hover:scale-110 transition-all duration-300 hover:border-slate-300/40`}
                >
                  <span className="text-2xl font-bold text-slate-200 mr-2">{interest.symbol}</span>
                  <span className="text-xs font-paragraph font-semibold text-slate-100">{interest.label}</span>
                </div>
              ))}
            </div>

            <Link
              to="/writing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-lg font-paragraph font-semibold hover:from-indigo-600 hover:to-purple-600 hover:scale-[1.05] transition-all duration-200 shadow-lg shadow-indigo-500/50"
            >
              Explore My Work
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Sections - 4 Pillars */}
      <section className="py-24 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Writing */}
            <Link
              to="/writing"
              className="group bg-gradient-to-br from-blue-950/50 to-blue-900/30 p-12 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-reveal border border-blue-800/50 hover:border-blue-700/70 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-blue-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="text-blue-300" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-blue-400/40">∑</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-100 mb-3">Writing</h2>
                <p className="text-slate-300 font-paragraph mb-6 leading-relaxed">
                  Articles and research on technology, mathematics, and deep work.
                </p>
                <div className="flex items-center gap-2 text-blue-300 font-paragraph font-semibold group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>

            {/* Projects */}
            <Link
              to="/projects"
              className="group bg-gradient-to-br from-purple-950/50 to-purple-900/30 p-12 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-reveal border border-purple-800/50 hover:border-purple-700/70 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-purple-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Code2 className="text-purple-300" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-purple-400/40">⚙</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-100 mb-3">Projects</h2>
                <p className="text-slate-300 font-paragraph mb-6 leading-relaxed">
                  Serious projects focused on depth, problem-solving, and real impact.
                </p>
                <div className="flex items-center gap-2 text-purple-300 font-paragraph font-semibold group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>

            {/* Certificates */}
            <Link
              to="/certificates"
              className="group bg-gradient-to-br from-green-950/50 to-green-900/30 p-12 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-reveal border border-green-800/50 hover:border-green-700/70 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-green-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="text-green-300" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-green-400/40">◆</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-100 mb-3">Certifications</h2>
                <p className="text-slate-300 font-paragraph mb-6 leading-relaxed">
                  Credentials and achievements in continuous learning and excellence.
                </p>
                <div className="flex items-center gap-2 text-green-300 font-paragraph font-semibold group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>

            {/* Opportunities */}
            <Link
              to="/now"
              className="group bg-gradient-to-br from-orange-950/50 to-orange-900/30 p-12 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-reveal border border-orange-800/50 hover:border-orange-700/70 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-orange-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="text-orange-300" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-orange-400/40">♪</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-100 mb-3">Current Focus</h2>
                <p className="text-slate-300 font-paragraph mb-6 leading-relaxed">
                  What I'm currently focused on and opportunities I'm exploring.
                </p>
                <div className="flex items-center gap-2 text-orange-300 font-paragraph font-semibold group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-100 text-center mb-16 animate-reveal">
            Latest Work
          </h2>

          <div className="min-h-[400px]">
            {isLoading ? null : (
              <div className="space-y-16">
                {/* Latest Articles */}
                {latestArticles.length > 0 && (
                  <div className="animate-reveal">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                      <h3 className="text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
                        <BookOpen size={28} className="text-blue-400" />
                        Recent Writing
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {latestArticles.map((article, idx) => (
                        <Link
                          key={article._id}
                          to={`/writing/${article._id}`}
                          className="group bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-700/50 relative"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {article.featuredImage && (
                            <Image
                              src={article.featuredImage}
                              alt={article.title || 'Article'}
                              width={400}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="p-6">
                            <h4 className="text-lg font-heading font-bold text-slate-100 mb-2 line-clamp-2">
                              {article.title}
                            </h4>
                            <p className="text-slate-400 font-paragraph text-sm leading-relaxed line-clamp-2">
                              {article.summary}
                            </p>
                            {article.readingTimeMinutes && (
                              <p className="text-xs text-slate-500 mt-3 font-paragraph">
                                {article.readingTimeMinutes} min read
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest Projects */}
                {latestProjects.length > 0 && (
                  <div className="animate-reveal">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600"></div>
                      <h3 className="text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
                        <Code2 size={28} className="text-purple-400" />
                        Recent Projects
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {latestProjects.map((project) => (
                        <Link
                          key={project._id}
                          to={`/projects/${project._id}`}
                          className="group bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-purple-700/50 relative"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {project.mainImage && (
                            <Image
                              src={project.mainImage}
                              alt={project.title || 'Project'}
                              width={400}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="p-6">
                            <h4 className="text-lg font-heading font-bold text-slate-100 mb-2 line-clamp-2">
                              {project.title}
                            </h4>
                            <p className="text-slate-400 font-paragraph text-sm leading-relaxed line-clamp-2">
                              {project.shortDescription}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latest Certificates */}
                {latestCerts.length > 0 && (
                  <div className="animate-reveal">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600"></div>
                      <h3 className="text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
                        <Award size={28} className="text-green-400" />
                        Recent Achievements
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {latestCerts.map((cert) => (
                        <div
                          key={cert._id}
                          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-green-700/50 relative group"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <h4 className="text-lg font-heading font-bold text-slate-100 mb-2">
                            {cert.title}
                          </h4>
                          <p className="text-slate-400 font-paragraph text-sm mb-3">
                            {cert.issuer}
                          </p>
                          {cert.credentialLink && (
                            <a
                              href={cert.credentialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 font-paragraph font-semibold text-sm flex items-center gap-1 transition-colors"
                            >
                              View Credential
                              <ArrowRight size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-reveal {
          animation: reveal 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
