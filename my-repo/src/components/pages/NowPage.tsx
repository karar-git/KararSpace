import { useEffect, useState } from 'react';
import { Calendar, Activity } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { NowFocus } from '@/entities';
import { format } from 'date-fns';

export default function NowPage() {
  const [focusItems, setFocusItems] = useState<NowFocus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFocusItems = async () => {
      try {
        setIsLoading(true);
        const result = await BaseCrudService.getAll<NowFocus>('nowfocus', {}, { limit: 50 });
        setFocusItems(result.items);
      } catch (error) {
        console.error('Error loading focus items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFocusItems();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              What I&apos;m Doing Now
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-paragraph leading-relaxed">
              Current focus areas and what I&apos;m working on. Updated regularly to reflect my priorities and projects.
            </p>
          </div>
        </div>
      </section>

      {/* Focus Items */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto min-h-[600px]">
            {isLoading ? null : focusItems.length > 0 ? (
              <div className="space-y-6">
                {focusItems.map((item, index) => (
                  <div
                    key={item._id}
                    className="bg-gradient-to-br from-background to-primary/5 p-8 md:p-10 rounded-2xl border border-foreground/10 shadow-lg hover:shadow-xl transition-all duration-300 animate-reveal"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="text-primary" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                          {item.title}
                        </h3>
                        {item.status && (
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-paragraph font-semibold rounded-full">
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-foreground/80 font-paragraph leading-relaxed mb-4 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60 font-paragraph">
                      {item.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Started: {format(new Date(item.startDate), 'MMMM yyyy')}</span>
                        </div>
                      )}
                      {item.lastUpdated && (
                        <div className="flex items-center gap-2">
                          <span>Updated: {format(new Date(item.lastUpdated), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-background to-primary/5 p-12 rounded-2xl shadow-xl max-w-2xl mx-auto">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                    Currently Updating
                  </h2>
                  <p className="text-foreground/70 font-paragraph leading-relaxed">
                    This page is being updated with current focus areas. Check back soon to see what I&apos;m working on.
                  </p>
                </div>
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
