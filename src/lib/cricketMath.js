export const WICKET_RESOURCE_FACTORS = [1.0, 0.95, 0.9, 0.84, 0.77, 0.69, 0.6, 0.5, 0.39, 0.27, 0.0];

export function oversToBalls(overs) {
  const value = String(overs ?? '').trim();
  if (!/^\d+(\.\d+)?$/.test(value)) return 0;
  const [full, ballsPart = '0'] = value.split('.');
  const completed = Math.max(0, Number.parseInt(full, 10));
  const balls = Math.min(5, Math.max(0, Number.parseInt(ballsPart[0] ?? '0', 10) || 0));
  return completed * 6 + balls;
}

export function ballsToOvers(balls) {
  const safe = Math.max(0, Number(balls) || 0);
  return `${Math.floor(safe / 6)}.${safe % 6}`;
}

export function ballsToOversFloat(balls) {
  return Number(ballsToOvers(balls));
}

export function resourceRemainingPercent(remainingBalls, originalBalls, wicketsLost) {
  if (originalBalls <= 0) return 0;
  const oversFactor = Math.min(1, Math.max(0, remainingBalls / originalBalls));
  const wickets = Math.min(10, Math.max(0, Number(wicketsLost) || 0));
  const wicketFactor = WICKET_RESOURCE_FACTORS[wickets] ?? 0;
  return Number((oversFactor * wicketFactor * 100).toFixed(2));
}

export function calculateDlsState(input) {
  const originalBalls = oversToBalls(input.originalOvers);
  const revisedBalls = Math.min(originalBalls, oversToBalls(input.revisedOvers));
  const firstDone = Math.min(originalBalls, oversToBalls(input.firstInningsOvers));
  const firstRemaining = Math.max(0, originalBalls - firstDone);
  const firstRemPct = resourceRemainingPercent(firstRemaining, originalBalls, input.firstInningsWickets);
  const team1Used = Math.max(0, Number((100 - firstRemPct).toFixed(2)));

  const team2Start = originalBalls > 0 ? Number(((revisedBalls / originalBalls) * 100).toFixed(2)) : 0;

  const chaseOvers = input.interruptionStage === 'before_chase' ? '0.0' : input.rainHappenedOvers;
  const chaseDone = Math.min(revisedBalls, oversToBalls(chaseOvers));
  const chaseRemaining = Math.max(0, revisedBalls - chaseDone);
  const team2RemPct = resourceRemainingPercent(chaseRemaining, originalBalls, input.secondInningsWickets);
  const team2UsedAtRain = Number(Math.max(0, team2Start - team2RemPct).toFixed(2));

  const dlsTarget = team1Used > 0
    ? Math.ceil(input.firstInningsScore * (team2Start / team1Used) + 1)
    : Math.max(1, input.firstInningsScore + 1);

  const effectiveOver = input.matchStoppedNow
    ? ballsToOvers(Math.min(originalBalls, oversToBalls(chaseOvers)))
    : ballsToOvers(Math.min(originalBalls, oversToBalls(input.weatherDecidedOvers)));

  const projectionBalls = Math.min(revisedBalls, oversToBalls(effectiveOver));
  const projectionRemaining = Math.max(0, revisedBalls - projectionBalls);
  const projectionRemPct = resourceRemainingPercent(projectionRemaining, originalBalls, input.secondInningsWickets);
  const team2UsedAtProjection = Number(Math.max(0, team2Start - projectionRemPct).toFixed(2));
  const ratio = team1Used > 0 ? Math.min(1, Math.max(0, team2UsedAtProjection / team1Used)) : 0;
  const parAtProjection = Math.floor(input.firstInningsScore * ratio);
  const targetAtProjection = parAtProjection + 1;
  const runsNeededAtProjection = Math.max(0, targetAtProjection - input.secondInningsScore);

  const points = ['5.0', '10.0', '15.0', effectiveOver]
    .map((o) => Math.min(revisedBalls, oversToBalls(o)));
  const unique = [...new Set(points)].sort((a, b) => a - b);
  const projections = unique.map((balls) => {
    const rem = Math.max(0, revisedBalls - balls);
    const remPct = resourceRemainingPercent(rem, originalBalls, input.secondInningsWickets);
    const used = Math.max(0, team2Start - remPct);
    const over = ballsToOvers(balls);
    const rr = team1Used > 0 ? Math.min(1, Math.max(0, used / team1Used)) : 0;
    return { over, par: Math.floor(input.firstInningsScore * rr) };
  });

  let stoppedResult = null;
  if (input.matchStoppedNow) {
    const stopPar = projections.find((p) => p.over === ballsToOvers(Math.min(revisedBalls, oversToBalls(chaseOvers))))?.par ?? parAtProjection;
    if (input.secondInningsScore > stopPar) {
      stoppedResult = `Team 2 wins by ${input.secondInningsScore - stopPar} runs (DLS, simplified)`;
    } else if (input.secondInningsScore < stopPar) {
      stoppedResult = `Team 1 wins by ${stopPar - input.secondInningsScore} runs (DLS, simplified)`;
    } else {
      stoppedResult = 'Scores are level on DLS par (Match tied on simplified model)';
    }
  }

  return {
    dlsTarget,
    effectiveOver,
    parAtProjection,
    targetAtProjection,
    runsNeededAtProjection,
    team2UsedAtRain,
    projections,
    stoppedResult,
  };
}

