import { useMemo, useState } from 'react';
import { calculateMatchNrr } from '../lib/cricketMath';

export default function NrrCalculator() {
  const [state, setState] = useState({
    matchFormat: 't20',
    matchOvers: '20.0',
    resultStatus: 'completed',
    teamRuns: 187,
    teamOvers: '20.0',
    teamAllOut: true,
    oppRuns: 111,
    oppOvers: '18.5',
    oppAllOut: true,
    rainAffected: false,
    revisedTeamOvers: '20.0',
    revisedOppOvers: '20.0',
    dlsApplied: false,
    revisedTarget: '',
    parScore: '',
  });

  const [applied, setApplied] = useState(state);
  const [hasCalculated, setHasCalculated] = useState(false);
  const output = useMemo(() => calculateMatchNrr(applied), [applied]);

  const set = (k, v) => setState((prev) => ({ ...prev, [k]: v }));

  const onFormat = (value) => {
    const overs = value === 'odi' ? '50.0' : '20.0';
    setState((prev) => ({ ...prev, matchFormat: value, matchOvers: value === 'custom' ? prev.matchOvers : overs, revisedTeamOvers: overs, revisedOppOvers: overs }));
  };

  return (
    <div className="panel-grid">
      <section className="panel">
        <h2><i className="fa-solid fa-calculator" /> NRR Calculator Inputs</h2>
        <div className="grid three">
          <label><span>Match Format</span><select value={state.matchFormat} onChange={(e) => onFormat(e.target.value)}><option value="t20">T20</option><option value="odi">ODI</option><option value="custom">Custom</option></select></label>
          <label><span>Match Overs</span><input value={state.matchOvers} onChange={(e) => set('matchOvers', e.target.value)} /></label>
          <label><span>Result Type</span><select value={state.resultStatus} onChange={(e) => set('resultStatus', e.target.value)}><option value="completed">Completed</option><option value="tie">Tie</option><option value="abandoned">Abandoned</option><option value="no_result">No Result</option></select></label>
        </div>

        <div className="grid two">
          <div className="card">
            <p>Team A</p>
            <div className="grid three">
              <label><span>Runs Scored</span><input value={state.teamRuns} onChange={(e) => set('teamRuns', Number(e.target.value || 0))} /></label>
              <label><span>Overs Faced</span><input value={state.teamOvers} onChange={(e) => set('teamOvers', e.target.value)} /></label>
              <label className="checkbox"><input type="checkbox" checked={state.teamAllOut} onChange={(e) => set('teamAllOut', e.target.checked)} /> All Out</label>
            </div>
          </div>
          <div className="card">
            <p>Team B</p>
            <div className="grid three">
              <label><span>Runs Scored</span><input value={state.oppRuns} onChange={(e) => set('oppRuns', Number(e.target.value || 0))} /></label>
              <label><span>Overs Faced</span><input value={state.oppOvers} onChange={(e) => set('oppOvers', e.target.value)} /></label>
              <label className="checkbox"><input type="checkbox" checked={state.oppAllOut} onChange={(e) => set('oppAllOut', e.target.checked)} /> All Out</label>
            </div>
          </div>
        </div>

        <div className="card darkish">
          <div className="grid four">
            <label className="checkbox"><input type="checkbox" checked={state.rainAffected} onChange={(e) => set('rainAffected', e.target.checked)} /> Rain Affected</label>
            <label className="checkbox"><input type="checkbox" checked={state.dlsApplied} onChange={(e) => set('dlsApplied', e.target.checked)} /> DLS Applied</label>
            <label><span>Revised Team A Overs</span><input value={state.revisedTeamOvers} disabled={!state.rainAffected} onChange={(e) => set('revisedTeamOvers', e.target.value)} /></label>
            <label><span>Revised Team B Overs</span><input value={state.revisedOppOvers} disabled={!state.rainAffected} onChange={(e) => set('revisedOppOvers', e.target.value)} /></label>
          </div>
          <div className="grid two">
            <label><span>Revised Target (optional)</span><input value={state.revisedTarget} disabled={!state.dlsApplied} onChange={(e) => set('revisedTarget', e.target.value)} /></label>
            <label><span>Par Score (optional)</span><input value={state.parScore} disabled={!state.dlsApplied} onChange={(e) => set('parScore', e.target.value)} /></label>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => { setApplied(state); setHasCalculated(true); }}>Calculate NRR</button>
          <button className="alt" onClick={() => { setApplied(state); setHasCalculated(true); }}>Load Example</button>
        </div>
      </section>

      <section className="panel full">
        <h2><i className="fa-solid fa-chart-column" /> NRR Output</h2>
        {!hasCalculated ? (
          <div className="message">Click <strong>Calculate NRR</strong> to see result.</div>
        ) : (
          <div className="grid two">
            <article className="result-card"><p className="label"><i className="fa-solid fa-users" /> Team A NRR</p><p className="value">{output.teamNrr.toFixed(4)}</p></article>
            <article className="result-card"><p className="label"><i className="fa-solid fa-users-viewfinder" /> Team B NRR</p><p className="value">{output.oppNrr.toFixed(4)}</p></article>
          </div>
        )}
      </section>
    </div>
  );
}
