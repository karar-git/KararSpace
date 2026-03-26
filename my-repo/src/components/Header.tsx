import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Work', path: '/projects' },
    { label: 'Writing', path: '/writing' },
    { label: 'Research', path: '/research' },
    { label: 'Ideas', path: '/ideas' },
    { label: 'Life', path: '/life' },
    { label: 'Certificates', path: '/certificates' },
    { label: 'Now', path: '/now' },
    { label: 'Opportunities', path: '/opportunities' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-lg font-medium tracking-tight hover:opacity-70 transition-opacity"
          >
            Karar Haitham
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm transition-colors ${
                  isActive(path) 
                    ? 'text-foreground' 
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-foreground p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-2 flex flex-col gap-1 border-t border-border pt-4">
            {navItems.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`py-2.5 px-3 -mx-3 rounded-lg text-sm transition-colors ${
                  isActive(path) 
                    ? 'text-foreground bg-border/50' 
                    : 'text-muted hover:text-foreground hover:bg-border/30'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
