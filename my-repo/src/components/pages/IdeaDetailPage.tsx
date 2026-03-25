import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Ideas } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto min-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
              </div>
            ) : !idea ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Idea not found</h2>
                <Link to="/ideas" className="text-accent hover:text-accent/80 font-paragraph">
                  Back to Ideas
                </Link>
              </div>
            ) : (
              <article className="animate-reveal">
                <Link
                  to="/ideas"
                  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-paragraph mb-8 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Ideas
                </Link>

                <div className="bg-gradient-to-br from-background to-accent/5 p-8 md:p-12 rounded-2xl shadow-xl">
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                    {idea.title}
                  </h1>

                  {idea.publicationDate && (
                    <div className="flex items-center gap-2 text-foreground/60 font-paragraph text-sm mb-8 pb-6 border-b border-foreground/10">
                      <Calendar size={16} />
                      {format(new Date(idea.publicationDate), 'MMMM d, yyyy')}
                    </div>
                  )}

                  {idea.content && (
                    <div className="prose prose-lg max-w-none">
                      <div className="text-foreground/80 font-paragraph text-lg leading-relaxed whitespace-pre-wrap">
                        {idea.content}
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
