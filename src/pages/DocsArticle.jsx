import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, BookOpen, Hash } from 'lucide-react';
import { api } from '../lib/api.js';
import Reveal from '../components/Reveal.jsx';
import './Docs.css';

export default function DocsArticle() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/docs/${slug}`)
      .then(({ data }) => setArticle(data))
      .catch((err) => { if (err.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    api.get('/api/docs').then(({ data }) => {
      setRelated(data.filter((d) => d.id !== article.id && d.product === article.product).slice(0, 4));
    });
  }, [article]);

  if (notFound) return <Navigate to="/docs" replace />;
  if (loading || !article) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}><div className="auth-spinner" /></div>;

  const paragraphs = article.body.split(/\n{2,}/);

  return (
    <article className="docs-article">
      <div className="container docs-article__wrap">
        <aside className="docs-aside glass">
          <Link to="/docs" className="bp__back"><ArrowLeft size={14} /> All docs</Link>
          <h4>{article.productLabel}</h4>
          <span className="mono">{article.section}</span>
          {related.length > 0 && (
            <>
              <div className="docs-aside__divider" />
              <h5>More in {article.productLabel}</h5>
              <ul className="docs-aside__list">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link to={`/docs/${r.slug}`}>
                      <Hash size={11} /> {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <main className="docs-main">
          <Reveal>
            <header className="docs-main__head" style={{ '--accent': article.accent }}>
              <span className="mono docs-main__crumb">{article.productLabel} · {article.section}</span>
              <h1>{article.title}</h1>
              <div className="docs-main__meta">
                <span className="mono"><Clock size={12} /> {article.readingTime} min read</span>
                <span className="mono">Updated {new Date(article.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </header>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="docs-main__body">
              {paragraphs.map((para, i) => {
                const lines = para.split('\n').filter(Boolean);
                if (lines.length > 1 && (/^\d\.\s/.test(lines[0]) || /^—\s/.test(lines[0]))) {
                  const ordered = /^\d\./.test(lines[0]);
                  const ListTag = ordered ? 'ol' : 'ul';
                  return (
                    <ListTag key={i} className="docs-main__list">
                      {lines.map((it, j) => <li key={j}>{it.replace(/^(\d\.\s|—\s)/, '')}</li>)}
                    </ListTag>
                  );
                }
                return <p key={i}>{para}</p>;
              })}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <footer className="docs-main__foot glass">
              <div>
                <span className="eyebrow">// Need help?</span>
                <h3>Didn't find what you needed?</h3>
                <p>Open a support ticket or chat with our team. We respond within 24 hours.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/portal/tickets" className="btn btn--ghost">Open ticket</Link>
                <Link to="/contact" className="btn btn--primary">Contact us <ArrowRight size={14} /></Link>
              </div>
            </footer>
          </Reveal>

          {related.length > 0 && (
            <Reveal>
              <section className="bp__related">
                <h3>Keep reading</h3>
                <div className="bp__related-grid">
                  {related.slice(0, 3).map((r) => (
                    <Link to={`/docs/${r.slug}`} key={r.id} className="bp__related-card glass" style={{ '--accent': r.accent }}>
                      <span className="bp__related-cover" />
                      <div>
                        <span className="mono">{r.section}</span>
                        <h4>{r.title}</h4>
                        <span className="bp__related-cta"><BookOpen size={11} /> Read <ArrowRight size={11} /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          )}
        </main>
      </div>
    </article>
  );
}
