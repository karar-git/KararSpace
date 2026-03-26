import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
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
      const result = await BaseCrudService.getAll<ResearchPapers>('research', {}, { limit: 12, skip: skipValue });
      if (skipValue === 0) {
        setPapers(result.items);
      } else {
        setPapers(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading research papers:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadPapers();
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
              Research
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              Academic papers and publications.
            </p>
          </div>
        </section>

        {/* Papers */}
        <section className="section">
          <div className="container max-w-content">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse py-8 border-b border-border">
                    <div className="h-6 bg-border rounded w-3/4 mb-3" />
                    <div className="h-4 bg-border rounded w-1/2 mb-2" />
                    <div className="h-4 bg-border rounded w-full mb-2" />
                    <div className="h-3 bg-border rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : papers.length > 0 ? (
              <>
                <div className="divide-y divide-border">
                  {papers.map((paper) => (
                    <Link
                      key={paper._id}
                      to={`/research/${paper._id}`}
                      className="group block py-8 first:pt-0"
                    >
                      <div className="flex items-start justify-between gap-8">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-medium mb-2 group-hover:text-muted transition-colors">
                            {paper.title}
                          </h2>
                          
                          {paper.authors && (
                            <p className="text-sm text-muted mb-2">{paper.authors}</p>
                          )}
                          
                          {paper.journalConference && (
                            <p className="text-sm text-muted mb-3 italic">{paper.journalConference}</p>
                          )}
                          
                          {paper.abstract && (
                            <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-3">
                              {paper.abstract}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted">
                            {paper.publishedAt && (
                              <span>{format(new Date(paper.publishedAt), 'MMM yyyy')}</span>
                            )}
                            {paper.paperUrl && (
                              <span className="flex items-center gap-1">
                                <ArrowUpRight size={14} />
                                View paper
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNext && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <button
                      onClick={() => loadPapers(skip)}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Load more papers
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted">No research papers yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
