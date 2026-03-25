import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Projects } from '@/entities';
import { Image } from '@/components/ui/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Projects | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const data = await BaseCrudService.getById<Projects>('projects', id!);
        setProject(data);
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto min-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : !project ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Project not found</h2>
                <Link to="/projects" className="text-primary hover:text-primary/80 font-paragraph">
                  Back to Projects
                </Link>
              </div>
            ) : (
              <article className="animate-reveal">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-paragraph mb-8 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Projects
                </Link>

                {project.mainImage && (
                  <Image
                    src={project.mainImage}
                    alt={project.title || 'Project'}
                    width={800}
                    className="w-full h-auto rounded-2xl shadow-2xl mb-8"
                  />
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                  {project.title}
                </h1>

                <div className="flex items-center gap-6 text-foreground/60 font-paragraph text-sm mb-8 pb-8 border-b border-foreground/10">
                  {project.publicationDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {format(new Date(project.publicationDate), 'MMMM yyyy')}
                    </div>
                  )}
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink size={16} />
                      View Project
                    </a>
                  )}
                </div>

                {project.shortDescription && (
                  <div className="bg-primary/5 p-6 rounded-xl mb-8">
                    <p className="text-lg text-foreground/90 font-paragraph leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>
                )}

                <div className="space-y-8">
                  {project.problem && (
                    <div>
                      <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                        The Problem
                      </h2>
                      <div className="text-foreground/80 font-paragraph leading-relaxed whitespace-pre-wrap">
                        {project.problem}
                      </div>
                    </div>
                  )}

                  {project.approach && (
                    <div>
                      <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                        The Approach
                      </h2>
                      <div className="text-foreground/80 font-paragraph leading-relaxed whitespace-pre-wrap">
                        {project.approach}
                      </div>
                    </div>
                  )}

                  {project.insights && (
                    <div>
                      <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                        Key Insights
                      </h2>
                      <div className="text-foreground/80 font-paragraph leading-relaxed whitespace-pre-wrap">
                        {project.insights}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>
      </div>

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
