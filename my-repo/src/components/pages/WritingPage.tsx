import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, BookOpen, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { Articles, ResearchPapers } from '@/entities';
import { Image } from '@/components/ui/image';
import { format } from 'date-fns';

export default function WritingPage() {
  const [articles, setArticles] = useState<Articles[]>([]);
  const [papers, setPapers] = useState<ResearchPapers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextArticles, setHasNextArticles] = useState(false);
  const [hasNextPapers, setHasNextPapers] = useState(false);
  const [skipArticles, setSkipArticles] = useState(0);
  const [skipPapers, setSkipPapers] = useState(0);

  const loadArticles = async (skipValue: number = 0) => {
    try {
      const result = await BaseCrudService.getAll<Articles>('articles', {}, { limit: 9, skip: skipValue });
      if (skipValue === 0) {
        setArticles(result.items);
      } else {
        setArticles(prev => [...prev, ...result.items]);
      }
      setHasNextArticles(result.hasNext);
      setSkipArticles(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const loadPapers = async (skipValue: number = 0) => {
    try {
      const result = await BaseCrudService.getAll<ResearchPapers>('research', {}, { limit: 9, skip: skipValue });
      if (skipValue === 0) {
        setPapers(result.items);
      } else {
        setPapers(prev => [...prev, ...result.items]);
      }
      setHasNextPapers(result.hasNext);
      setSkipPapers(result.nextSkip || 0);
    } catch (error) {
      console.error('Error loading papers:', error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([loadArticles(), loadPapers()]);
      setIsLoading(false);
    };
    loadAll();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-reveal">
            <div className="inline-flex items-center gap-2 mb-6 bg-blue-500/10 px-4 py-2 rounded-full">
              <BookOpen size={18} className="text-blue-600" />
              <span className="text-sm font-paragraph font-semibold text-blue-600">My Writing</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
              Articles & Papers
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-paragraph leading-relaxed">
              Exploring technology, learning, deep work, and the intersections of innovation and productivity.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <BookOpen size={32} className="text-blue-600" />
              Articles
            </h2>
            <p className="text-foreground/70 font-paragraph">Long-form thoughts and insights</p>
          </div>

          <div className="min-h-[400px]">
            {isLoading && articles.length === 0 ? null : articles.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article, index) => (
                    <Link
                      key={article._id}
                      to={`/writing/${article._id}`}
                      className="bg-background border border-foreground/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-reveal group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {article.featuredImage && (
                        <Image
                          src={article.featuredImage}
                          alt={article.title || 'Article'}
                          width={400}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-heading font-bold text-foreground mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-foreground/70 font-paragraph text-sm leading-relaxed mb-4 line-clamp-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-foreground/60 font-paragraph">
                          {article.publishedDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(new Date(article.publishedDate), 'MMM d, yyyy')}
                            </div>
                          )}
                          {article.readingTimeMinutes && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {article.readingTimeMinutes} min
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasNextArticles && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => loadArticles(skipArticles)}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-paragraph font-semibold hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : 'Load More Articles'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-foreground/60 font-paragraph py-20">
                No articles available yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Papers Section */}
      <section className="py-20 bg-gradient-to-b from-background to-purple-50/30 dark:to-purple-950/10">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <FileText size={32} className="text-purple-600" />
              Scientific Papers
            </h2>
            <p className="text-foreground/70 font-paragraph">Academic research and publications</p>
          </div>

          <div className="min-h-[400px]">
            {isLoading && papers.length === 0 ? null : papers.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {papers.map((paper, index) => (
                    <Link
                      key={paper._id}
                      to={`/research/${paper._id}`}
                      className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-reveal group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <FileText size={24} className="text-purple-600" />
                        {paper.publicationDate && (
                          <span className="text-xs text-foreground/60 font-paragraph">
                            {format(new Date(paper.publicationDate), 'MMM yyyy')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-heading font-bold text-foreground mb-3 line-clamp-3">
                        {paper.title}
                      </h3>
                      {paper.authors && (
                        <p className="text-foreground/70 font-paragraph text-sm mb-3 line-clamp-1">
                          <span className="font-semibold">Authors:</span> {paper.authors}
                        </p>
                      )}
                      {paper.journalConference && (
                        <p className="text-foreground/70 font-paragraph text-sm mb-4 line-clamp-1">
                          <span className="font-semibold">Published in:</span> {paper.journalConference}
                        </p>
                      )}
                      {paper.abstract && (
                        <p className="text-foreground/70 font-paragraph text-sm leading-relaxed line-clamp-2">
                          {paper.abstract}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>

                {hasNextPapers && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => loadPapers(skipPapers)}
                      disabled={isLoading}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg font-paragraph font-semibold hover:bg-purple-700 hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : 'Load More Papers'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-foreground/60 font-paragraph py-20">
                No papers available yet.
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
