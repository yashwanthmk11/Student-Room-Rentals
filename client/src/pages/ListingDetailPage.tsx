import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

type Listing = {
  _id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  nearCampus: string;
  roomType: string;
  amenities?: string[];
  cost?: {
    rent: number;
    utilities?: number;
    internet?: number;
    maintenance?: number;
    other?: number;
  };
  commuteTimeToCampusMinutes?: number;
  verification?: { verifiedByStudent: boolean; notes?: string };
  safety?: { safetyRating?: number; convenienceRating?: number; noiseLevel?: number };
  media?: { url: string; type: 'image' | 'video' }[];
  createdBy?: { name: string; college: string };
};

type Review = {
  _id: string;
  rating: number;
  title?: string;
  body?: string;
  wouldRecommend?: boolean;
  author?: { name: string; college: string };
};

type Question = {
  _id: string;
  body: string;
  isAnonymous: boolean;
  answers: {
    _id: string;
    body: string;
    isCurrentTenant: boolean;
    author?: { name: string; college: string };
  }[];
};

type ListingResponse = {
  listing: Listing;
  reviews: Review[];
  questions: Question[];
};

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<ListingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [review, setReview] = useState({ rating: 5, body: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    const res = await api.get<ListingResponse>(`/listings/${id}`);
    setData(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submitQuestion() {
    if (!id || !questionText.trim()) return;
    await api.post(`/listings/${id}/questions`, { body: questionText, isAnonymous: true });
    setQuestionText('');
    load();
  }

  async function submitReview() {
    if (!id || !review.body.trim()) return;
    await api.post(`/listings/${id}/reviews`, {
      rating: review.rating,
      body: review.body
    });
    setReview({ rating: 5, body: '' });
    load();
  }

  async function toggleSave() {
    if (!user || !id) return;
    setSaving(true);
    try {
      if (saved) {
        await api.delete(`/listings/${id}/save`);
        setSaved(false);
      } else {
        await api.post(`/listings/${id}/save`);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
        <p>Loading listing…</p>
      </div>
    );
  }

  const { listing, reviews, questions } = data;
  const c = listing.cost || {};
  const totalCost =
    (c.rent || 0) +
    (c.utilities || 0) +
    (c.internet || 0) +
    (c.maintenance || 0) +
    (c.other || 0);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{listing.title}</h2>
        {user && (
          <button onClick={toggleSave} disabled={saving}>
            {saved ? 'Saved' : 'Save room'}
          </button>
        )}
      </div>
      <p style={{ color: '#555' }}>
        {listing.address}, {listing.city} • Near {listing.nearCampus} • {listing.roomType}
      </p>

      <section style={{ marginTop: 16 }}>
        <h3>Reality check</h3>
        <p style={{ fontSize: 14, color: '#555' }}>
          Short videos and real photos uploaded by students.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {listing.media && listing.media.length > 0 ? (
            listing.media.map((m, idx) =>
              m.type === 'image' ? (
                <img
                  key={idx}
                  src={m.url}
                  alt=""
                  style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 6 }}
                />
              ) : (
                <video
                  key={idx}
                  src={m.url}
                  controls
                  style={{ width: 200, borderRadius: 6 }}
                />
              )
            )
          ) : (
            <p>No student media yet. Ask a question to prompt current tenants.</p>
          )}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>True cost per month</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 14 }}>
          <span>Rent: ₹{c.rent || 0}</span>
          <span>Utilities: ₹{c.utilities || 0}</span>
          <span>Internet: ₹{c.internet || 0}</span>
          <span>Maintenance: ₹{c.maintenance || 0}</span>
          <span>Other: ₹{c.other || 0}</span>
        </div>
        <p style={{ marginTop: 4 }}>
          <strong>Total: ₹{totalCost} / month</strong>
        </p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Safety & student-friendliness</h3>
        <p style={{ fontSize: 14 }}>
          Safety: {listing.safety?.safetyRating ?? 'N/A'}/5 • Student-friendliness:{' '}
          {listing.safety?.convenienceRating ?? 'N/A'}/5 • Noise:{' '}
          {listing.safety?.noiseLevel ?? 'N/A'}/5
        </p>
        <p style={{ fontSize: 14 }}>
          Commute to campus: ~{listing.commuteTimeToCampusMinutes ?? 'N/A'} minutes
        </p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Description</h3>
        <p>{listing.description}</p>
        {listing.amenities && listing.amenities.length > 0 && (
          <p style={{ fontSize: 14 }}>Amenities: {listing.amenities.join(', ')}</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Student reviews</h3>
        {reviews.length === 0 && <p>No reviews yet. Be the first to review after you stay.</p>}
        {reviews.map((r) => (
          <div
            key={r._id}
            style={{ border: '1px solid #eee', borderRadius: 6, padding: 8, marginBottom: 8 }}
          >
            <strong>{r.rating}/5</strong> {r.title && `• ${r.title}`}
            <p style={{ marginTop: 4 }}>{r.body}</p>
            <p style={{ fontSize: 12, color: '#666' }}>
              {r.author ? `${r.author.name}, ${r.author.college}` : 'Former tenant'}
              {r.wouldRecommend === false && ' • Would not recommend'}
            </p>
          </div>
        ))}

        {user && (
          <div style={{ marginTop: 12 }}>
            <h4>Add your review</h4>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <label>
                Rating:{' '}
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={review.rating}
                  onChange={(e) => setReview((r) => ({ ...r, rating: Number(e.target.value) }))}
                />
              </label>
            </div>
            <textarea
              rows={3}
              style={{ width: '100%' }}
              placeholder="Share what it was actually like to stay here…"
              value={review.body}
              onChange={(e) => setReview((r) => ({ ...r, body: e.target.value }))}
            />
            <button style={{ marginTop: 4 }} onClick={submitReview}>
              Submit review
            </button>
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Anonymous tenant Q&amp;A</h3>
        {questions.length === 0 && <p>No questions yet. Ask what you care about most.</p>}
        {questions.map((q) => (
          <div
            key={q._id}
            style={{ border: '1px solid #eee', borderRadius: 6, padding: 8, marginBottom: 8 }}
          >
            <p>
              <strong>Q:</strong> {q.body}
            </p>
            {q.answers.length === 0 && <p style={{ fontSize: 13 }}>No answers yet.</p>}
            {q.answers.map((a) => (
              <p key={a._id} style={{ fontSize: 13, marginTop: 4 }}>
                <strong>A:</strong> {a.body}{' '}
                {a.isCurrentTenant && <span style={{ color: '#2a7' }}>(current tenant)</span>}
                {a.author && ` — ${a.author.name}`}
              </p>
            ))}
          </div>
        ))}

        {user && (
          <div style={{ marginTop: 12 }}>
            <h4>Ask a private question</h4>
            <textarea
              rows={2}
              style={{ width: '100%' }}
              placeholder="E.g. How strict is the landlord? Is Wi‑Fi stable during exams?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            <button style={{ marginTop: 4 }} onClick={submitQuestion}>
              Ask anonymously
            </button>
          </div>
        )}
      </section>
    </div>
  );
};


