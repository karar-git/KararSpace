import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { ResearchPapers } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

export default function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<ResearchPapers | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPaper = async () => {
      try {
        setIsLoading(true);
        const data = await BaseCrudService.getById<ResearchPapers>('research', id!);
        setPaper(data);
      } catch (error) {
        console.error('Error loading research paper:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPaper();
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
            ) : !paper ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Research paper not found</h2>
                <Link to="/research" className="text-accent hover:text-accent/80 font-paragraph">
                  Back to Research
                </Link>
              </div>
            ) : (
              <article className="animate-reveal">
                <Link
                  to="/research"
                  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-paragraph mb-8 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Research
                </Link>

                <div className="bg-gradient-to-br from-background to-accent/5 p-8 md:p-12 rounded-2xl shadow-xl">
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                    {paper.title}
                  </h1>

                  <div className="space-y-3 mb-8 pb-8 border-b border-foreground/10">
                    {paper.authors && (
                      <p className="text-foreground/70 font-paragraph">
                        <span className="font-semibold text-foreground">Authors:</span> {paper.authors}
                      </p>
                    )}
                    
                    {paper.journalConference && (
                      <p className="text-foreground/70 font-paragraph">
                        <span className="font-semibold text-foreground">Published in:</span> {paper.journalConference}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-6 text-foreground/60 font-paragraph text-sm">
                      {paper.publicationDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {format(new Date(paper.publicationDate), 'MMMM yyyy')}
                        </div>
                      )}
                      {paper.paperUrl && (
                        <a
                          href={paper.paperUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                        >
                          <ExternalLink size={16} />
                          View Full Paper
                        </a>
                      )}
                    </div>
                  </div>

                  {paper.abstract && (
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                        Abstract
                      </h2>
                      <div className="text-foreground/80 font-paragraph leading-relaxed whitespace-pre-wrap">
                        {paper.abstract}
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