export function calculateMatchNrr(input) {
  if (['abandoned', 'no_result'].includes(input.resultStatus)) {
    return { teamNrr: 0, oppNrr: 0 };
  }

  const oversToNumber = (v) => Math.max(0.1, oversToBalls(v) / 6);
  const baseOvers = oversToNumber(input.matchOvers);
  const teamQuota = input.rainAffected ? oversToNumber(input.revisedTeamOvers) : baseOvers;
  const oppQuota = input.rainAffected ? oversToNumber(input.revisedOppOvers) : baseOvers;
  const teamActual = oversToNumber(input.teamOvers);
  const oppActual = oversToNumber(input.oppOvers);
  const teamDen = input.teamAllOut ? teamQuota : Math.min(teamActual, teamQuota);
  const oppDen = input.oppAllOut ? oppQuota : Math.min(oppActual, oppQuota);

  const teamRate = input.teamRuns / teamDen;
  const oppRate = input.oppRuns / oppDen;
  const teamNrr = Number((teamRate - oppRate).toFixed(4));
  return { teamNrr, oppNrr: Number((-teamNrr).toFixed(4)) };
}

export function buildPredictor(input) {
  const expectedOvers = Math.max(0.1, Number(input.expectedOvers) || 0);
  const runsFor = Number(input.totalRunsScored) || 0;
  const oversFor = Math.max(0.1, oversToBalls(input.totalOversFaced) / 6);
  const runsAgainst = Number(input.totalRunsConceded) || 0;
  const oversAgainst = Math.max(0.1, oversToBalls(input.totalOversBowled) / 6);
  const targetNrr = Number(input.targetNrr) || 0;

  if (input.inningsMode === 'batting_first') {
    const defend = Math.max(1, Number(input.predictedTeamScore) || 1);
    const maxOppRaw = (((runsFor + defend) / (oversFor + expectedOvers)) - targetNrr) * (oversAgainst + expectedOvers) - runsAgainst;
    const maxOpp = Math.max(0, Math.floor(maxOppRaw));

    // If maxOpp is <= 0, requested target NRR is not realistically achievable from current totals.
    if (maxOppRaw <= 0) {
      return {
        mode: 'batting_first',
        message: 'Target NRR is too high for this match setup. Try lowering Target NRR or increasing predicted team score.',
      };
    }

    const minWinningMargin = Math.max(1, defend - maxOpp);

    return {
      mode: 'batting_first',
      message: `Win by at least ${minWinningMargin} runs (score ${defend}, restrict opponent to ${maxOpp} or fewer).`,
    };
  }

  const oppScore = Math.max(1, Number(input.predictedOppScore) || 1);
  const chaseTarget = oppScore + 1;
  const denominator = targetNrr + ((runsAgainst + oppScore) / (oversAgainst + expectedOvers));
  const chaseBy = denominator > 0 ? ((runsFor + chaseTarget) / denominator) - oversFor : expectedOvers;
  const chaseOvers = Math.min(expectedOvers, Math.max(0.1, chaseBy));

  if (chaseBy <= 0) {
    return {
      mode: 'bowling_first',
      message: 'Target NRR is too high for this match setup. Try lowering Target NRR or choosing a lower predicted opponent score.',
    };
  }

  if (chaseBy > expectedOvers) {
    return {
      mode: 'bowling_first',
      message: `For this target NRR, chasing ${chaseTarget} may still be insufficient at ${expectedOvers.toFixed(1)} overs. You need a faster chase or better outcomes in other matches.`,
    };
  }

  return {
    mode: 'bowling_first',
    message: `Chase target ${chaseTarget} in ${ballsToOvers(Math.round(chaseOvers * 6))} overs or fewer to hit the target NRR.`,
  };
}
