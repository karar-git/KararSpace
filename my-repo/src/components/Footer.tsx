import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('https://kararspace-production.up.railway.app/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  }

  return (
    <footer className="border-t border-border py-16 mt-auto">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About */}
          <div className="lg:col-span-2">
            <h3 className="font-medium mb-3">Karar Haitham</h3>
            <p className="text-muted text-sm leading-relaxed max-w-md mb-6">
              Building at the intersection of technology and human potential. 
              Exploring mathematics, AI, and the pursuit of excellence.
            </p>

            {/* Newsletter Subscription */}
            <div className="max-w-md">
              <h4 className="text-sm font-medium mb-3">Get notified</h4>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  disabled={status === 'loading'}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-border-hover disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-4 py-2 bg-foreground text-background text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {message && (
                <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {message}
                </p>
              )}
            </div>
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
              <Link to="/experience" className="text-sm text-muted hover:text-foreground transition-colors">
                Experience
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
            href="mailto:me@kararspace.com"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            me@kararspace.com
          </a>
        </div>
      </div>
    </footer>
  );
}
