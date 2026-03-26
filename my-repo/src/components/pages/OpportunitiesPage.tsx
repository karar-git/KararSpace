import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OpportunitiesPage() {
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
              I'm open to meaningful collaborations, interesting projects, and opportunities 
              that align with my interests in technology, mathematics, and building impactful solutions.
            </p>
          </div>
        </section>

        {/* What I'm Looking For */}
        <section className="section">
          <div className="container max-w-content">
            <div className="space-y-16">
              {/* Open To */}
              <div>
                <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-6">
                  Open to
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Full-time roles</h3>
                      <p className="text-muted">
                        Software engineering, AI/ML, or research positions at companies 
                        working on meaningful problems.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Consulting & freelance</h3>
                      <p className="text-muted">
                        Technical consulting, system design, or specialized development work.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Research collaborations</h3>
                      <p className="text-muted">
                        Academic or industry research in areas I'm passionate about.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Speaking & writing</h3>
                      <p className="text-muted">
                        Technical talks, guest posts, or educational content creation.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Interests */}
              <div>
                <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-6">
                  Areas of interest
                </h2>
                <div className="flex flex-wrap gap-3">
                  {[
                    'Artificial Intelligence',
                    'Machine Learning',
                    'Mathematics',
                    'Distributed Systems',
                    'Developer Tools',
                    'Education Technology',
                    'Open Source',
                    'Research',
                  ].map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1.5 bg-border/50 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="pt-8 border-t border-border">
                <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-6">
                  Get in touch
                </h2>
                <p className="text-muted mb-6">
                  If you have an opportunity that might be a good fit, I'd love to hear from you.
                </p>
                <a
                  href="mailto:addfgh177@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                >
                  Send me an email
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
