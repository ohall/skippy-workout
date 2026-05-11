// 7-day rotating workout cycle with exercise details and progression rules

export const CYCLE_MAP = {
  1: {
    name: 'Lower — Quad Focus',
    tone: 'quad-dominant, knee-friendly strength + hypertrophy',
    warmup: ['4 min treadmill walk', 'ankle rocks', 'bodyweight squats', 'hip openers'],
    main: [
      { exercise_name: 'Back Squat', sets: 3, reps_low: 6, reps_high: 10, type: 'barbell', base_increment: 5, muscles: ['quads'] },
      { exercise_name: 'DB Split Squat', sets: 2, reps_low: 8, reps_high: 12, type: 'dumbbell', base_increment: 2.5, muscles: ['quads'] },
      { exercise_name: 'Banded Lateral Walk', sets: 2, reps_low: 12, reps_high: 15, type: 'band', base_increment: 0, muscles: ['glutes'] },
    ],
    finisher: ['Dead Bug 2x8/side', '90/90 breathing 2 min'],
  },
  2: {
    name: 'Upper Push',
    tone: 'horizontal pressing, chest/triceps, shoulder-friendly',
    warmup: ['4 min easy treadmill', 'scap push-ups', 'band external rotations', 'push-up plus'],
    main: [
      { exercise_name: 'DB Bench Press', sets: 3, reps_low: 6, reps_high: 10, type: 'dumbbell', base_increment: 5, muscles: ['chest'] },
      { exercise_name: 'Incline DB Press', sets: 2, reps_low: 8, reps_high: 12, type: 'dumbbell', base_increment: 5, muscles: ['chest'] },
      { exercise_name: 'Band Triceps Pressdown', sets: 3, reps_low: 12, reps_high: 15, type: 'band', base_increment: 0, muscles: ['triceps'] },
    ],
    finisher: ['Scap push-ups 2x10', 'pec stretch 1 min/side'],
  },
  3: {
    name: 'Upper Pull',
    tone: 'rows, rear delts, grip, upper-back volume',
    warmup: ['4 min rower or treadmill', 'band pull-aparts', 'thoracic rotations'],
    main: [
      { exercise_name: '1-Arm DB Row', sets: 3, reps_low: 8, reps_high: 12, type: 'dumbbell', base_increment: 5, muscles: ['back'] },
      { exercise_name: 'Chest Supported Row', sets: 2, reps_low: 8, reps_high: 12, type: 'dumbbell', base_increment: 5, muscles: ['back'] },
      { exercise_name: 'Band Face Pull', sets: 2, reps_low: 15, reps_high: 20, type: 'band', base_increment: 0, muscles: ['back', 'rear delts'] },
    ],
    finisher: ['Farmer carry 3x30-40 sec'],
  },
  4: {
    name: 'Mobility + Zone 2',
    tone: 'movement quality, joints, easy aerobic work',
    warmup: ['4 min easy walk', 'cat-cow', 'hip circles', 'shoulder CARs'],
    main: [
      { exercise_name: 'Zone 2 Treadmill', sets: 1, reps_low: 15, reps_high: 20, type: 'cardio', base_increment: 0, muscles: [] },
      { exercise_name: 'Mobility Flow', sets: 2, reps_low: 5, reps_high: 8, type: 'mobility', base_increment: 0, muscles: [] },
    ],
    finisher: ['Couch stretch 1 min/side', 'breathing reset 2 min'],
  },
  5: {
    name: 'Lower — Posterior Chain',
    tone: 'hinge, glutes, hamstrings, low back tolerance',
    warmup: ['4 min hinge prep', 'glute bridges', 'hamstring sweeps'],
    main: [
      { exercise_name: 'Romanian Deadlift', sets: 3, reps_low: 6, reps_high: 10, type: 'barbell', base_increment: 10, muscles: ['hamstrings'] },
      { exercise_name: 'Barbell Hip Thrust', sets: 3, reps_low: 8, reps_high: 12, type: 'barbell', base_increment: 5, muscles: ['glutes'] },
      { exercise_name: 'Band Hamstring Curl', sets: 2, reps_low: 12, reps_high: 15, type: 'band', base_increment: 0, muscles: ['hamstrings'] },
    ],
    finisher: ['Glute bridge hold 2x30 sec', 'hamstring stretch 1 min/side'],
  },
  6: {
    name: 'Upper Mixed Hypertrophy',
    tone: 'full upper with moderate leg accessory work',
    warmup: ['4 min band circuit', 'scap retractions', 'light goblet squats'],
    main: [
      { exercise_name: 'DB Incline Bench', sets: 3, reps_low: 8, reps_high: 12, type: 'dumbbell', base_increment: 5, muscles: ['chest'] },
      { exercise_name: 'Pull-Up / Band Pulldown', sets: 3, reps_low: 6, reps_high: 10, type: 'bodyweight', base_increment: 0, muscles: ['back'] },
      { exercise_name: 'Goblet Squat', sets: 3, reps_low: 10, reps_high: 15, type: 'dumbbell', base_increment: 5, muscles: ['quads'] },
      { exercise_name: 'DB Lateral Raise', sets: 3, reps_low: 12, reps_high: 20, type: 'dumbbell', base_increment: 2.5, muscles: ['side delts'] },
    ],
    finisher: ['Suitcase carry 2x30-45 sec/side'],
  },
  7: {
    name: 'Off or Optional Mobility',
    tone: 'recovery, walking, light mobility',
    warmup: ['5 min easy walk', 'light mobility'],
    main: [
      { exercise_name: 'Optional Mobility', sets: 1, reps_low: 10, reps_high: 15, type: 'mobility', base_increment: 0, muscles: [] },
      { exercise_name: 'Optional Zone 2 Walk', sets: 1, reps_low: 15, reps_high: 20, type: 'cardio', base_increment: 0, muscles: [] },
    ],
    finisher: ['Recover', 'sleep well'],
  },
};

