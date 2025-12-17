import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

type Listing = {
  _id: string;
  title: string;
  city: string;
  nearCampus: string;
  roomType: string;
  totalMonthlyCost: number;
  commuteTimeToCampusMinutes?: number;
};

export const SavedPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get<Listing[]>('/listings/saved/me');
        setListings(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
        <h2>Saved rooms</h2>
        <p>Log in to save and revisit your shortlisted rooms.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
      <h2>Your saved rooms</h2>
      {loading && <p>Loading…</p>}
      {!loading && listings.length === 0 && <p>You have not saved any rooms yet.</p>}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {listings.map((l) => (
          <Link
            key={l._id}
            to={`/listing/${l._id}`}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <strong>{l.title}</strong>
              <span>₹{l.totalMonthlyCost}/month</span>
            </div>
            <div style={{ fontSize: 14, color: '#555' }}>
              {l.city} • Near {l.nearCampus} • {l.roomType}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {l.commuteTimeToCampusMinutes
                ? `≈ ${l.commuteTimeToCampusMinutes} min to campus`
                : 'Commute time: not provided'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};


