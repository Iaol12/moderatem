import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';

export default function Submit() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');

  // Store the initial order of questions by id
  const [order, setOrder] = useState([]);

  // Always send session_id with every message
  const send = useWebSocket((msg) => {
    if (msg.type === 'approved') {
      setQuestions(msg.data);
      setOrder(msg.data.map(q => q.id));
    }
  }, 'submit', null, sessionId);

  const [sending, setSending] = useState(false);

  const handleSubmit = () => {
    if (text.trim()) {
      setSending(true);
      send('submit-question', { text, session_id: sessionId });
      setText('');
      setTimeout(() => setSending(false), 1500);
    }
  };

  // Track liked questions in local state (by id)
  const [liked, setLiked] = useState({});

  const handleLike = (id) => {
    if (!liked[id]) {
      send('like-question', { id, session_id: sessionId });
      setLiked(l => ({ ...l, [id]: true }));
    } else {
      send('unlike-question', { id, session_id: sessionId });
      setLiked(l => {
        const newLiked = { ...l };
        delete newLiked[id];
        return newLiked;
      });
    }
  };

  // Display questions in the preserved order
  const orderedQuestions = order.map(id => questions.find(q => q.id === id)).filter(Boolean);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        minHeight: '100vh',
        height: '100vh', // ensure full viewport height
        background: 'linear-gradient(135deg, #181a1b 0%, #23272a 100%)',
        fontFamily: 'Inter, Fira Mono, Arial, sans-serif',
        color: '#f5f6fa',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 32px #0008',
        position: 'relative',
        padding: 0,
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden', // prevent double scrollbars
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          color: '#ffb300',
          letterSpacing: 1,
          fontWeight: 700,
          textShadow: '0 2px 8px #0008',
        }}
      >
        Poslať otázku
      </h1>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          flex: 1,
          width: '100%', // stretch to container
          overflowY: 'auto',
          background: 'rgba(30,32,34,0.95)',
          borderRadius: '12px',
          boxShadow: '0 2px 16px #0004',
          border: '1px solid #23272a',
          minHeight: 0,
          boxSizing: 'border-box',
        }}
      >
        {orderedQuestions.map(q => (
          <li
            key={q.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #23272a',
              padding: '1.1rem 1.2rem',
              transition: 'background 0.2s',
              background: 'none',
              fontSize: '1.05rem',
            }}
          >
            <span
              style={{
                flex: 1,
                wordBreak: 'break-word',
                color: '#f5f6fa',
                letterSpacing: 0.2,
                fontSize: '1.13rem',
              }}
            >
              {q.text}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}>
              <button
                onClick={() => handleLike(q.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: liked[q.id] ? '#ffb300' : '#555',
                  transition: 'color 0.2s',
                  marginRight: 6,
                }}
                aria-label={liked[q.id] ? 'Zrušiť hlas' : 'Hlasovať'}
                title={liked[q.id] ? 'Zrušiť hlas' : 'Hlasovať'}
              >
                👍
              </button>
              <span
                style={{
                  minWidth: 28,
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#ffb300',
                  fontSize: '1.2rem',
                  textShadow: '0 1px 4px #0008',
                }}
              >
                {q.likes}
              </span>
            </span>
          </li>
        ))}
        {questions.length === 0 && (
          <li
            style={{
              textAlign: 'center',
              color: '#888',
              padding: '2.5rem',
              fontSize: '1.1rem',
            }}
          >
            Zatiaľ žiadne otázky
          </li>
        )}
      </ul>
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          background: 'rgba(30,32,34,0.95)',
          borderRadius: 10,
          boxShadow: '0 2px 12px #0004',
          padding: '1.1rem 1rem',
          border: '1px solid #23272a',
          zIndex: 10,
          alignSelf: 'center',
          boxSizing: 'border-box',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: '10vh', // 10% of viewport height from bottom
          margin: '0 auto',
        }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value.slice(0, 1000))}
          maxLength={1000}
          placeholder="Vaša otázka..."
          style={{
            flex: 1,
            padding: '0.85rem',
            fontSize: '1.08rem',
            borderRadius: '6px',
            border: '1px solid #444',
            background: '#23272a',
            color: '#f5f6fa',
            outline: 'none',
            boxShadow: '0 1px 4px #0006',
            fontFamily: 'inherit',
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '0.85rem 1.4rem',
            fontSize: '1.08rem',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #ffb300 60%, #ffcb52 100%)',
            color: '#23272a',
            border: 'none',
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: '0 2px 8px #0004',
            cursor: sending ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            minWidth: 100,
            opacity: sending ? 0.7 : 1,
          }}
          disabled={sending || !text.trim()}
        >
          {sending ? 'Odosiela sa...' : 'Odoslať'}
        </button>
      </div>
      {/* Responsive styles for mobile */}
      <style>{`
        html, body {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          width: 100vw;
          overflow-x: hidden;
        }
        @media (max-width: 600px) {
          div[style*='max-width: 520px'] {
            max-width: 100vw !important;
            width: 100vw !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          ul[style*='border-radius: 12px'] {
            border-radius: 8px !important;
            font-size: 0.98rem !important;
            max-height: none !important;
            width: 100vw !important;
          }
          h1 {
            font-size: 1.3rem !important;
            margin-bottom: 1rem !important;
          }
          div[style*='flex-direction: row'][style*='border-radius: 10px'] {
            flex-direction: column !important;
            gap: 0.7rem !important;
            padding: 0.7rem 0.5rem !important;
            border-radius: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            left: 0 !important;
            position: static !important;
            box-sizing: border-box !important;
          }
          input[placeholder='Vaša otázka...'] {
            font-size: 1rem !important;
            padding: 0.7rem !important;
          }
          button {
            font-size: 1rem !important;
            padding: 0.7rem 1rem !important;
            min-width: 80px !important;
          }
        }
      `}</style>
    </div>
  );
}