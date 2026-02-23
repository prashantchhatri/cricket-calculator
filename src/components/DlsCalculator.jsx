import { useMemo, useState } from 'react';
import { calculateDlsState } from '../lib/cricketMath';

export default function DlsCalculator() {
  const [form, setForm] = useState({
    originalOvers: '20.0',
    interruptionStage: 'during_chase',
    matchStoppedNow: false,
    firstInningsScore: 133,
    firstInningsWickets: 10,
    firstInningsOvers: '18.0',
    secondInningsScore: 50,
    secondInningsWickets: 1,
    rainHappenedOvers: '5.1',
    weatherDecidedOvers: '15.0',
    revisedOvers: '15.0',
  });

  const [applied, setApplied] = useState(form);
  const [showInfo, setShowInfo] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const result = useMemo(() => calculateDlsState(applied), [applied]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onCalculate = () => {
    const next = { ...form };
    next.revisedOvers = form.matchStoppedNow ? form.rainHappenedOvers : form.weatherDecidedOvers;
    setApplied(next);
    setHasCalculated(true);
  };

  const onReset = () => {
    const reset = {
      originalOvers: '20.0',
      interruptionStage: 'during_chase',
      matchStoppedNow: false,
      firstInningsScore: 133,
      firstInningsWickets: 10,
      firstInningsOvers: '18.0',
      secondInningsScore: 50,
      secondInningsWickets: 1,
      rainHappenedOvers: '5.1',
      weatherDecidedOvers: '15.0',
      revisedOvers: '15.0',
    };
    setForm(reset);
    setApplied(reset);
    setHasCalculated(false);
  };

  return (
    <div className="panel-grid">
      <section className="panel">
        <h2><i className="fa-solid fa-pen-to-square" /> User Inputs</h2>
        <div className="grid two">
          <label><span>Original Match Overs</span><input value={form.originalOvers} onChange={(e) => onChange('originalOvers', e.target.value)} /></label>
          <label><span>Rain Interruption Stage</span>
            <select value={form.interruptionStage} onChange={(e) => onChange('interruptionStage', e.target.value)}>
              <option value="before_chase">Rain before second innings started</option>
              <option value="during_chase">Rain during second innings chase</option>
            </select>
          </label>
        </div>

        <label><span>Has Match Stopped Now?</span>
          <select value={form.matchStoppedNow ? 'yes' : 'no'} onChange={(e) => onChange('matchStoppedNow', e.target.value === 'yes')}>
            <option value="no">No, show projection for specific over</option>
            <option value="yes">Yes, show result directly at rain-stop over</option>
          </select>
        </label>

        <div className="card">
          <p><i className="fa-solid fa-people-group" /> First Innings (Team 1)</p>
          <div className="grid three">
            <label><span>Score</span><input value={form.firstInningsScore} onChange={(e) => onChange('firstInningsScore', Number(e.target.value || 0))} /></label>
            <label><span>Wickets</span><input value={form.firstInningsWickets} onChange={(e) => onChange('firstInningsWickets', Number(e.target.value || 0))} /></label>
            <label><span>Overs Faced</span><input value={form.firstInningsOvers} onChange={(e) => onChange('firstInningsOvers', e.target.value)} /></label>
          </div>
        </div>

        <div className="card">
          <p><i className="fa-solid fa-cloud-showers-heavy" /> Second Innings (Team 2 at Rain Time)</p>
          <div className="grid three">
            <label><span>Current Score</span><input value={form.secondInningsScore} onChange={(e) => onChange('secondInningsScore', Number(e.target.value || 0))} /></label>
            <label><span>Wickets Lost</span><input value={form.secondInningsWickets} onChange={(e) => onChange('secondInningsWickets', Number(e.target.value || 0))} /></label>
            <label><span>Overs at Rain</span><input value={form.rainHappenedOvers} onChange={(e) => onChange('rainHappenedOvers', e.target.value)} /></label>
          </div>
        </div>

        {!form.matchStoppedNow ? (
          <label><span>Weather-Decided Total Overs</span><input value={form.weatherDecidedOvers} onChange={(e) => onChange('weatherDecidedOvers', e.target.value)} /></label>
        ) : (
          <p className="hint">Using rain-stop over automatically: {form.rainHappenedOvers}</p>
        )}

        <div className="actions">
          <button onClick={onCalculate}>Calculate DLS</button>
          <button onClick={onReset} className="alt">Reset</button>
        </div>
      </section>

      <section className="panel">
        <h2><i className="fa-solid fa-trophy" /> DLS Results</h2>
        {!hasCalculated ? (
          <div className="message">Click <strong>Calculate DLS</strong> to see result.</div>
        ) : form.matchStoppedNow ? (
          <article className="result-card"><p className="label"><i className="fa-solid fa-medal" /> Match Result</p><p className="value small">{result.stoppedResult}</p></article>
        ) : (
          <>
            <article className="result-card"><p className="label"><i className="fa-solid fa-bullseye" /> Target Score At {result.effectiveOver} Overs</p><p className="value">{result.targetAtProjection}</p></article>
            <article className="result-card"><p className="label"><i className="fa-solid fa-flag-checkered" /> Runs Needed From Current Score</p><p className="value">{result.runsNeededAtProjection}</p></article>
          </>
        )}

        <p className="note">This app uses a simplified public DLS-style resource model. ICC matches use official licensed DLS-Stern tables, so results may differ.</p>
      </section>

      {hasCalculated && !applied.matchStoppedNow && (
        <section className="panel full">
          <div className="row-between">
            <h2><i className="fa-solid fa-table-list" /> DLS Par Score Projections</h2>
            <span className="info-wrap">
              <button className="icon" onClick={() => setShowInfo(true)}><i className="fa-solid fa-circle-info" /></button>
              <span className="mini-tooltip">Par score = Team 1 score x resource ratio at selected over.</span>
            </span>
          </div>
          <table>
            <thead><tr><th>Over</th><th>Par Score at Over</th></tr></thead>
            <tbody>
              {result.projections.map((row) => (
                <tr key={row.over}><td>{row.over}</td><td>{row.par}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {showInfo && (
        <div className="modal-wrap" onClick={() => setShowInfo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Calculation Details</h3>
            <p>Effective over: {result.effectiveOver}</p>
            <p>Par at over: {result.parAtProjection}</p>
            <p>Target at over: {result.targetAtProjection}</p>
            <p>Runs needed: {result.runsNeededAtProjection}</p>
            <button onClick={() => setShowInfo(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
