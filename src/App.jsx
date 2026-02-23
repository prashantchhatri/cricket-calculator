import { useMemo, useState } from 'react';
import DlsCalculator from './components/DlsCalculator';
import NrrCalculator from './components/NrrCalculator';
import NrrPredictor from './components/NrrPredictor';

function getTabFromPath() {
  const path = window.location.pathname;
  if (path === '/dls') return 'dls';
  if (path === '/nrr') return 'nrr';
  return 'nrr-predictor';
}

export default function App() {
  const [tab, setTab] = useState(getTabFromPath());
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useMemo(() => {
    const path = tab === 'dls' ? '/dls' : tab === 'nrr' ? '/nrr' : '/nrr-predictor';
    window.history.replaceState({}, '', path);
  }, [tab]);

  useMemo(() => {
    document.documentElement.classList.toggle('theme-light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="cricket-theme">
      <div className="bg stadium" />
      <div className="bg overlay" />
      <div className="bg field" />

      <button className="theme-toggle" onClick={() => setDark((v) => !v)} aria-label="Toggle theme">
        <i className={`fa-solid ${dark ? 'fa-moon' : 'fa-sun'}`} />
      </button>

      <div className="container">
        <header className="hero">
          <div className="hero-left">
            <span className="hero-icon"><i className="fa-solid fa-baseball-bat-ball" /></span>
            <div>
              <p className="hero-kicker">Cricket DLS Pro</p>
              <h1>Rain & NRR Calculator Suite</h1>
            </div>
          </div>
        </header>

        <nav className="tabs">
          <button className={tab === 'dls' ? 'active' : ''} onClick={() => setTab('dls')}><i className="fa-solid fa-cloud-rain" /> DLS Calculator</button>
          <button className={tab === 'nrr' ? 'active' : ''} onClick={() => setTab('nrr')}><i className="fa-solid fa-chart-line" /> NRR Calculator</button>
          <button className={tab === 'nrr-predictor' ? 'active' : ''} onClick={() => setTab('nrr-predictor')}><i className="fa-solid fa-bullseye" /> NRR Predictor</button>
        </nav>

        {tab === 'dls' && <DlsCalculator />}
        {tab === 'nrr' && <NrrCalculator />}
        {tab === 'nrr-predictor' && <NrrPredictor />}
      </div>

      <footer>
        This app is created by Prashant Chhatri for fun. It can also be used in local matches for basic calculations to help decide a winner if a match is interrupted by rain or other situations.
      </footer>
    </div>
  );
}
