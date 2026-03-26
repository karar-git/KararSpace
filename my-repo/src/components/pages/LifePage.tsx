import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { LifeContent } from '@/entities';
import { format } from 'date-fns';

export default function LifePage() {
  const [lifeContent, setLifeContent] = useState<LifeContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  const loadContent = async (skipValue: number = 0) => {
    try {
      const result = await BaseCrudService.getAll<LifeContent>('lifecontent', {}, { limit: 12, skip: skipValue });
      if (skipValue === 0) {
        setLifeContent(result.items);
      } else {
        setLifeContent(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading life content:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadContent();
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
              Life
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              Personal reflections on living deliberately.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="section">
          <div className="container">
            {isLoading ? (
              <div className="divide-y divide-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-8 first:pt-0 animate-pulse">
                    <div className="h-6 bg-border rounded w-2/3 mb-3" />
                    <div className="h-4 bg-border rounded w-full mb-2" />
                    <div className="h-4 bg-border rounded w-3/4 mb-4" />
                    <div className="h-3 bg-border rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : lifeContent.length > 0 ? (
              <>
                <div className="divide-y divide-border">
                  {lifeContent.map((content) => (
                    <Link
                      key={content._id}
                      to={`/life/${content._id}`}
                      className="group block py-8 first:pt-0"
                    >
                      <div className="flex items-start justify-between gap-8">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl md:text-2xl font-medium mb-3 group-hover:text-muted transition-colors">
                            {content.title}
                          </h2>
                          {content.excerpt && (
                            <p className="text-muted leading-relaxed mb-4 line-clamp-2">
                              {content.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted">
                            {content.publishedAt && (
                              <span>{format(new Date(content.publishedAt), 'MMM d, yyyy')}</span>
                            )}
                            {content.readingTime && (
                              <span>{content.readingTime} min read</span>
                            )}
                          </div>
                        </div>
                        <ArrowUpRight 
                          size={24} 
                          className="text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" 
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNext && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <button
                      onClick={() => loadContent(skip)}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted">No content yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
