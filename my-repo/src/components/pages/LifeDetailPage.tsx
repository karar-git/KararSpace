import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { LifeContent } from '@/entities';
import { format } from 'date-fns';

export default function LifeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<LifeContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const data = await BaseCrudService.getById<LifeContent>('lifecontent', id!);
        setContent(data);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content">
            <div className="animate-pulse">
              <div className="h-4 bg-border rounded w-16 mb-12" />
              <div className="h-10 bg-border rounded w-3/4 mb-4" />
              <div className="h-10 bg-border rounded w-1/2 mb-8" />
              <div className="h-4 bg-border rounded w-32 mb-16" />
              <div className="space-y-4">
                <div className="h-4 bg-border rounded w-full" />
                <div className="h-4 bg-border rounded w-full" />
                <div className="h-4 bg-border rounded w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content text-center py-20">
            <h1 className="text-2xl font-medium mb-4">Content not found</h1>
            <Link to="/life" className="text-muted hover:text-foreground transition-colors">
              Back to Life
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
              to="/life"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12"
            >
              <ArrowLeft size={16} />
              Life
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter leading-tight mb-6">
              {content.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted mb-12 pb-12 border-b border-border">
              {content.publishedAt && (
                <time>{format(new Date(content.publishedAt), 'MMMM d, yyyy')}</time>
              )}
              {content.readingTime && (
                <span>{content.readingTime} min read</span>
              )}
            </div>

            {/* Cover Image */}
            {content.coverImage && (
              <div className="mb-12 -mx-6 md:mx-0">
                <img
                  src={content.coverImage}
                  alt={content.title || ''}
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Excerpt */}
            {content.excerpt && (
              <p className="text-xl text-muted leading-relaxed mb-12">
                {content.excerpt}
              </p>
            )}

            {/* Content */}
            {content.content && (
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {content.content}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
