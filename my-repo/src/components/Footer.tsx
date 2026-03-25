import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">∑</span>
              </div>
              <h3 className="font-heading font-bold text-slate-100 text-lg">Portfolio</h3>
            </div>
            <p className="text-slate-400 font-paragraph text-sm leading-relaxed">
              Exploring mathematics, AI, music, and physical excellence. A space for ideas, projects, and continuous growth.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              Main
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/writing" className="text-slate-400 hover:text-indigo-300 transition-colors font-paragraph text-sm hover:translate-x-1 duration-200">
                Writing
              </Link>
              <Link to="/projects" className="text-slate-400 hover:text-indigo-300 transition-colors font-paragraph text-sm hover:translate-x-1 duration-200">
                Projects
              </Link>
              <Link to="/certificates" className="text-slate-400 hover:text-indigo-300 transition-colors font-paragraph text-sm hover:translate-x-1 duration-200">
                Certificates
              </Link>
              <Link to="/now" className="text-slate-400 hover:text-indigo-300 transition-colors font-paragraph text-sm hover:translate-x-1 duration-200">
                Current Focus
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500"></div>
              Explore
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/ideas" className="text-slate-400 hover:text-indigo-300 transition-colors font-paragraph text-sm hover:translate-x-1 duration-200">
                Ideas
              </Link>
              <Link to="/research" className="text-slate-400 hover:text-indigo-300 transition-colors font-paragraph text-sm hover:translate-x-1 duration-200">
                Research
              </Link>
              <Link to="/life" className="text-slate-400 hover:text-indigo-300 transition-colors font-paragraph text-sm hover:translate-x-1 duration-200">
                Life
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-heading font-bold text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-orange-500"></div>
              Connect
            </h4>
            <p className="text-slate-400 font-paragraph text-sm mb-4">
              Interested in collaborating or learning more?
            </p>
            <a
              href="mailto:contact@example.com"
              className="text-indigo-400 hover:text-indigo-300 font-paragraph font-semibold text-sm transition-colors hover:underline"
            >
              Get in touch
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 font-paragraph text-sm">
              © 2026 Portfolio. Crafted with precision and care.
            </p>
            <div className="flex gap-4 text-slate-500 text-xs font-paragraph">
              <span>∑ Mathematics</span>
              <span>⚙ AI</span>
              <span>♪ Music</span>
              <span>◊ Excellence</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
