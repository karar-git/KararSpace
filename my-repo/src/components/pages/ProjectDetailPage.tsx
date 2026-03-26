import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Projects } from '@/entities';

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-wide">
            <div className="animate-pulse">
              <div className="h-4 bg-border rounded w-20 mb-12" />
              <div className="aspect-[16/9] bg-border rounded-lg mb-12" />
              <div className="max-w-content">
                <div className="h-10 bg-border rounded w-3/4 mb-8" />
                <div className="h-4 bg-border rounded w-full mb-2" />
                <div className="h-4 bg-border rounded w-2/3" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container text-center py-20">
            <h1 className="text-2xl font-medium mb-4">Project not found</h1>
            <Link to="/projects" className="text-muted hover:text-foreground transition-colors">
              Back to Work
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <article className="section">
          <div className="container">
            {/* Back link */}
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12"
            >
              <ArrowLeft size={16} />
              Work
            </Link>

            {/* Hero Image */}
            {project.mainImage && (
              <div className="aspect-[16/9] bg-border rounded-lg overflow-hidden mb-12 -mx-6 md:mx-0">
                <img
                  src={project.mainImage}
                  alt={project.title || ''}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="max-w-content">
              {/* Title & Links */}
              <div className="mb-12">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter leading-tight mb-6">
                  {project.title}
                </h1>
                
                {project.shortDescription && (
                  <p className="text-xl text-muted leading-relaxed mb-8">
                    {project.shortDescription}
                  </p>
                )}

                {/* External Links */}
                <div className="flex flex-wrap gap-4">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-border rounded-lg hover:border-border-hover transition-colors"
                    >
                      View Project
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm px-4 py-2 border border-border rounded-lg hover:border-border-hover transition-colors"
                    >
                      GitHub
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-12 border-t border-border pt-12">
                {project.problem && (
                  <section>
                    <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
                      The Problem
                    </h2>
                    <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {project.problem}
                    </div>
                  </section>
                )}

                {project.approach && (
                  <section>
                    <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
                      Approach
                    </h2>
                    <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {project.approach}
                    </div>
                  </section>
                )}

                {project.insights && (
                  <section>
                    <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
                      Insights
                    </h2>
                    <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {project.insights}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
