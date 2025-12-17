import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

type Listing = {
  _id: string;
  title: string;
  city: string;
  nearCampus: string;
  roomType: string;
  totalMonthlyCost: number;
  commuteTimeToCampusMinutes?: number;
  verification?: { verifiedByStudent: boolean };
  safety?: { safetyRating?: number; convenienceRating?: number };
};

export const HomePage: React.FC = () => {
  const [city, setCity] = useState('');
  const [campus, setCampus] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [maxCommute, setMaxCommute] = useState('');
  const [roomType, setRoomType] = useState('');
  const [gender, setGender] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    const res = await api.get<Listing[]>('/listings', {
      params: {
        city: city || undefined,
        nearCampus: campus || undefined,
        maxTotalCost: maxCost || undefined,
        maxCommuteMinutes: maxCommute || undefined,
        roomType: roomType || undefined,
        genderPreference: gender || undefined,
        amenities: amenities.length ? amenities.join(',') : undefined,
        sort: sort || undefined
      }
    });
    setListings(res.data);
    setLoading(false);
  }

  useEffect(() => {
    search().catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
      <h1>Student Room Finder</h1>
      <p>Verified rooms, honest reviews, and roommate compatibility around your campus.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '16px',
          marginBottom: '16px'
        }}
      >
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          placeholder="Campus / College"
          value={campus}
          onChange={(e) => setCampus(e.target.value)}
        />
        <input
          placeholder="Max total ₹/month"
          value={maxCost}
          onChange={(e) => setMaxCost(e.target.value)}
        />
        <input
          placeholder="Max commute (mins)"
          value={maxCommute}
          onChange={(e) => setMaxCommute(e.target.value)}
        />
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
          <option value="">Any room type</option>
          <option value="private">Private room</option>
          <option value="shared">Shared room</option>
          <option value="pg">PG</option>
          <option value="hostel">Hostel</option>
        </select>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Any gender</option>
          <option value="male">Male only</option>
          <option value="female">Female only</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort: recommended</option>
          <option value="cost">Lowest total cost</option>
          <option value="commute">Shortest commute</option>
          <option value="safety">Highest safety</option>
        </select>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
          <span style={{ marginBottom: 4 }}>Key amenities</span>
          <label>
            <input
              type="checkbox"
              checked={amenities.includes('wifi')}
              onChange={(e) =>
                setAmenities((prev) =>
                  e.target.checked ? [...prev, 'wifi'] : prev.filter((a) => a !== 'wifi')
                )
              }
            />{' '}
            Wi‑Fi
          </label>
          <label>
            <input
              type="checkbox"
              checked={amenities.includes('laundry')}
              onChange={(e) =>
                setAmenities((prev) =>
                  e.target.checked
                    ? [...prev, 'laundry']
                    : prev.filter((a) => a !== 'laundry')
                )
              }
            />{' '}
            Laundry
          </label>
          <label>
            <input
              type="checkbox"
              checked={amenities.includes('meals')}
              onChange={(e) =>
                setAmenities((prev) =>
                  e.target.checked ? [...prev, 'meals'] : prev.filter((a) => a !== 'meals')
                )
              }
            />{' '}
            Meals included
          </label>
        </div>
        <button onClick={search} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {listings.length === 0 && !loading && <p>No listings yet. Try broadening filters.</p>}

      <div style={{ display: 'grid', gap: '12px' }}>
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
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {l.verification?.verifiedByStudent && (
                <span style={{ marginRight: 8 }}>✅ Student-verified</span>
              )}
              {l.safety?.safetyRating && (
                <span style={{ marginRight: 8 }}>Safety: {l.safety.safetyRating}/5</span>
              )}
              {l.safety?.convenienceRating && (
                <span>Student-friendliness: {l.safety.convenienceRating}/5</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};


