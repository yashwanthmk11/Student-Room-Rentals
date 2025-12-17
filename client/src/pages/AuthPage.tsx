import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    campus: '',
    signupRole: 'student' as 'student' | 'owner'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          college: form.college,
          campus: form.campus,
          role: form.signupRole
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed, please try again');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '24px' }}>
      <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        Access verified listings, honest reviews, roommate matches, or publish rooms you own.
      </p>

      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <button
          onClick={() => setMode('login')}
          style={{
            marginRight: 8,
            background: mode === 'login' ? '#333' : '#eee',
            color: mode === 'login' ? '#fff' : '#000',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 4
          }}
        >
          Log in
        </button>
        <button
          onClick={() => setMode('register')}
          style={{
            background: mode === 'register' ? '#333' : '#eee',
            color: mode === 'register' ? '#fff' : '#000',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 4
          }}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        {mode === 'register' && (
          <>
            <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <label>
                <input
                  type="radio"
                  checked={form.signupRole === 'student'}
                  onChange={() => setForm((f) => ({ ...f, signupRole: 'student' }))}
                />{' '}
                I am a student looking for a room
              </label>
              <label>
                <input
                  type="radio"
                  checked={form.signupRole === 'owner'}
                  onChange={() => setForm((f) => ({ ...f, signupRole: 'owner' }))}
                />{' '}
                I am an owner listing rooms
              </label>
            </div>
            <input
              placeholder={form.signupRole === 'owner' ? 'Full name / business name' : 'Full name'}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            {form.signupRole === 'student' ? (
              <>
                <input
                  placeholder="College"
                  value={form.college}
                  onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
                  required
                />
                <input
                  placeholder="Campus (optional)"
                  value={form.campus}
                  onChange={(e) => setForm((f) => ({ ...f, campus: e.target.value }))}
                />
              </>
            ) : (
              <input
                placeholder="Primary city where you rent rooms"
                value={form.college}
                onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
                required
              />
            )}
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        {error && (
          <p style={{ color: 'red', fontSize: 13 }}>
            {error}
          </p>
        )}
        <button type="submit" style={{ marginTop: 4 }}>
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
    </div>
  );
};


