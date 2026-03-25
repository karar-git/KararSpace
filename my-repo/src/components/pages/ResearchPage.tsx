import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { ResearchPapers } from '@/entities';
import { format } from 'date-fns';

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPapers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  const loadPapers = async (skipValue: number = 0) => {
    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<ResearchPapers>('research', {}, { limit: 10, skip: skipValue });
      if (skipValue === 0) {
        setPapers(result.items);
      } else {
        setPapers(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading research papers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent/5 via-background to-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Research
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-paragraph leading-relaxed">
              Academic research papers on distributed systems, digital ethics, and computer science theory.
            </p>
          </div>
        </div>
      </section>

      {/* Research Papers List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto min-h-[600px]">
            {isLoading && papers.length === 0 ? null : papers.length > 0 ? (
              <>
                <div className="space-y-6">
                  {papers.map((paper, index) => (
                    <Link
                      key={paper._id}
                      to={`/research/${paper._id}`}
                      className="block bg-gradient-to-br from-background to-accent/5 p-6 md:p-8 rounded-2xl border border-foreground/10 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 animate-reveal"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-3">
                        {paper.title}
                      </h3>
                      
                      {paper.authors && (
                        <p className="text-foreground/70 font-paragraph text-sm mb-2">
                          <span className="font-semibold">Authors:</span> {paper.authors}
                        </p>
                      )}
                      
                      {paper.journalConference && (
                        <p className="text-foreground/70 font-paragraph text-sm mb-3">
                          <span className="font-semibold">Published in:</span> {paper.journalConference}
                        </p>
                      )}
                      
                      {paper.abstract && (
                        <p className="text-foreground/70 font-paragraph text-sm leading-relaxed mb-4 line-clamp-3">
                          {paper.abstract}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-foreground/60 font-paragraph">
                        {paper.publicationDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {format(new Date(paper.publicationDate), 'MMMM yyyy')}
                          </div>
                        )}
                        {paper.paperUrl && (
                          <div className="flex items-center gap-2 text-primary">
                            <ExternalLink size={14} />
                            View Paper
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNext && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => loadPapers(skip)}
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
                No research papers available yet.
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