export const WEEKLY_SET_TARGET = 10;

export function getTodaysWorkout(today = new Date()) {
  const cycleDay = today.getDay() === 0 ? 7 : today.getDay(); // Sun=7, Mon=1, ... Sat=6
  const workout = CYCLE_MAP[cycleDay] || CYCLE_MAP[7];
  return { cycleDay, ...workout };
}

export function getRecommendationsForWorkout(workout, db) {
  const recs = db.prepare('SELECT * FROM exercise_recommendations').all();
  const recMap = {};
  for (const r of recs) recMap[r.exercise_name] = r;

  return workout.main.map(ex => {
    const prev = recMap[ex.exercise_name];
    let next_w = null;
    let note = '';

    if (!prev || prev.last_weight_lbs === null) {
      next_w = null;
      note = 'Start conservatively; use a load leaving ~2 reps in reserve.';
    } else if (prev.last_successful_reps === null) {
      next_w = prev.last_weight_lbs;
      note = 'Maintain until you record reps.';
    } else if (ex.base_increment <= 0) {
      next_w = prev.last_weight_lbs;
      note = 'Non-loaded movement; progress reps or quality instead of load.';
    } else {
      next_w = Math.round((prev.last_weight_lbs + ex.base_increment) * 10) / 10;
      note = 'If all sets hit the top of range with solid form, increase next time.';
    }

    return {
      exercise_name: ex.exercise_name,
      target_reps_low: ex.reps_low,
      target_reps_high: ex.reps_high,
      recommended_weight_lbs: next_w,
      note,
    };
  });
}

export function getWeeklySetTotals() {
  const totals = {};
  for (const workout of Object.values(CYCLE_MAP)) {
    for (const ex of workout.main) {
      for (const muscle of ex.muscles) {
        totals[muscle] = (totals[muscle] || 0) + ex.sets;
      }
    }
  }
  return totals;
}

export function formatMuscleTags(ex) {
  const muscles = ex.muscles || [];
  if (muscles.length === 0) return 'recovery/cardio';
  return muscles.join(', ');
}