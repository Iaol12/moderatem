import logo from './logo.svg';
import './App.css';
import SubmitPage from './pages/submit';
import ModerationPage from './pages/moderation';
import DisplayPage from './pages/display';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import SessionsPage from './pages/sessions';


function App() {
  // Get the current origin (protocol + host)
  const appUrl = window.location.origin + '/submit';
  return (
    <Router>
      <Routes>
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/moderation" element={<ModerationPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route
          path="*"
          element={<SessionsPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
