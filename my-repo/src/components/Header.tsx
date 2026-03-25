import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, Code2, Award, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Writing', path: '/writing', icon: BookOpen },
    { label: 'Projects', path: '/projects', icon: Code2 },
    { label: 'Certificates', path: '/certificates', icon: Award },
    { label: 'Current Focus', path: '/now', icon: Zap },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 border-b border-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-heading font-bold text-slate-100 hover:text-indigo-400 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">∑</span>
            </div>
            <span className="hidden sm:inline">Portfolio</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 text-slate-300 hover:text-indigo-300 transition-colors font-paragraph hover:scale-110 duration-200 relative group"
              >
                <Icon size={18} />
                {label}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-300 hover:text-indigo-300 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-slate-800/50 pt-4">
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 text-slate-300 hover:text-indigo-300 transition-colors font-paragraph pl-2 py-2 rounded-lg hover:bg-slate-900/50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
