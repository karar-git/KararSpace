import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Ideas } from '@/entities';
import { format } from 'date-fns';

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Ideas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIdea = async () => {
      try {
        setIsLoading(true);
        const data = await BaseCrudService.getById<Ideas>('ideas', id!);
        setIdea(data);
      } catch (error) {
        console.error('Error loading idea:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadIdea();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content">
            <div className="animate-pulse">
              <div className="h-4 bg-border rounded w-16 mb-12" />
              <div className="h-8 bg-border rounded w-3/4 mb-4" />
              <div className="h-4 bg-border rounded w-1/4 mb-12" />
              <div className="space-y-4">
                <div className="h-4 bg-border rounded w-full" />
                <div className="h-4 bg-border rounded w-full" />
                <div className="h-4 bg-border rounded w-2/3" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content text-center py-20">
            <h1 className="text-2xl font-medium mb-4">Idea not found</h1>
            <Link to="/ideas" className="text-muted hover:text-foreground transition-colors">
              Back to Ideas
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
          <div className="container max-w-content">
            {/* Back link */}
            <Link
              to="/ideas"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12"
            >
              <ArrowLeft size={16} />
              Ideas
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-medium tracking-tighter leading-tight mb-4">
              {idea.title}
            </h1>

            {/* Date */}
            {idea.publishedAt && (
              <p className="text-sm text-muted mb-12 pb-8 border-b border-border">
                {format(new Date(idea.publishedAt), 'MMMM d, yyyy')}
              </p>
            )}

            {/* Content */}
            {idea.content && (
              <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {idea.content}
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
