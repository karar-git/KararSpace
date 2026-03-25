import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Projects } from '@/entities';
import { Image } from '@/components/ui/image';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Projects[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  const loadProjects = async (skipValue: number = 0) => {
    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<Projects>('projects', {}, { limit: 9, skip: skipValue });
      if (skipValue === 0) {
        setProjects(result.items);
      } else {
        setProjects(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Projects
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-paragraph leading-relaxed">
              Serious projects with focus on depth over quantity. Each project includes the problem, approach, and insights gained.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="min-h-[600px]">
            {isLoading && projects.length === 0 ? null : projects.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project, index) => (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="bg-background border border-foreground/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-reveal"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {project.mainImage && (
                        <Image
                          src={project.mainImage}
                          alt={project.title || 'Project'}
                          width={400}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-heading font-bold text-foreground mb-3 line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-foreground/70 font-paragraph text-sm leading-relaxed mb-4 line-clamp-3">
                          {project.shortDescription}
                        </p>
                        <div className="flex items-center justify-between">
                          {project.publicationDate && (
                            <div className="flex items-center gap-2 text-xs text-foreground/60 font-paragraph">
                              <Calendar size={14} />
                              {format(new Date(project.publicationDate), 'MMM yyyy')}
                            </div>
                          )}
                          {project.projectUrl && (
                            <ExternalLink size={16} className="text-primary" />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNext && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => loadProjects(skip)}
                      disabled={isLoading}
                      className="bg-primary text-white px-8 py-3 rounded-lg font-paragraph font-semibold hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-foreground/60 font-paragraph py-20">
                No projects available yet.
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
