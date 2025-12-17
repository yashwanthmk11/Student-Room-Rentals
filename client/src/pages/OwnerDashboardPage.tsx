import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

type Listing = {
  _id: string;
  title: string;
  city: string;
  nearCampus: string;
  roomType: string;
  isActive: boolean;
  cost?: {
    rent: number;
  };
  media?: { url: string; type: 'image' | 'video' }[];
};

const emptyForm = {
  title: '',
  city: '',
  nearCampus: '',
  roomType: 'private',
  rent: '',
  commuteTimeToCampusMinutes: ''
};

export const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<
    {
      _id: string;
      body: string;
      listing: { _id: string; title: string; city: string; nearCampus: string };
      answers: { _id: string; body: string }[];
    }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get<Listing[]>('/owner/listings');
        setListings(res.data);
        const q = await api.get('/owner/questions');
        setQuestions(q.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function createListing(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/owner/listings', {
        title: form.title,
        city: form.city,
        nearCampus: form.nearCampus,
        roomType: form.roomType,
        cost: { rent: Number(form.rent) || 0 },
        commuteTimeToCampusMinutes: form.commuteTimeToCampusMinutes
          ? Number(form.commuteTimeToCampusMinutes)
          : undefined,
        description: 'Owner added listing',
        address: `${form.city}, near ${form.nearCampus}`
      });
      setListings((ls) => [res.data, ...ls]);
      setForm({ ...emptyForm });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  }

  async function deactivate(id: string) {
    try {
      await api.delete(`/owner/listings/${id}`);
      setListings((ls) => ls.map((l) => (l._id === id ? { ...l, isActive: false } : l)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing');
    }
  }

  async function uploadMedia(id: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    setUploadingId(id);
    setError('');
    try {
      const res = await api.post(`/owner/listings/${id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setListings((ls) => ls.map((l) => (l._id === id ? (res.data as Listing) : l)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploadingId(null);
    }
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        <h2>Owner dashboard</h2>
        <p>You need to log in as an owner to manage listings.</p>
      </div>
    );
  }

  if (user.role !== 'owner' && user.role !== 'admin') {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        <h2>Owner dashboard</h2>
        <p>This area is only for owners. Sign up as an owner account to publish rooms.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
      <h2>Your listings</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        Add rooms or PGs near campus. Students will see verified reviews, Q&amp;A, and true cost.
      </p>

      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <h3>Add new listing</h3>
        <form onSubmit={createListing} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
          <input
            placeholder="Title (e.g. 2‑sharing near XYZ College gate)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
          <input
            placeholder="Nearby campus / landmark"
            value={form.nearCampus}
            onChange={(e) => setForm((f) => ({ ...f, nearCampus: e.target.value }))}
            required
          />
          <select
            value={form.roomType}
            onChange={(e) => setForm((f) => ({ ...f, roomType: e.target.value }))}
          >
            <option value="private">Private room</option>
            <option value="shared">Shared room</option>
            <option value="pg">PG</option>
            <option value="hostel">Hostel</option>
          </select>
          <input
            placeholder="Monthly rent (₹)"
            value={form.rent}
            onChange={(e) => setForm((f) => ({ ...f, rent: e.target.value }))}
            required
          />
          <input
            placeholder="Commute time to campus (mins, optional)"
            value={form.commuteTimeToCampusMinutes}
            onChange={(e) =>
              setForm((f) => ({ ...f, commuteTimeToCampusMinutes: e.target.value }))
            }
          />
          {error && (
            <p style={{ color: 'red', fontSize: 13 }}>
              {error}
            </p>
          )}
          <button type="submit">Publish listing</button>
        </form>
      </section>

      <section>
        <h3>Existing listings</h3>
        {loading && <p>Loading…</p>}
        {!loading && listings.length === 0 && <p>You have not added any listings yet.</p>}
        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          {listings.map((l) => (
            <div
              key={l._id}
              style={{ border: '1px solid #eee', borderRadius: 6, padding: 10, fontSize: 14 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{l.title}</strong>
                  <p style={{ margin: 0, color: '#555' }}>
                    {l.city} • near {l.nearCampus} • {l.roomType}
                  </p>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    Rent: ₹{l.cost?.rent ?? 0} • Status:{' '}
                    {l.isActive ? 'Active (visible to students)' : 'Inactive'}
                  </p>
                  {l.media && l.media.length > 0 && (
                    <p style={{ margin: 0, fontSize: 12 }}>
                      Media uploaded: {l.media.length} file{l.media.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12 }}>
                    <span>Upload photos / videos</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => uploadMedia(l._id, e.target.files)}
                    />
                  </label>
                  {l.isActive && (
                    <button onClick={() => deactivate(l._id)}>Deactivate</button>
                  )}
                  {uploadingId === l._id && <span style={{ fontSize: 11 }}>Uploading…</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h3>Student questions on your rooms</h3>
        {questions.length === 0 && <p>No questions yet.</p>}
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          {questions.map((q) => (
            <div
              key={q._id}
              style={{ border: '1px solid #eee', borderRadius: 6, padding: 8, fontSize: 13 }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>
                {q.listing.title} – {q.listing.city} near {q.listing.nearCampus}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Q:</strong> {q.body}
              </p>
              {q.answers.length === 0 ? (
                <p style={{ margin: 0, color: '#666' }}>No answers yet.</p>
              ) : (
                q.answers.map((a) => (
                  <p key={a._id} style={{ margin: 0 }}>
                    <strong>A:</strong> {a.body}
                  </p>
                ))
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


