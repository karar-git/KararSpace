import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Ideas } from '@/entities';
import { format } from 'date-fns';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Ideas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  const loadIdeas = async (skipValue: number = 0) => {
    try {
      const result = await BaseCrudService.getAll<Ideas>('ideas', {}, { limit: 20, skip: skipValue });
      if (skipValue === 0) {
        setIdeas(result.items);
      } else {
        setIdeas(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadIdeas();
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
              Ideas
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              Quick thoughts, notes, and ideas in progress.
            </p>
          </div>
        </section>

        {/* Ideas */}
        <section className="section">
          <div className="container">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse p-6 border border-border rounded-lg">
                    <div className="h-5 bg-border rounded w-3/4 mb-3" />
                    <div className="h-4 bg-border rounded w-full mb-2" />
                    <div className="h-4 bg-border rounded w-2/3 mb-4" />
                    <div className="h-3 bg-border rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : ideas.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ideas.map((idea) => (
                    <Link
                      key={idea._id}
                      to={`/ideas/${idea._id}`}
                      className="group p-6 border border-border rounded-lg hover:border-border-hover transition-colors"
                    >
                      <h2 className="font-medium mb-2 group-hover:text-muted transition-colors line-clamp-2">
                        {idea.title}
                      </h2>
                      {idea.content && (
                        <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">
                          {idea.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted">
                        {idea.publishedAt && (
                          <span>{format(new Date(idea.publishedAt), 'MMM d, yyyy')}</span>
                        )}
                        <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNext && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => loadIdeas(skip)}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Load more ideas
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted">No ideas yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
