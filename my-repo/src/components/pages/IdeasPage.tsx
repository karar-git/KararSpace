import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
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
      setIsLoading(true);
      const result = await BaseCrudService.getAll<Ideas>('ideas', {}, { limit: 12, skip: skipValue });
      if (skipValue === 0) {
        setIdeas(result.items);
      } else {
        setIdeas(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent/5 via-background to-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Ideas
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-paragraph leading-relaxed">
              Short-form thoughts and raw, unfinished thinking from the public notebook. A space for ideas in progress.
            </p>
          </div>
        </div>
      </section>

      {/* Ideas Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="min-h-[600px]">
            {isLoading && ideas.length === 0 ? null : ideas.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ideas.map((idea, index) => (
                    <Link
                      key={idea._id}
                      to={`/ideas/${idea._id}`}
                      className="bg-gradient-to-br from-background to-accent/5 p-6 rounded-xl border border-foreground/10 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-reveal"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <h3 className="text-lg font-heading font-bold text-foreground mb-3 line-clamp-2">
                        {idea.title}
                      </h3>
                      <p className="text-foreground/70 font-paragraph text-sm leading-relaxed mb-4 line-clamp-4">
                        {idea.content}
                      </p>
                      {idea.publicationDate && (
                        <div className="flex items-center gap-2 text-xs text-foreground/60 font-paragraph">
                          <Calendar size={14} />
                          {format(new Date(idea.publicationDate), 'MMM d, yyyy')}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>

                {hasNext && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => loadIdeas(skip)}
                      disabled={isLoading}
                      className="bg-accent text-white px-8 py-3 rounded-lg font-paragraph font-semibold hover:bg-accent/90 hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-foreground/60 font-paragraph py-20">
                No ideas available yet.
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
