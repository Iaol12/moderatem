import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';

export default function Moderation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [approved, setApproved] = useState([]);
  const [pending, setPending] = useState([]);
  const [token, setToken] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);

  // Wrap send to always include sessionId
  const send = useWebSocket((msg) => {
    if (msg.type === 'moderation') {
      setApproved(msg.data.approved);
      setPending(msg.data.pending);
    }
  }, 'moderation', submitted ? token : null, sessionId);

  // Auto-approve effect
  useEffect(() => {
    if (autoApprove && pending.length > 0) {
      pending.forEach(q => send('approve-question', { id: q.id, session_id: sessionId }));
    }
  }, [autoApprove, pending, sessionId]);

  if (!submitted) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px #ccc', minWidth: 320 }}>
          <h2>Zadajte moderátorský kľúč</h2>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Moderátorský kľúč"
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', background: '#4caf50', color: '#fff', border: 'none' }}>Prihlásiť sa</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'stretch' }}>
      {/* Pending Questions */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
      <div style={{top: '2rem', zIndex: 2 , display:"flex" ,justifyContent: 'space-between',alignItems: 'center',}}>
        <h2>Čakajúce otázky</h2>
          <button
            style={{ fontSize: '0.85rem',  padding: '0.3rem 0.7rem', background: autoApprove ? '#4caf50' : '#eee', color: autoApprove ? '#fff' : '#333', border: '1px solid #888', borderRadius: '4px' }}
            onClick={() => setAutoApprove(a => !a)}
          >
            {autoApprove ? 'Automatické schvaľovanie: Zapnuté' : 'Automatické schvaľovanie: Vypnuté'}
          </button>
        </div>
        
        {pending.map(q => (
          <div key={q.id} style={{ marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '6px', boxShadow: '0 1px 4px #eee', display: 'flex', flexDirection: 'column' }}>
            <span>{q.text}</span>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-start', gap: '0.5rem' }}>
              <button onClick={() => send('approve-question', { id: q.id })} style={{ fontSize: '0.85rem', padding: '0.3rem 0.7rem' }}>Schváliť otázku</button>
              <button onClick={() => send('delete-question', { id: q.id })} style={{ fontSize: '0.85rem', padding: '0.3rem 0.7rem' }}>Vymazať otázku</button>
            </div>
          </div>
        ))}
      </div>
      {/* Divider */}
      <div style={{ width: '2px', background: '#ccc', margin: '0 0.5rem', height: '100%' }} />
      {/* Approved Questions */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#a2e0a6', position: 'relative' }}>
        
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <span>Schválené otázky</span>
          <button
            onClick={() => window.open(`/display?session=${encodeURIComponent(sessionId || '')}`, '_blank')}
            style={{
              display: 'flex', alignItems: 'center', fontSize: '0.85rem', padding: '0.3rem 0.7rem',
              background: '#f5f5f5', color: '#555', border: '1px solid #888', borderRadius: '4px',
              marginLeft: 'auto', cursor: 'pointer', gap: '0.5rem', boxShadow: 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <rect x="2" y="6" width="16" height="7" rx="2" fill="#888"/>
              <rect x="5.5" y="14" width="2" height="2.5" rx="1" fill="#888"/>
              <rect x="12.5" y="14" width="2" height="2.5" rx="1" fill="#888"/>
              <circle cx="16" cy="9.5" r="1.2" fill="#bbb"/>
            </svg>
            Zobraziť náhľad na projektor
          </button>
        </h2>
        {approved.map(q => (
          <div key={q.id} style={{ marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: '6px', boxShadow: '0 1px 4px #eee', display: 'flex', flexDirection: 'column' }}>
            <span>{q.text} <span style={{ color: '#888' }}>({q.likes} likes)</span></span>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button onClick={() => send('delete-question', { id: q.id })} style={{ fontSize: '0.85rem', padding: '0.3rem 0.7rem' }}>Vymazať otázku</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
