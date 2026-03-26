import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Certificates } from '@/entities';
import { format } from 'date-fns';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificates[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await BaseCrudService.getAll<Certificates>('certificates', {}, { limit: 50 });
        setCertificates(result.items);
      } catch (error) {
        console.error('Error loading certificates:', error);
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
              Certificates
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              Professional credentials and certifications.
            </p>
          </div>
        </section>

        {/* Certificates List */}
        <section className="section">
          <div className="container max-w-content">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse py-6 border-b border-border">
                    <div className="h-5 bg-border rounded w-2/3 mb-2" />
                    <div className="h-4 bg-border rounded w-1/3 mb-2" />
                    <div className="h-3 bg-border rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : certificates.length > 0 ? (
              <div className="divide-y divide-border">
                {certificates.map((cert) => (
                  <div key={cert._id} className="py-6 first:pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-medium mb-1">
                          {cert.title}
                        </h2>
                        {cert.issuer && (
                          <p className="text-muted mb-2">{cert.issuer}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted">
                          {cert.issueDate && (
                            <span>{format(new Date(cert.issueDate), 'MMM yyyy')}</span>
                          )}
                          {cert.credentialId && (
                            <span className="font-mono text-xs">ID: {cert.credentialId}</span>
                          )}
                        </div>
                      </div>
                      {cert.credentialLink && (
                        <a
                          href={cert.credentialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-foreground transition-colors flex-shrink-0"
                        >
                          <ArrowUpRight size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted">No certificates yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
