import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Articles, Projects } from '@/entities';
import { format } from 'date-fns';

export default function HomePage() {
  const [latestArticles, setLatestArticles] = useState<Articles[]>([]);
  const [latestProjects, setLatestProjects] = useState<Projects[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesResult, projectsResult] = await Promise.all([
          BaseCrudService.getAll<Articles>('articles', {}, { limit: 3 }),
          BaseCrudService.getAll<Projects>('projects', {}, { limit: 4 }),
        ]);
        setLatestArticles(articlesResult.items);
        setLatestProjects(projectsResult.items);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="section">
          <div className="container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-balance mb-6">
                Building things at the intersection of technology and human potential.
              </h1>
              <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl">
                I'm Karar Haitham — exploring mathematics, artificial intelligence, 
                and the pursuit of excellence through deep work and meaningful creation.
              </p>
            </div>
          </div>
        </section>

        {/* Selected Work */}
        <section className="section border-t border-border">
          <div className="container">
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
                Selected Work
              </h2>
              <Link 
                to="/projects" 
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[16/10] bg-border rounded-lg mb-4" />
                    <div className="h-4 bg-border rounded w-3/4 mb-2" />
                    <div className="h-3 bg-border rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
                {latestProjects.map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="group block"
                  >
                    {project.mainImage && (
                      <div className="aspect-[16/10] bg-border rounded-lg overflow-hidden mb-4">
                        <img
                          src={project.mainImage}
                          alt={project.title || ''}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1 group-hover:text-muted transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted line-clamp-2">
                          {project.shortDescription}
                        </p>
                      </div>
                      <ArrowUpRight 
                        size={20} 
                        className="text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" 
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Writing */}
        <section className="section border-t border-border">
          <div className="container">
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
                Writing
              </h2>
              <Link 
                to="/writing" 
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse py-6 border-b border-border">
                    <div className="h-5 bg-border rounded w-2/3 mb-2" />
                    <div className="h-3 bg-border rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {latestArticles.map((article) => (
                  <Link
                    key={article._id}
                    to={`/writing/${article._id}`}
                    className="group block py-6 first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium mb-2 group-hover:text-muted transition-colors">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-muted text-sm line-clamp-2 mb-3">
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted">
                          {article.publishedAt && (
                            <span>{format(new Date(article.publishedAt), 'MMM d, yyyy')}</span>
                          )}
                          {article.readingTimeMinutes && (
                            <span>{article.readingTimeMinutes} min read</span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight 
                        size={20} 
                        className="text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" 
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="section border-t border-border">
          <div className="container">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Research', path: '/research', desc: 'Academic papers and studies' },
                { label: 'Ideas', path: '/ideas', desc: 'Quick thoughts and notes' },
                { label: 'Certificates', path: '/certificates', desc: 'Credentials and achievements' },
                { label: 'Now', path: '/now', desc: 'Current focus and activities' },
              ].map(({ label, path, desc }) => (
                <Link
                  key={path}
                  to={path}
                  className="group p-6 border border-border rounded-lg hover:border-border-hover transition-colors"
                >
                  <h3 className="font-medium mb-1 group-hover:text-muted transition-colors">
                    {label}
                  </h3>
                  <p className="text-sm text-muted">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
