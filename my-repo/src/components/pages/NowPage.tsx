import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { NowFocus } from '@/entities';
import { format } from 'date-fns';

export default function NowPage() {
  const [focusItems, setFocusItems] = useState<NowFocus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
              Now
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              What I'm currently focused on and working toward.
            </p>
          </div>
        </section>

        {/* Focus Items */}
        <section className="section">
          <div className="container max-w-content">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-border rounded w-1/2 mb-3" />
                    <div className="h-4 bg-border rounded w-full mb-2" />
                    <div className="h-4 bg-border rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : focusItems.length > 0 ? (
              <div className="space-y-12">
                {focusItems.map((item) => (
                  <div key={item._id}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xl font-medium">{item.title}</h2>
                      {item.status && (
                        <span className="text-xs px-2 py-1 bg-border rounded-full text-muted">
                          {item.status}
                        </span>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-muted leading-relaxed mb-4 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted">
                      {item.startDate && (
                        <span>Started {format(new Date(item.startDate), 'MMM yyyy')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12">
                <p className="text-muted leading-relaxed">
                  This page is currently being updated. Check back soon to see what I'm working on.
                </p>
              </div>
            )}

            {/* Last updated note */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="text-sm text-muted">
                This page is inspired by <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">nownownow.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
