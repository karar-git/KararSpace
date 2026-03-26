import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Projects } from '@/entities';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Projects[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  const loadProjects = async (skipValue: number = 0) => {
    try {
      const result = await BaseCrudService.getAll<Projects>('projects', {}, { limit: 12, skip: skipValue });
      if (skipValue === 0) {
        setProjects(result.items);
      } else {
        setProjects(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadProjects();
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="section border-b border-border">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4">
              Work
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              Selected projects focused on depth and meaningful impact.
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="section">
          <div className="container">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[16/10] bg-border rounded-lg mb-5" />
                    <div className="h-5 bg-border rounded w-3/4 mb-2" />
                    <div className="h-4 bg-border rounded w-full" />
                  </div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
                  {projects.map((project, index) => (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="group block"
                    >
                      <div className="aspect-[16/10] bg-border rounded-lg overflow-hidden mb-5">
                        <img
                          src={project.mainImage || `/images/project-${(index % 4) + 1}.jpg`}
                          alt={project.title || ''}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-medium mb-2 group-hover:text-muted transition-colors">
                            {project.title}
                          </h2>
                          {project.shortDescription && (
                            <p className="text-muted text-sm line-clamp-2">
                              {project.shortDescription}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight 
                          size={20} 
                          className="text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" 
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNext && (
                  <div className="mt-16 text-center">
                    <button
                      onClick={() => loadProjects(skip)}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Load more projects
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted">No projects yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
