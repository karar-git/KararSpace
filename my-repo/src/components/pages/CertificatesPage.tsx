import { useEffect, useState } from 'react';
import { ExternalLink, Calendar, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Certificates } from '@/entities';
import { format } from 'date-fns';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);

  const loadCertificates = async (skipValue: number = 0) => {
    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<Certificates>('certificates', {}, { limit: 20, skip: skipValue });
      if (skipValue === 0) {
        setCertificates(result.items);
      } else {
        setCertificates(prev => [...prev, ...result.items]);
      }
      setHasNext(result.hasNext);
      setSkip(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent/5 via-background to-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Certificates
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-paragraph leading-relaxed">
              Professional certifications and credentials earned throughout my academic and professional journey.
            </p>
          </div>
        </div>
      </section>

      {/* Certificates List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto min-h-[600px]">
            {isLoading && certificates.length === 0 ? null : certificates.length > 0 ? (
              <>
                <div className="space-y-4">
                  {certificates.map((cert, index) => (
                    <div
                      key={cert._id}
                      className="bg-gradient-to-br from-background to-accent/5 p-6 md:p-8 rounded-xl border border-foreground/10 shadow-md hover:shadow-lg transition-all duration-300 animate-reveal"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Award className="text-accent" size={24} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                            {cert.title}
                          </h3>
                          
                          {cert.issuer && (
                            <p className="text-foreground/70 font-paragraph mb-2">
                              <span className="font-semibold">Issued by:</span> {cert.issuer}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60 font-paragraph mb-3">
                            {cert.issueDate && (
                              <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                {format(new Date(cert.issueDate), 'MMMM yyyy')}
                              </div>
                            )}
                            {cert.credentialId && (
                              <div>
                                <span className="font-semibold">ID:</span> {cert.credentialId}
                              </div>
                            )}
                          </div>
                          
                          {cert.credentialLink && (
                            <a
                              href={cert.credentialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-paragraph font-semibold transition-colors"
                            >
                              <ExternalLink size={16} />
                              View Credential
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasNext && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => loadCertificates(skip)}
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
                No certificates available yet.
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
