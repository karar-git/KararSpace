import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ExternalLink } from 'lucide-react';

export default function ExperiencePage() {
  const experiences = [
    {
      title: 'Software Engineering Intern',
      company: 'Computiq / HUB200',
      location: 'Baghdad',
      period: 'Feb 2026 – Present',
      description: [
        'Supporting development and testing of internal software systems',
        'Assisting with feature implementation and workflow organization',
        'Collaborating within structured team delivery processes',
        'Contributing to ongoing production-level projects',
      ],
    },
    {
      title: 'Software Training Program',
      company: 'Computiq / HUB200',
      location: 'Baghdad',
      period: 'Jul 2025 – Aug 2025',
      description: [
        'Completed an intensive on-site program covering Python, algorithms, and software fundamentals',
        'Developed multiple practical projects applying data processing and automation techniques',
        'Gained experience working in a structured, instructor-led environment with code reviews and deadlines',
      ],
    },
  ];

  const competitions = [
    {
      title: 'HUB200 Computiq Hackathon',
      achievement: '1st Place Winner',
      year: '2025',
      link: 'https://www.vibeforming.com/',
      description: 'Built VibeForming - AI-powered form generation and data analysis platform',
    },
    {
      title: 'International Youth Math Challenge (IYMC)',
      achievement: 'Bronze Honour',
      year: '2024',
      description: 'Top 20% of participants in the Final Round',
    },
    {
      title: 'Iraqi Youth Summit',
      achievement: 'Winning Team Member',
      year: '',
    },
    {
      title: 'Innovation Challenge',
      achievement: 'Participant',
      year: '',
      description: 'Ministry of Youth & Sports × UNICEF',
    },
    {
      title: 'CreateApp Championship',
      achievement: 'Participant',
      year: '',
      description: 'Dubai',
    },
    {
      title: 'UNESCO Hackathon',
      achievement: 'Participant',
      year: '',
    },
    {
      title: 'HUB200 Startup Weekend',
      achievement: 'Participant',
      year: '2026',
    },
    {
      title: 'Aswar Hackathon',
      achievement: 'Participant',
      year: '',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="section border-b border-border">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4">
              Experience
            </h1>
            <p className="text-lg text-muted max-w-2xl">
              Professional experience, competitions, and achievements.
            </p>
          </div>
        </section>

        {/* Work Experience */}
        <section className="section">
          <div className="container max-w-content">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-8">
              Work Experience
            </h2>
            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <div key={index} className="border-l-2 border-border pl-6">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                    <h3 className="text-xl font-medium">{exp.title}</h3>
                    <span className="text-sm text-muted">{exp.period}</span>
                  </div>
                  <p className="text-muted mb-4">
                    {exp.company} — {exp.location}
                  </p>
                  <ul className="space-y-2">
                    {exp.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted">
                        <span className="w-1 h-1 rounded-full bg-muted mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Competitions & Awards */}
        <section className="section border-t border-border">
          <div className="container max-w-content">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wider mb-8">
              Competitions & Awards
            </h2>
            <div className="space-y-6">
              {competitions.map((comp, index) => (
                <div 
                  key={index} 
                  className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{comp.title}</h3>
                      {comp.year && (
                        <span className="text-sm text-muted">{comp.year}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      <span className="text-foreground">{comp.achievement}</span>
                      {comp.description && ` — ${comp.description}`}
                    </p>
                  </div>
                  {comp.link && (
                    <a
                      href={comp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-foreground transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
