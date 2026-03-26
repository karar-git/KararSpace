import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { ResearchPapers } from '@/entities';
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content">
            <div className="animate-pulse">
              <div className="h-4 bg-border rounded w-24 mb-12" />
              <div className="h-8 bg-border rounded w-3/4 mb-4" />
              <div className="h-8 bg-border rounded w-1/2 mb-8" />
              <div className="h-4 bg-border rounded w-1/3 mb-2" />
              <div className="h-4 bg-border rounded w-1/2 mb-12" />
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

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 section">
          <div className="container max-w-content text-center py-20">
            <h1 className="text-2xl font-medium mb-4">Paper not found</h1>
            <Link to="/research" className="text-muted hover:text-foreground transition-colors">
              Back to Research
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
              to="/research"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12"
            >
              <ArrowLeft size={16} />
              Research
            </Link>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-medium tracking-tighter leading-tight mb-6">
              {paper.title}
            </h1>

            {/* Meta */}
            <div className="space-y-2 mb-8 pb-8 border-b border-border">
              {paper.authors && (
                <p className="text-muted">{paper.authors}</p>
              )}
              {paper.journalConference && (
                <p className="text-muted italic">{paper.journalConference}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted pt-2">
                {paper.publishedAt && (
                  <span>{format(new Date(paper.publishedAt), 'MMMM yyyy')}</span>
                )}
                {paper.paperUrl && (
                  <a
                    href={paper.paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    View paper
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Abstract */}
            {paper.abstract && (
              <div>
                <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
                  Abstract
                </h2>
                <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {paper.abstract}
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
