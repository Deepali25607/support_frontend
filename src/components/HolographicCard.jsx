import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import './HolographicCard.css';

export default function HolographicCard({ product, index = 0 }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
    el.style.setProperty('--rx', `${(y - 50) / 8}deg`);
    el.style.setProperty('--ry', `${-(x - 50) / 8}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', `0deg`);
    el.style.setProperty('--ry', `0deg`);
  };

  return (
    <Link
      ref={ref}
      to={`/products/${product.id}`}
      className="holo"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ '--accent': product.accent, '--delay': `${index * 70}ms` }}
    >
      <div className="holo__inner">
        <div className="holo__top">
          <span className="holo__glyph mono">{product.glyph}</span>
          <span className="holo__category mono">{product.category}</span>
        </div>
        <div className="holo__body">
          <h3>{product.name}</h3>
          <p className="holo__tag">{product.tagline}</p>
          <p className="holo__desc">{product.description}</p>
        </div>
        <div className="holo__highlights">
          {product.highlights.slice(0, 3).map((h) => (
            <span key={h}><Sparkles size={11} /> {h}</span>
          ))}
        </div>
        <div className="holo__foot">
          <span className="holo__link">Explore product <ArrowUpRight size={14} /></span>
          <div className="holo__tech">
            {product.tech.slice(0, 3).map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
      </div>
      <span className="holo__shine" aria-hidden="true" />
      <span className="holo__grid" aria-hidden="true" />
    </Link>
  );
}
