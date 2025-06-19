import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch sessions from backend
  useEffect(() => {
    fetch('/sessions')
      .then(res => res.json())
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  // If coming back from moderation, preserve token
  useEffect(() => {
    if (location.state && location.state.token) {
      setAdminToken(location.state.token);
      setTokenSubmitted(true);
      // Clear the token from history so it doesn't persist on further navigation
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

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
        body: JSON.stringify({ sessionName: newName.trim(), token: adminToken })
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

  const handleRemoveSession = async (id) => {
  const session = sessions.find(s => s.id === id);
  if (!window.confirm(`Naozaj chcete vymazať reláciu "${session?.name || ''}"?`)) return;
  setLoading(true);
  setError('');
  try {
    const res = await fetch(`/sessions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken })
    });
    if (!res.ok) throw new Error('Chyba pri mazaní relácie');
    setSessions(sessions => sessions.filter(s => s.id !== id));
  } catch (e) {
    setError('Chyba pri mazaní relácie');
  } finally {
    setLoading(false);
  }
};

  const handleGoToModeration = (id) => {
    navigate(`/moderation?session=${id}`, { state: { token: adminToken } });
  };

  // Admin password form
  if (!tokenSubmitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setError('');
            setLoading(true);
            try {
              const res = await fetch('/authentificate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: adminToken })
              });
              const data = await res.json();
              if (data.success) {
                setTokenSubmitted(true);
              } else {
                setError('Nesprávny moderátorský kľúč');
                setAdminToken('');
              }
            } catch (err) {
              setError('Chyba pripojenia k serveru');
            } finally {
              setLoading(false);
            }
          }}
          style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '2.5rem 2.2rem',
            borderRadius: '18px',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
            minWidth: 340,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1.5px solid #e0e0e0',
          }}
        >
          <div style={{
            background: 'linear-gradient(90deg, #ffb300 60%, #ffcb52 100%)',
            borderRadius: '50%',
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            boxShadow: '0 2px 8px #ffb30044',
          }}>
            <span style={{ fontSize: 32, color: '#23272a', fontWeight: 900 }}>🔑</span>
          </div>
          <h2 style={{ color: '#23272a', marginBottom: 18, fontWeight: 800, letterSpacing: 0.5 }}>Prihlásenie moderátora</h2>
          <input
            type="password"
            value={adminToken}
            onChange={e => setAdminToken(e.target.value)}
            placeholder="Moderátorský kľúč"
            style={{
              width: '100%',
              padding: '0.7rem',
              fontSize: '1.08rem',
              marginBottom: '1.2rem',
              borderRadius: '7px',
              border: '1.5px solid #bdbdbd',
              background: '#f7f7f7',
              color: '#23272a',
              outline: 'none',
              boxShadow: '0 1px 4px #0001',
              transition: 'border 0.2s',
            }}
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.7rem',
              fontSize: '1.08rem',
              borderRadius: '7px',
              background: 'linear-gradient(90deg, #ffb300 60%, #ffcb52 100%)',
              color: '#23272a',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 2px 8px #ffb30033',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 10,
              marginTop: 2,
              letterSpacing: 0.2,
            }}
            disabled={loading}
          >
            Prihlásiť sa
          </button>
          {error && <div style={{ color: '#ff5252', marginTop: 10, fontWeight: 600 }}>{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg,rgb(116, 124, 129) 0%,rgb(156, 149, 149) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 14,
        boxShadow: '0 4px 24px 0 rgba(31,38,135,0.10)',
        padding: '2rem 1.5rem 1.5rem 1.5rem',
        marginTop: 32,
        marginBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #e0e0e0',
      }}>
        <h2 style={{ color: '#23272a', fontWeight: 800, fontSize: '1.6rem', marginBottom: 8, letterSpacing: 0.2 }}>Q&A upece live</h2>

        <button
          onClick={() => setCreating(c => !c)}
          style={{
            background: creating ? '#e0e0e0' : 'linear-gradient(90deg, #bdbdbd 60%, #757575 100%)',
            color: creating ? '#23272a' : '#23272a',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: '0.98rem',
            padding: '0.5rem 1.1rem',
            marginBottom: 18,
            cursor: 'pointer',
            boxShadow: '0 1px 4px #bdbdbd33',
            transition: 'background 0.2s',
          }}  
        >
          {creating ? 'Zrušiť' : 'Vytvoriť novú Q&A session'}
        </button>
        {creating && (
          <div style={{
            width: '100%',
            background: '#f4f4f4',
            borderRadius: 8,
            padding: '1rem 0.8rem',
            marginBottom: 18,
            boxShadow: '0 1px 4px #bdbdbd22',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            border: '1px solid #e0e0e0',
          }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Názov relácie (napr. Seminár A)"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 6,
                border: '1px solid #bdbdbd',
                background: '#fff',
                color: '#23272a',
                fontSize: '0.98rem',
                marginBottom: 10,
                outline: 'none',
                boxShadow: '0 1px 2px #bdbdbd11',
                transition: 'border 0.2s',
              }}
              disabled={loading}
            />
            <button
              onClick={handleCreate}
              style={{
                background: 'linear-gradient(90deg, #bdbdbd 60%, #757575 100%)',
                color: '#23272a',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: '0.98rem',
                padding: '0.5rem 1.1rem',
                cursor: 'pointer',
                boxShadow: '0 1px 4px #bdbdbd33',
                opacity: loading ? 0.7 : 1,
                marginBottom: 2,
              }}
              disabled={loading}
            >
              {loading ? 'Vytváram...' : 'Vytvoriť'}
            </button>
            {error && <div style={{ color: '#ff5252', marginTop: 8, fontWeight: 500 }}>{error}</div>}
          </div>
        )}
        <div style={{ margin: '1.2rem 0 0.7rem', color: '#888', fontWeight: 600, fontSize: '1rem', letterSpacing: 0.1 }}>Existujúce Q&A</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
          {sessions.length === 0 && <li style={{ color: '#bbb', margin: '1.2rem 0', textAlign: 'center', fontWeight: 400 }}>Žiadne relácie</li>}
          {sessions.map(s => (
            <li key={s.id} style={{
              background: 'linear-gradient(90deg, #f4f4f4 60%, #e0e0e0 100%)',
              borderRadius: 8,
              margin: '0.4rem 0',
              padding: '0.7rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px #bdbdbd22',
              border: '1px solid #e0e0e0',
              transition: 'box-shadow 0.2s',
            }}>
              <span style={{ fontWeight: 600, fontSize: '1rem', color: '#23272a', letterSpacing: 0.1 }}>{s.name}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleGoToModeration(s.id)}
                  style={{
                    background: 'linear-gradient(90deg, #bdbdbd 60%, #757575 100%)',
                    color: '#23272a',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    padding: '0.4rem 0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #bdbdbd33',
                    marginLeft: 0,
                  }}
                >
                  Spustiť a Moderovať
                </button>
                <button
                  onClick={() => handleRemoveSession(s.id)}
                  style={{
                    background: '#e57373',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    padding: '0.4rem 0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #e5737333',
                  }}
                  disabled={loading}
                  title="Vymazať reláciu"
                >
                  Vymazať
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
