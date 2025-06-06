import { useState, useEffect, useRef } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { QRCodeSVG } from 'qrcode.react';


export default function Display() {

  const backgroundColor = '#d0d6f2'; // Light blue background
  
  const [questions, setQuestions] = useState([]);
  const [prevOrder, setPrevOrder] = useState([]);
  const [qrLarge, setQrLarge] = useState(false);
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
  }, [questions, prevOrder]);

  // Get the current origin (protocol + host)
  const appUrl = window.location.origin + '/submit';

  return (
    <div style={{ background: backgroundColor, minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif', padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem 2rem 0.5rem 2rem', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: 22, color: '#444', display: 'flex', alignItems: 'center' }}>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: '2rem 2rem 0 2rem', maxWidth: 1400, margin: '0 auto' }}>
        <div onClick={() => setQrLarge(true)} style={{ minWidth: 260, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            
            style={{ cursor: 'pointer' }}
            title="Kliknite pre zväčšenie QR kódu"
          >
            <QRCodeSVG value={appUrl} size={180} />
          </div>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 22, marginBottom: 8 }}>Pripojte sa</div>
          </div>
        </div>
        {qrLarge && (
          <div
            onClick={() => setQrLarge(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: backgroundColor, 
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Kliknite pre zatvorenie"
          >
            <QRCodeSVG value={appUrl} size={Math.min(window.innerWidth, window.innerHeight) * 0.7} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <ul ref={listRef} style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
            {questions.map(q => (
              <li
                key={q.id}
                data-id={q.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 2px 12px #0001',
                  marginBottom: 24,
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  
                  <div>
                    
                    <div style={{ fontSize: 32, color: '#222', fontWeight: 500 }}>{q.text}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#888', fontSize: 22 }}>
                  <span>{q.likes}</span>
                  <span role="img" aria-label="like">👍</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
