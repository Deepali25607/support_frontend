import { useState } from 'react';
import { Save, Check, User as UserIcon, Building2, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Reveal from '../../components/Reveal.jsx';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', company: user?.company || '', phone: user?.phone || '' });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Profile</span>
          <h1>Your <span className="gradient-text">profile</span></h1>
          <p>Keep your contact details up to date so we can reach you about renewals, tickets and product updates.</p>
        </header>
      </Reveal>

      <Reveal delay={0.08}>
        <form className="glass profile-form" onSubmit={submit}>
          <div className="profile-form__row">
            <div>
              <label>Full name</label>
              <div className="auth-field"><UserIcon size={16} /><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            </div>
            <div>
              <label>Email (sign-in)</label>
              <div className="auth-field"><Mail size={16} /><input value={user?.email} disabled /></div>
            </div>
          </div>
          <div className="profile-form__row">
            <div>
              <label>Company</label>
              <div className="auth-field"><Building2 size={16} /><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            </div>
            <div>
              <label>Phone</label>
              <div className="auth-field"><Phone size={16} /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 90000 00000" /></div>
            </div>
          </div>
          <div className="profile-form__foot">
            <span className="mono">Account role: <strong>{user?.role}</strong> · Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
            <button className="btn btn--primary btn--lg" disabled={busy}>
              {saved ? <><Check size={16} /> Saved</> : busy ? 'Saving…' : <><Save size={16} /> Save changes</>}
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}
