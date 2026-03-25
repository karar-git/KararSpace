import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { LifeContent } from '@/entities';
import { Image } from '@/components/ui/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
        console.error('Error loading life content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
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
            ) : !content ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Content not found</h2>
                <Link to="/life" className="text-primary hover:text-primary/80 font-paragraph">
                  Back to Life
                </Link>
              </div>
            ) : (
              <article className="animate-reveal">
                <Link
                  to="/life"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-paragraph mb-8 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Life
                </Link>

                {content.coverImage && (
                  <Image
                    src={content.coverImage}
                    alt={content.title || 'Life content'}
                    width={800}
                    className="w-full h-auto rounded-2xl shadow-2xl mb-8"
                  />
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                  {content.title}
                </h1>

                <div className="flex items-center gap-6 text-foreground/60 font-paragraph text-sm mb-8 pb-8 border-b border-foreground/10">
                  {content.publishDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {format(new Date(content.publishDate), 'MMMM d, yyyy')}
                    </div>
                  )}
                  {content.readingTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {content.readingTime} min read
                    </div>
                  )}
                </div>

                {content.excerpt && (
                  <div className="bg-primary/5 p-6 rounded-xl mb-8">
                    <p className="text-lg text-foreground/90 font-paragraph leading-relaxed italic">
                      {content.excerpt}
                    </p>
                  </div>
                )}

                {content.content && (
                  <div className="prose prose-lg max-w-none">
                    <div className="text-foreground/80 font-paragraph leading-relaxed whitespace-pre-wrap">
                      {content.content}
                    </div>
                  </div>
                )}
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
