import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch sessions from backend
  useEffect(() => {
    fetch('/sessions')
      .then(res => res.json())
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setError('Zadajte názov Q&A relácie');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionName: newName.trim() })
      });
      if (!res.ok) throw new Error('Chyba pri vytváraní relácie');
      const session = await res.json();
      setSessions(s => [...s, session]);
      setNewName('');
      setCreating(false);
    } catch (e) {
      setError('Chyba pri vytváraní relácie');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToModeration = (id) => {
    navigate(`/moderation?session=${id}`);
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '4rem auto',
      background: 'rgba(30,32,34,0.97)',
      borderRadius: 12,
      boxShadow: '0 2px 16px #0006',
      padding: '2.5rem 2rem',
      color: '#f5f6fa',
      fontFamily: 'Inter, Arial, sans-serif',
      textAlign: 'center',
    }}>
      <h2 style={{ color: '#ffb300', marginBottom: 24 }}>Q&A relácie</h2>
      <button
        onClick={() => setCreating(c => !c)}
        style={{
          background: 'linear-gradient(90deg, #ffb300 60%, #ffcb52 100%)',
          color: '#23272a',
          border: 'none',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '0.8rem 1.5rem',
          marginBottom: 24,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0004',
        }}
      >
        {creating ? 'Zrušiť' : 'Vytvoriť novú Q&A reláciu'}
      </button>
      {creating && (
        <div style={{ marginBottom: 24 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Názov relácie (napr. Seminár A)"
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: 6,
              border: '1px solid #444',
              background: '#23272a',
              color: '#f5f6fa',
              fontSize: '1.05rem',
              marginBottom: 12,
            }}
            disabled={loading}
          />
          <button
            onClick={handleCreate}
            style={{
              background: '#ffb300',
              color: '#23272a',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: '1.05rem',
              padding: '0.8rem 1.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0004',
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? 'Vytváram...' : 'Vytvoriť'}
          </button>
          {error && <div style={{ color: '#ff5252', marginTop: 10 }}>{error}</div>}
        </div>
      )}
      <div style={{ margin: '2rem 0 1rem', color: '#aaa', fontWeight: 600 }}>Existujúce relácie</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sessions.length === 0 && <li style={{ color: '#888', margin: '1.5rem 0' }}>Žiadne relácie</li>}
        {sessions.map(s => (
          <li key={s.id} style={{
            background: '#23272a',
            borderRadius: 8,
            margin: '0.5rem 0',
            padding: '1rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 6px #0003',
          }}>
            <span style={{ fontWeight: 600, fontSize: '1.08rem', color: '#ffb300' }}>{s.name}</span>
            <button
              onClick={() => handleGoToModeration(s.id)}
              style={{
                background: '#ffb300',
                color: '#23272a',
                border: 'none',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '1.05rem',
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0004',
              }}
            >
              Moderovať
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
