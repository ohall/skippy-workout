import { formatMuscleTags, WEEKLY_SET_TARGET } from './workout.js';

function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateWorkoutPage({ today, workout, recs, recent, weeklySets }) {
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const formatWeight = (w) => (w != null ? `${w} lb` : 'TBD');

  const overBudget = {};
  for (const [muscle, sets] of Object.entries(weeklySets)) {
    if (sets > WEEKLY_SET_TARGET) overBudget[muscle] = sets;
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="300">
<title>Daily Workout Coach — Skippy the Magnificent</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0}
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;max-width:820px;margin:28px auto;padding:0 18px;line-height:1.5;background:#0c0e14;color:#e4e8f0;}
  h1{font-size:1.6rem;margin:0 0 2px}
  h2{font-size:1.15rem;margin:0 0 8px;color:#bcc6d6}
  h3{font-size:1rem;margin:12px 0 4px;color:#cdd4e0}
  .card{background:#141820;border:1px solid #262d3a;border-radius:14px;padding:20px;margin:14px 0;box-shadow:0 2px 12px rgba(0,0,0,.25)}
  .muted{color:#8e97a8;font-size:.92rem}
  .tag{display:inline-block;background:#1e2530;border:1px solid #2f3848;border-radius:999px;padding:3px 10px;margin:2px 5px 2px 0;font-size:.85rem}
  .tag strong{color:#d4dce8}
  .warn{color:#f5c76a}
  .good{color:#7de38c}
  ul{margin:4px 0 0;padding-left:20px}
  li{margin:3px 0}
  .rec-row{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}
  .meta{font-size:.88rem;color:#7c8598;margin:2px 0 10px}
  a{color:#7fb8ff}
</style>
</head>
<body>

<h1>Daily Workout Coach</h1>
<p class="meta">${escape(dateStr)} · Cycle day ${workout.cycleDay} · <strong>${escape(workout.name)}</strong></p>

<div class="card">
  <h2>Focus</h2>
  <p class="muted">${escape(workout.tone)}</p>
</div>

<div class="card">
  <h2>Workout (30 minutes)</h2>
  <h3>0–4 min · Warmup</h3>
  <ul>${workout.warmup.map(w => `<li>${escape(w)}</li>`).join('')}</ul>
  <h3>4–22 min · Main work</h3>
  <ul>${workout.main.map(ex => {
    const r = recs.find(r => r.exercise_name === ex.exercise_name);
    const tag = formatMuscleTags(ex);
    return `<li>${escape(ex.exercise_name)} — ${ex.sets}&times;${ex.reps_low}–${ex.reps_high} <span class="muted">@ ${formatWeight(r?.recommended_weight_lbs)}</span> <span class="tag">${escape(tag)}</span></li>`;
  }).join('')}</ul>
  <h3>22–30 min · Finisher / mobility</h3>
  <ul>${workout.finisher.map(f => `<li>${escape(f)}</li>`).join('')}</ul>
</div>

<div class="card">
  <h2>Load Recommendations</h2>
  ${recs.length ? `<div class="rec-row">${recs.map(r => `<div class="tag"><strong>${escape(r.exercise_name)}</strong>: ${formatWeight(r.recommended_weight_lbs)} · ${escape(r.note)}</div>`).join('')}</div>` : '<p class="muted">No stored recommendations yet. Start conservatively.</p>'}
</div>

<div class="card">
  <h2>Weekly Volume Budget</h2>
  <p class="muted">Cap: ~${WEEKLY_SET_TARGET} direct hard sets per muscle group per week.</p>
  <div class="rec-row">${Object.entries(weeklySets).map(([m, s]) => {
    const over = s > WEEKLY_SET_TARGET;
    return `<span class="tag ${over ? 'warn' : ''}"><strong>${escape(m)}</strong>: ${s}/${WEEKLY_SET_TARGET} sets</span>`;
  }).join('')}</div>
  ${Object.keys(overBudget).length > 0 ? `<p class="warn">Volume warning: ${Object.entries(overBudget).map(([m, s]) => `${escape(m)} at ${s} sets`).join(', ')} exceed the cap.</p>` : ''}
</div>

<div class="card">
  <h2>Recent Performance</h2>
  ${recent ? `
    <p>Last completed: <strong>${escape(recent.session.workout_date)}</strong> · soreness ${recent.session.soreness_1_10 ?? 'n/a'}/10 · energy ${recent.session.energy_1_10 ?? 'n/a'}/10</p>
    <ul>${recent.sets.map(s => `<li>${escape(s.exercise_name)} set ${s.set_number}: ${s.actual_reps ?? '?'} reps @ ${s.weight_lbs ?? '?'} lb</li>`).join('')}</ul>
  ` : '<p class="muted">No completed session history found yet.</p>'}
</div>

<div class="card">
  <h2>Progression Rules</h2>
  <ul>
    <li>Double progression: hit <strong>top of rep range</strong> on all prescribed sets with good form → increase load next time</li>
    <li>Barbell: usually <strong>+5 lb</strong> (+10 lb for lower-body lifts if easy)</li>
    <li>Dumbbell: <strong>+2.5–5 lb/hand</strong> when available</li>
    <li>Keep compounds at ~1–2 reps in reserve; isolation/accessory can go closer to failure</li>
    <li>If you miss the bottom of the rep range, reduce load next time by <strong>5–10%</strong></li>
    <li>Every 4th week: reduce volume ~30% for recovery</li>
  </ul>
</div>

<div class="card">
  <p class="muted">Page auto-refreshes every 5 minutes. After your workout, send results to Skippy for logging and updated recommendations.</p>
</div>

</body>
</html>`;
}