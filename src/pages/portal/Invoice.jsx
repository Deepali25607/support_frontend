import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Download, Check, Zap } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useSiteContent } from '../../context/SiteContentContext.jsx';
import './Invoice.css';

export default function Invoice() {
  const { id } = useParams();
  const { content } = useSiteContent();
  const billingEmail = content['support.billingEmail'];
  const billingPhone = content['support.billingPhone'];
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/api/subscriptions/${id}/invoice`)
      .then(({ data }) => setInvoice(data))
      .catch((err) => { if (err.status === 404 || err.status === 403) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  const print = () => window.print();

  const download = () => {
    if (!invoice) return;
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (notFound) return <Navigate to="/portal/subscriptions" replace />;
  if (loading || !invoice) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}><div className="auth-spinner" /></div>;

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`;
  const date = (iso) => new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="invoice-shell">
      <div className="container invoice-actions">
        <Link to="/portal/subscriptions" className="bp__back"><ArrowLeft size={14} /> Back to subscriptions</Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--ghost" onClick={download}><Download size={14} /> Download (.json)</button>
          <button className="btn btn--primary" onClick={print}><Printer size={14} /> Print / Save PDF</button>
        </div>
      </div>

      <motion.article
        className="invoice glass"
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="invoice__head">
          <div className="invoice__brand">
            <span className="invoice__mark"><Zap size={22} strokeWidth={2.5} /></span>
            <div>
              <strong>NEXUS</strong>
              <span className="mono">/ software.lab</span>
            </div>
          </div>
          <div className="invoice__meta">
            <span className="mono">TAX INVOICE</span>
            <h1>{invoice.number}</h1>
            <span className="mono">Issued {date(invoice.issuedAt)}</span>
          </div>
        </header>

        <section className="invoice__parties">
          <div>
            <span className="mono">FROM</span>
            <strong>{invoice.from.name}</strong>
            <span>{invoice.from.address}</span>
            <span>{invoice.from.email}</span>
            <span className="mono">GSTIN {invoice.from.gstin}</span>
          </div>
          <div>
            <span className="mono">BILL TO</span>
            <strong>{invoice.to?.company || invoice.to?.name || '—'}</strong>
            {invoice.to?.company && invoice.to?.name && <span>Attn: {invoice.to.name}</span>}
            <span>{invoice.to?.email}</span>
          </div>
          <div>
            <span className="mono">DUE</span>
            <strong>{date(invoice.dueAt)}</strong>
            <span className="mono">Period: {invoice.subscription.period}</span>
            <span className="status status--active" style={{ marginTop: '0.4rem', alignSelf: 'flex-start' }}><Check size={12} style={{ marginRight: 4 }} /> Paid</span>
          </div>
        </section>

        <table className="invoice__table">
          <thead>
            <tr><th>Description</th><th style={{ textAlign: 'right' }}>Period</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li, i) => (
              <tr key={i}>
                <td>
                  <strong>{li.description}</strong>
                  <span className="mono">Subscription · {invoice.subscription.id.slice(0, 8)}</span>
                </td>
                <td style={{ textAlign: 'right' }} className="mono">{li.period}</td>
                <td style={{ textAlign: 'right' }} className="mono">{fmt(li.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="invoice__totals">
          <div>
            <span>Subtotal</span>
            <span className="mono">{fmt(invoice.totals.subtotal)}</span>
          </div>
          {invoice.coupon && (
            <div className="invoice__totals-discount">
              <span>Coupon <strong className="mono">{invoice.coupon.code}</strong></span>
              <span className="mono">− {fmt(invoice.totals.discount)}</span>
            </div>
          )}
          <div>
            <span>Taxable amount</span>
            <span className="mono">{fmt(invoice.totals.taxable)}</span>
          </div>
          <div>
            <span>GST ({(invoice.totals.taxRate * 100).toFixed(0)}%)</span>
            <span className="mono">{fmt(invoice.totals.tax)}</span>
          </div>
          <div className="invoice__totals-final">
            <span>Total due</span>
            <span className="mono">{fmt(invoice.totals.total)}</span>
          </div>
        </section>

        <footer className="invoice__foot">
          <div>
            <span className="mono">PAYMENT TERMS</span>
            <p>Auto-renewing subscription billed at the start of each {invoice.subscription.period}. Pause or cancel any time from the customer portal.</p>
          </div>
          <div>
            <span className="mono">SUPPORT</span>
            <p>{billingEmail} · {billingPhone}<br />Reference this invoice number when raising any billing query.</p>
          </div>
        </footer>
      </motion.article>
    </section>
  );
}
