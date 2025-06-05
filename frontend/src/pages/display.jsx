import { useState, useEffect, useRef } from 'react';
import useWebSocket from '../hooks/useWebSocket';

export default function Display() {
  const [questions, setQuestions] = useState([]);
  const [prevOrder, setPrevOrder] = useState([]);
  const listRef = useRef();

  useWebSocket((msg) => {
    if (msg.type === 'approved') {
      const sorted = msg.data.sort((a, b) => b.likes - a.likes);
      setPrevOrder(questions.map(q => q.id));
      setQuestions(sorted);
    }
  }, 'display');

  // Animation effect for reordering
  useEffect(() => {
    if (!listRef.current) return;
    const nodes = Array.from(listRef.current.children);
    nodes.forEach((node, idx) => {
      node.style.transition = 'transform 0.5s cubic-bezier(.4,2,.6,1)';
      node.style.transform = 'none';
      const id = Number(node.dataset.id);
      const prevIdx = prevOrder.indexOf(id);
      if (prevIdx !== -1 && prevIdx !== idx) {
        const offset = (prevIdx - idx) * node.offsetHeight;
        node.style.transform = `translateY(${offset}px)`;
        setTimeout(() => {
          node.style.transform = 'none';
        }, 10);
      }
    });
  }, [questions]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', minHeight: '100vh', background: '#181a1b', color: '#fff', fontFamily: 'Fira Mono, monospace' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem', letterSpacing: 2 }}>Otázky z publika</h1>
      <ul ref={listRef} style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
        {questions.map(q => (
          <li
            key={q.id}
            data-id={q.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '2rem',
              background: '#23272a',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              padding: '1.5rem 2rem',
              boxShadow: '0 4px 24px #0002',
              minHeight: 80,
              transition: 'background 0.3s',
            }}
          >
            <span style={{ flex: 1, wordBreak: 'break-word', color: '#fff' }}>{q.text}</span>
            <span style={{ display: 'flex', alignItems: 'center', marginLeft: '2rem', fontWeight: 700 }}>
              <span style={{ fontSize: '2.2rem', color: '#ffb300', marginRight: '0.5rem' }}>👍</span>
              <span style={{ fontSize: '2.2rem', color: '#ffb300', minWidth: 40, textAlign: 'center' }}>{q.likes}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
