import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-16 mt-auto">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About */}
          <div className="lg:col-span-2">
            <h3 className="font-medium mb-3">Karar Haitham</h3>
            <p className="text-muted text-sm leading-relaxed max-w-md">
              Building at the intersection of technology and human potential. 
              Exploring mathematics, AI, and the pursuit of excellence.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
              Navigate
            </h4>
            <nav className="flex flex-col gap-2">
              <Link to="/projects" className="text-sm text-muted hover:text-foreground transition-colors">
                Work
              </Link>
              <Link to="/writing" className="text-sm text-muted hover:text-foreground transition-colors">
                Writing
              </Link>
              <Link to="/research" className="text-sm text-muted hover:text-foreground transition-colors">
                Research
              </Link>
              <Link to="/certificates" className="text-sm text-muted hover:text-foreground transition-colors">
                Certificates
              </Link>
            </nav>
          </div>

          {/* More */}
          <div>
            <h4 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
              More
            </h4>
            <nav className="flex flex-col gap-2">
              <Link to="/ideas" className="text-sm text-muted hover:text-foreground transition-colors">
                Ideas
              </Link>
              <Link to="/life" className="text-sm text-muted hover:text-foreground transition-colors">
                Life
              </Link>
              <Link to="/now" className="text-sm text-muted hover:text-foreground transition-colors">
                Now
              </Link>
              <Link to="/opportunities" className="text-sm text-muted hover:text-foreground transition-colors">
                Opportunities
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            © {currentYear} Karar Haitham
          </p>
          <a
            href="mailto:addfgh177@gmail.com"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            addfgh177@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
