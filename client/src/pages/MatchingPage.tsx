import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

type Match = {
  user: {
    _id: string;
    name: string;
    college: string;
    campus?: string;
    lifestyle?: {
      sleepSchedule?: string;
      studyHabits?: string;
      cleanliness?: string;
      foodPreference?: string;
      introvertExtrovert?: string;
      smoking?: boolean;
      drinking?: boolean;
    };
  };
  score: number;
};

export const MatchingPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get<Match[]>('/matching/roommates');
        setMatches(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!user) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px' }}>
        <h2>Roommate compatibility</h2>
        <p>You need to log in to see compatibility-based roommate suggestions.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px' }}>
      <h2>Roommate compatibility</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        We match students from your college based on lifestyle: sleep, study habits, cleanliness,
        food, and social preferences.
      </p>
      {loading && <p>Loading matches…</p>}
      {!loading && matches.length === 0 && (
        <p>No matches yet. As more students sign up from your college, suggestions will appear.</p>
      )}
      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {matches.map((m) => (
          <div
            key={m.user._id}
            style={{ border: '1px solid #eee', borderRadius: 6, padding: 10, fontSize: 14 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{m.user.name}</strong>
              <span>{Math.round(m.score * 100)}% match</span>
            </div>
            <p style={{ color: '#555' }}>
              {m.user.college}
              {m.user.campus && ` • ${m.user.campus}`}
            </p>
            {m.user.lifestyle && (
              <p style={{ marginTop: 4 }}>
                Sleep: {m.user.lifestyle.sleepSchedule || '—'}, Study:{' '}
                {m.user.lifestyle.studyHabits || '—'}, Cleanliness:{' '}
                {m.user.lifestyle.cleanliness || '—'}, Food:{' '}
                {m.user.lifestyle.foodPreference || '—'}, Social:{' '}
                {m.user.lifestyle.introvertExtrovert || '—'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


