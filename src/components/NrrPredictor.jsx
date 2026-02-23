import { useMemo, useState } from 'react';
import { buildPredictor } from '../lib/cricketMath';

export default function NrrPredictor() {
  const defaults = {
    currentNrr: '-3.8',
    matchesPlayed: '1',
    totalRunsScored: '111',
    totalOversFaced: '18.5',
    totalRunsConceded: '187',
    totalOversBowled: '20.0',
    upcomingMatchFormat: 't20',
    expectedOvers: '20.0',
    targetNrr: '0.0',
    inningsMode: 'batting_first',
    predictedTeamScore: '180',
    predictedOppScore: '150',
  };

  const [form, setForm] = useState(defaults);
  const [applied, setApplied] = useState(defaults);
  const [hasPredicted, setHasPredicted] = useState(false);

  const scenario = useMemo(() => buildPredictor(applied), [applied]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const onPredict = () => {
    setApplied(form);
    setHasPredicted(true);
  };

  const onLoad = () => {
    setForm(defaults);
    setApplied(defaults);
    setHasPredicted(true);
  };

  return (
    <div className="panel-grid">
      <section className="panel">
        <h2><i className="fa-solid fa-crosshairs" /> NRR Target Predictor</h2>
        <div className="grid four">
          <label><span>Current NRR</span><input value={form.currentNrr} onChange={(e) => set('currentNrr', e.target.value)} /></label>
          <label><span>Matches Played</span><input value={form.matchesPlayed} onChange={(e) => set('matchesPlayed', e.target.value)} /></label>
          <label><span>Runs Scored (Total)</span><input value={form.totalRunsScored} onChange={(e) => set('totalRunsScored', e.target.value)} /></label>
          <label><span>Overs Faced (Total)</span><input value={form.totalOversFaced} onChange={(e) => set('totalOversFaced', e.target.value)} /></label>
          <label><span>Runs Conceded (Total)</span><input value={form.totalRunsConceded} onChange={(e) => set('totalRunsConceded', e.target.value)} /></label>
          <label><span>Overs Bowled (Total)</span><input value={form.totalOversBowled} onChange={(e) => set('totalOversBowled', e.target.value)} /></label>
          <label><span>Upcoming Match Format</span><select value={form.upcomingMatchFormat} onChange={(e) => set('upcomingMatchFormat', e.target.value)}><option value="t20">T20</option><option value="odi">ODI</option><option value="custom">Custom</option></select></label>
          <label><span>Expected Overs</span><input value={form.expectedOvers} onChange={(e) => set('expectedOvers', e.target.value)} /></label>
        </div>

        <label><span>Target NRR</span><input value={form.targetNrr} onChange={(e) => set('targetNrr', e.target.value)} /></label>

        <div className="grid two">
          <label><span>Upcoming Innings Choice</span>
            <select value={form.inningsMode} onChange={(e) => set('inningsMode', e.target.value)}>
              <option value="batting_first">Batting First</option>
              <option value="bowling_first">Bowling First</option>
            </select>
          </label>
          {form.inningsMode === 'batting_first' ? (
            <label><span>Predicted Team Score (Batting First)</span><input value={form.predictedTeamScore} onChange={(e) => set('predictedTeamScore', e.target.value)} /></label>
          ) : (
            <label><span>Predicted Opponent Score (Bowling First)</span><input value={form.predictedOppScore} onChange={(e) => set('predictedOppScore', e.target.value)} /></label>
          )}
        </div>

        <div className="actions">
          <button onClick={onPredict}>Predict</button>
          <button className="alt" onClick={onLoad}>Load Example</button>
        </div>
      </section>

      <section className="panel full">
        <h2><i className="fa-solid fa-clipboard-list" /> Scenario Summary</h2>
        {!hasPredicted ? (
          <div className="message">Click <strong>Predict</strong> to see required scenario.</div>
        ) : (
          <>
            <div className="grid two">
              <article className="result-card"><p className="label"><i className="fa-solid fa-wave-square" /> Current NRR</p><p className="value">{Number(applied.currentNrr).toFixed(4)}</p></article>
              <article className="result-card"><p className="label"><i className="fa-solid fa-crosshairs" /> Target NRR</p><p className="value">{Number(applied.targetNrr).toFixed(4)}</p></article>
            </div>

            <div className="card darkish">
              <p>{applied.inningsMode === 'batting_first' ? 'Batting First Scenarios (for required NRR)' : 'Bowling First Scenarios (for required NRR)'}</p>
              <div className="message">{scenario.message}</div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
