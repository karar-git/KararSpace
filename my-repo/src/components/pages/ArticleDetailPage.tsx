import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Articles } from '@/entities';
import { format } from 'date-fns';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Articles | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setIsLoading(true);
        const data = await BaseCrudService.getById<Articles>('articles', id!);
        setArticle(data);
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content">
            <div className="animate-pulse">
              <div className="h-4 bg-border rounded w-24 mb-12" />
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

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content text-center py-20">
            <h1 className="text-2xl font-medium mb-4">Article not found</h1>
            <Link to="/writing" className="text-muted hover:text-foreground transition-colors">
              Back to Writing
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
              to="/writing"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12"
            >
              <ArrowLeft size={16} />
              Writing
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter leading-tight mb-6">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted mb-12 pb-12 border-b border-border">
              {article.publishedAt && (
                <time>{format(new Date(article.publishedAt), 'MMMM d, yyyy')}</time>
              )}
              {article.readingTimeMinutes && (
                <span>{article.readingTimeMinutes} min read</span>
              )}
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="mb-12 -mx-6 md:mx-0">
                <img
                  src={article.featuredImage}
                  alt={article.title || ''}
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Summary */}
            {article.summary && (
              <p className="text-xl text-muted leading-relaxed mb-12">
                {article.summary}
              </p>
            )}

            {/* Content */}
            {article.content && (
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {article.content}
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
