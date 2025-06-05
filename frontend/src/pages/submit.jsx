import { useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';

export default function Submit() {
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState('');

  // Store the initial order of questions by id
  const [order, setOrder] = useState([]);

  const send = useWebSocket((msg) => {
    if (msg.type === 'approved') {
      setQuestions(msg.data);
      // If order is empty or a new question is present, update order
      setOrder(prevOrder => {
        const newIds = msg.data.map(q => q.id);
        // If a new question is present (not in prevOrder), add it to the end
        if (prevOrder.length === 0 || newIds.some(id => !prevOrder.includes(id))) {
          // Keep existing order, append any new ids
          return [...prevOrder, ...newIds.filter(id => !prevOrder.includes(id))];
        }
        // If a question was deleted, remove it from order
        return prevOrder.filter(id => newIds.includes(id));
      });
    }
  }, 'submit');

  const handleSubmit = () => {
    if (text.trim()) send('submit-question', { text });
    setText('');
  };

  // Track liked questions in local state (by id)
  const [liked, setLiked] = useState({});

  const handleLike = (id) => {
    if (!liked[id]) {
      send('like-question', { id });
      setLiked(l => ({ ...l, [id]: true }));
    }
  };

  // Display questions in the preserved order
  const orderedQuestions = order.map(id => questions.find(q => q.id === id)).filter(Boolean);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem', minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Fira Mono, monospace', color: '#23272a', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem', color: '#23272a' }}>Poslať otázku</h1>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, maxHeight: '60vh', overflowY: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px #ddd' }}>
        {orderedQuestions.map(q => (
          <li key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '1rem' }}>
            <span style={{ flex: 1, fontSize: '1.05rem', wordBreak: 'break-word', color: '#23272a' }}>{q.text}</span>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => handleLike(q.id)}
                disabled={!!liked[q.id]}
                style={{ background: 'none', border: 'none',padding:"0", fontSize: '1.3rem', cursor: liked[q.id] ? 'not-allowed' : 'pointer', color: liked[q.id] ? '#bbb' : '#ffb300',  transition: 'color 0.2s' }}
                aria-label="Upvote"
                title={liked[q.id] ? 'Už ste hlasovali' : 'Hlasovať'}
              >👍</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#ffb300' }}>{q.likes}</span>
            </span>
          </li>
        ))}
        {questions.length === 0 && (
          <li style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Zatiaľ žiadne otázky</li>
        )}
      </ul>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Vaša otázka..."
          style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #bbb', background: '#fff', color: '#23272a' }}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
        />
        <button
          onClick={handleSubmit}
          style={{ padding: '0.75rem 1.2rem', fontSize: '1rem', borderRadius: '6px', background: '#4caf50', color: '#fff', border: 'none', fontWeight: 600 }}
        >Odoslať</button>
      </div>
    </div>
  );
}
