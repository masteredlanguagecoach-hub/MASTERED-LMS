import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('student@masteredskill.academy');
  const [password, setPassword] = useState('Student@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide an identifier and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        // Redirect based on current token/session or default
        const token = localStorage.getItem('lms_token');
        // Let AuthContext update and redirect
        navigate('/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credential presets for quick testing
  const selectDemoRole = (role: 'STUDENT' | 'TRAINER' | 'ADMIN') => {
    if (role === 'STUDENT') {
      setIdentifier('student@masteredskill.academy');
      setPassword('Student@123');
    } else if (role === 'TRAINER') {
      setIdentifier('trainer@masteredskill.academy');
      setPassword('Trainer@123');
    } else if (role === 'ADMIN') {
      setIdentifier('admin@masteredskill.academy');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 480 }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 999, alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.8125rem' }}>
            <GraduationCap size={16} color="#60a5fa" />
            <span>Mastered Skill Academy • LMS Portal</span>
          </div>

          <h1 className="login-brand-title">
            Empowering Careers Through Structured Learning.
          </h1>

          <p className="login-tagline" style={{ marginBottom: 32 }}>
            Learn • Grow • Get Placed
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(96, 165, 250, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="#60a5fa" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                Google Sheets Real-Time Database Architecture
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(96, 165, 250, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="#60a5fa" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                PBKDF2 Salted Password Hashing & Strict Role RBAC
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(96, 165, 250, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="#60a5fa" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                Integrated Placement Readiness Engine & Tracking
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 className="login-form-title">Sign In</h2>
          <p className="login-form-subtitle">
            Enter your Admission No, Email, or Mobile to continue.
          </p>

          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-100)',
              color: 'var(--danger-600)',
              fontSize: '0.85rem',
              marginBottom: 20
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">
                Admission No / Email / Mobile
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="e.g. STD000001 or email@domain.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <User
                  size={18}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Role Selectors */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Quick Demo Login:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => selectDemoRole('STUDENT')}
                style={{ fontSize: '0.75rem' }}
              >
                Student
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => selectDemoRole('TRAINER')}
                style={{ fontSize: '0.75rem' }}
              >
                Trainer
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => selectDemoRole('ADMIN')}
                style={{ fontSize: '0.75rem' }}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
