import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';

interface Opportunity {
  _id: string;
  title: string;
  description?: string;
  link?: string;
  type?: string;
  deadline?: string;
  createdAt?: string;
}

const featuredGuide = {
  title: 'Huawei certifications in Iraq: free vouchers for students',
  description:
    'A practical guide for checking whether your university has Huawei ICT Academy or instructor access, how to ask for an exam voucher, and what to prepare before registration.',
  type: 'Guide',
  href: '/huawei-free-certifications-iraq',
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const result = await BaseCrudService.getAll<Opportunity>('opportunities', {}, { limit: 50 });
        setOpportunities(result.items);
      } catch (error) {
        console.error('Error loading opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="section border-b border-border">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4">
              Opportunities
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              A curated collection of opportunities I've come across — internships, scholarships, 
              competitions, and programs that might be valuable for students and developers.
            </p>
          </div>
        </section>

        {/* Opportunities List */}
        <section className="section">
          <div className="container">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse p-6 border border-border rounded-lg">
                    <div className="h-5 bg-border rounded w-2/3 mb-3" />
                    <div className="h-4 bg-border rounded w-full mb-2" />
                    <div className="h-4 bg-border rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : opportunities.length > 0 ? (
              <div className="space-y-6">
                <Link
                  to={featuredGuide.href}
                  className="group block p-6 border border-border rounded-lg hover:border-border-hover transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-lg font-medium group-hover:text-muted transition-colors">
                          {featuredGuide.title}
                        </h2>
                        <span className="px-2 py-0.5 bg-border/50 rounded text-xs text-muted">
                          {featuredGuide.type}
                        </span>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {featuredGuide.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="text-muted group-hover:text-foreground transition-colors flex-shrink-0 mt-1"
                    />
                  </div>
                </Link>
                {opportunities.map((opp) => (
                  <div
                    key={opp._id}
                    className="p-6 border border-border rounded-lg hover:border-border-hover transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-lg font-medium">{opp.title}</h2>
                          {opp.type && (
                            <span className="px-2 py-0.5 bg-border/50 rounded text-xs text-muted">
                              {opp.type}
                            </span>
                          )}
                        </div>
                        {opp.description && (
                          <p className="text-muted text-sm leading-relaxed mb-3">
                            {opp.description}
                          </p>
                        )}
                        {opp.deadline && (
                          <p className="text-sm text-muted">
                            Deadline: {new Date(opp.deadline).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                      {opp.link && (
                        <a
                          href={opp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 text-muted hover:text-foreground transition-colors"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <Link
                  to={featuredGuide.href}
                  className="group block p-6 border border-border rounded-lg hover:border-border-hover transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-lg font-medium group-hover:text-muted transition-colors">
                          {featuredGuide.title}
                        </h2>
                        <span className="px-2 py-0.5 bg-border/50 rounded text-xs text-muted">
                          {featuredGuide.type}
                        </span>
                      </div>
                      <p className="text-muted text-sm leading-relaxed">
                        {featuredGuide.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="text-muted group-hover:text-foreground transition-colors flex-shrink-0 mt-1"
                    />
                  </div>
                </Link>

                <div className="py-16 text-center">
                  <p className="text-muted mb-2">More opportunities coming soon.</p>
                  <p className="text-sm text-muted">
                    I'll keep adding useful programs as I find them.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Contact */}
        <section className="section border-t border-border">
          <div className="container max-w-content">
            <div className="text-center">
              <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
                Know of an opportunity?
              </h2>
              <p className="text-muted mb-6">
                If you know of an opportunity that should be shared here, let me know.
              </p>
              <a
                href="mailto:me@kararspace.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
              >
                Send me an email
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
