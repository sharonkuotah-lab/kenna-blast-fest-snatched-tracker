/* Kenna's Blast Fest Snatched Tracker
 * Local-first, dependency-free PWA. Simple state lives in localStorage.
 * Progress photos are stored separately in IndexedDB when supported.
 */
const STORAGE_KEY = "kenna-snatched-tracker-v1";
const CHECKIN_DAYS = [1, 9, 18, 27, 36, 45];
const HABITS = [
  ["morningWater", "Drink 16-24 oz water after waking"],
  ["breakfast", "Eat a high-protein breakfast"],
  ["plannedLunch", "Eat Whole Foods meal prep or planned lunch"],
  ["proteinDinner", "Eat a protein-based dinner"],
  ["waterGoal", "Hit water goal"],
  ["proteinGoal", "Hit protein goal"],
  ["fiberGoal", "Hit fiber goal"],
  ["stepGoal", "Hit step goal"],
  ["workout", "Complete workout or active recovery"],
  ["probiotic", "Take kefir or probiotic if planned"],
  ["bowelMovement", "Log bowel movement"],
  ["nightRoutine", "Complete night routine"]
];
const WORKOUTS = [
  ["Glutes + Hamstrings", ["Hip thrusts · 4 × 10", "Romanian deadlifts · 3 × 10", "Hamstring curls · 3 × 12", "Glute kickbacks · 3 × 12", "Incline walk · 10-20 min"]],
  ["Upper Body + Incline Walk", ["Lat pulldown · 3 × 10", "Seated row · 3 × 10", "Shoulder press · 3 × 10", "Bicep curls · 3 × 12", "Incline walk · 20 min"]],
  ["Glutes + Quads", ["Squats or leg press · 4 × 10", "Bulgarian split squats · 3 × 10", "Leg extensions · 3 × 12", "Glute bridges · 3 × 12", "Walk · 10 min"]],
  ["Active Recovery + Long Walk", ["Easy walk · 30-60 min", "Stretch · 10 min", "Hydrate", "Early bedtime"]],
  ["Glutes + Hamstrings", ["Hip thrusts · 4 × 10", "Romanian deadlifts · 3 × 10", "Hamstring curls · 3 × 12", "Abductions · 3 × 15", "Incline walk · 10-20 min"]],
  ["Upper Body + Core", ["Lat pulldown · 3 × 10", "Chest press · 3 × 10", "Shoulder raises · 3 × 12", "Plank · 3 rounds", "Dead bugs · 3 × 10"]],
  ["Long Walk + Stretch + Reset", ["Long walk · 45-75 min", "Stretch · 10 min", "Meal prep check", "Plan the next week"]]
];
const QUICK_MEALS = [
  ["Eggs + Egg Whites + Avocado", "Breakfast", 410, 35, 8, 28, 21],
  ["Protein Shake + Fruit", "Snack", 280, 32, 6, 30, 5],
  ["Whole Foods Chicken + Rice + Broccoli", "Lunch", 540, 48, 7, 58, 14],
  ["Whole Foods Salmon + Potatoes + Green Beans", "Dinner", 610, 43, 8, 52, 25],
  ["Turkey Bowl + Rice + Vegetables", "Lunch", 520, 46, 9, 55, 13],
  ["Chicken + Mashed Potatoes + Green Beans", "Dinner", 570, 45, 7, 55, 17],
  ["Orange Chicken + Rice + Broccoli · moderation", "Dinner", 760, 34, 6, 88, 27],
  ["Kefir + Chia/Flax Smoothie", "Snack", 320, 24, 11, 35, 10],
  ["Coffee or Tea", "Drink", 30, 0, 0, 5, 1],
  ["Tortilla Chips", "Snack", 210, 3, 2, 28, 10],
  ["Green Smoothie", "Snack", 230, 18, 8, 33, 5]
];
const DEFAULT_SETTINGS = {
  startDate: "2026-06-04", endDate: "2026-07-18", miniEventDate: "2026-06-19",
  height: 68, age: 30, sex: "female", startWeight: 180, goalWeight: 170,
  activity: "moderate", intensity: "aggressive", waterGoal: 100, proteinGoal: 140,
  fiberGoal: 25, stepGoal: 10000, calorieTarget: 1750, deficitTarget: 650, units: "US"
};
const pageTitles = { dashboard:"Dashboard", today:"Today Only", nutrition:"Nutrition", gut:"Gut Health", workouts:"Workouts", progress:"Progress", checkins:"Check-Ins", coach:"AI Coach", settings:"Settings" };

let state = loadState();
let activePage = "dashboard";
let quickMode = false;

function localISO(date = new Date()) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}
function parseDate(value) { return new Date(`${value}T12:00:00`); }
function daysBetween(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }
function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
function num(value, fallback = 0) { return Number(value) || fallback; }
function round(value, digits = 0) { const p = 10 ** digits; return Math.round(value * p) / p; }
function avg(items, key) {
  const values = items.map(x => num(typeof key === "function" ? key(x) : x[key])).filter(x => Number.isFinite(x));
  return values.length ? round(values.reduce((a, b) => a + b, 0) / values.length, 1) : 0;
}
function todayKey() { return localISO(); }
function getDayNumber(date = todayKey()) { return clamp(daysBetween(state.settings.startDate, date) + 1, 1, 45); }
function workoutIndex(date = todayKey()) { return (getDayNumber(date) - 1) % 7; }
function dayLog(date = todayKey()) {
  if (!state.daily[date]) state.daily[date] = { habits: {}, meals: [], exercises: {}, reset: false };
  return state.daily[date];
}
function daysRemaining(date) { return Math.max(0, daysBetween(todayKey(), date)); }
function pct(value, goal) { return clamp(goal ? (num(value) / num(goal)) * 100 : 0); }
function formatDate(value) { return parseDate(value).toLocaleDateString(undefined, { month:"short", day:"numeric" }); }
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function createDefaultState() {
  return { settings: { ...DEFAULT_SETTINGS }, daily: {}, checkins: {}, randomWeights: [], favorites: [], reminders: true, samplesLoaded: false };
}
function loadState() {
  try { return { ...createDefaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
  catch { return createDefaultState(); }
}

function bmr() {
  const s = state.settings;
  const kg = num(latestOfficialWeight(), s.startWeight) * 0.453592;
  const cm = num(s.height) * 2.54;
  return Math.round(10 * kg + 6.25 * cm - 5 * num(s.age, 30) + (s.sex === "male" ? 5 : -161));
}
function tdee() {
  const factors = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725 };
  return Math.round(bmr() * (factors[state.settings.activity] || 1.55));
}
function burned(log) { return tdee() + num(log.activeCalories); }
function deficit(log) { return num(log.calories) ? burned(log) - num(log.calories) : 0; }
function latestOfficialWeight() {
  const logs = CHECKIN_DAYS.map(day => state.checkins[day]).filter(Boolean).filter(x => num(x.weight));
  return logs.length ? logs.at(-1).weight : state.settings.startWeight;
}
function dailyEntries(limit = 45) {
  return Object.entries(state.daily).sort(([a], [b]) => a.localeCompare(b)).slice(-limit).map(([date, log]) => ({ date, ...log }));
}
function score(log) {
  let total = 0;
  total += pct(log.water, state.settings.waterGoal) * .15;
  total += pct(log.protein, state.settings.proteinGoal) * .20;
  total += pct(log.fiber, state.settings.fiberGoal) * .15;
  total += pct(log.steps, state.settings.stepGoal) * .15;
  const calories = num(log.calories), target = num(state.settings.calorieTarget);
  total += calories && calories >= target - 250 && calories <= target + 200 ? 15 : calories && calories < target - 250 ? 7 : 0;
  total += (log.workoutCompleted || log.activeRecovery || log.habits?.workout) ? 10 : 0;
  total += (log.poop === "yes" || log.habits?.bowelMovement) ? 5 : 0;
  total += pct(log.sleep, 7) * .05;
  return Math.round(clamp(total));
}
function gutScore(log) {
  let total = pct(log.water, state.settings.waterGoal) * .2 + pct(log.fiber, state.settings.fiberGoal) * .2 + pct(log.steps, state.settings.stepGoal) * .1;
  total += log.poop === "yes" ? 20 : 0;
  total += (log.vegetables || log.kefir || log.probiotic || log.habits?.probiotic) ? 10 : 0;
  total += (10 - num(log.bloating, 5)) * 1;
  total += (10 - num(log.constipation, 5)) * 1;
  return Math.round(clamp(total));
}
function scoreLabel(value) {
  return value >= 90 ? "Locked in" : value >= 75 ? "Strong day" : value >= 60 ? "Good, but needs tightening" : "Reset, do the basics";
}
function nextCheckin() {
  const current = getDayNumber();
  return CHECKIN_DAYS.find(day => day >= current && !state.checkins[day]) || CHECKIN_DAYS.find(day => day > current) || 45;
}
function challengeDate(day) {
  const d = parseDate(state.settings.startDate); d.setDate(d.getDate() + day - 1); return localISO(d);
}
function streak() {
  let count = 0;
  const start = parseDate(todayKey());
  for (let i = 0; i < 45; i++) {
    const d = new Date(start); d.setDate(d.getDate() - i);
    const log = state.daily[localISO(d)];
    if (log && (score(log) >= 60 || log.reset)) count++; else if (i > 0 || log) break;
  }
  return count;
}
function todayFocus(log) {
  if (pct(log.water, state.settings.waterGoal) < 50) return "Start with water. Hydration makes every other choice easier.";
  if (pct(log.protein, state.settings.proteinGoal) < 55) return "Build the next meal around protein before snacks.";
  if (pct(log.steps, state.settings.stepGoal) < 60) return "A short walk is the fastest way to build momentum.";
  return "Keep it steady. Finish the basics and let consistency do the work.";
}
function phase() {
  const current = todayKey();
  if (current >= "2026-07-11" && current <= "2026-07-18") return "Final Week";
  if (current >= "2026-06-16" && current <= "2026-06-19") return "Concert Week";
  return `Cycle ${Math.ceil(getDayNumber() / 9)}`;
}

function progressRow(label, value, goal, unit = "") {
  return `<div><div class="row"><strong>${label}</strong><span class="tiny">${num(value)} / ${goal}${unit}</span></div><div class="progress"><span style="width:${pct(value, goal)}%"></span></div></div>`;
}
function mic(fieldId) { return `<button type="button" class="mic-button" data-mic="${fieldId}" aria-label="Speak note">●</button>`; }
function field(label, key, value = "", type = "number", extra = "") {
  return `<label>${label}<input type="${type}" data-field="${key}" value="${value ?? ""}" ${extra}></label>`;
}
function selectField(label, key, value, choices) {
  return `<label>${label}<select data-field="${key}">${choices.map(x => `<option value="${x}" ${value === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
}
function noteField(label, key, value = "") {
  const id = `note-${key}`;
  return `<label class="full">${label}<div class="note-wrap"><textarea id="${id}" data-field="${key}">${value || ""}</textarea>${mic(id)}</div></label>`;
}
function protocolCard() {
  const current = todayKey();
  if (current >= "2026-06-16" && current <= "2026-06-19") return listCard("Concert Week Snatched Protocol", ["Hydrate daily", "Keep sodium moderate", "No alcohol before event", "Protein every meal", "8k-12k steps", "Reduce bloating triggers", "Sleep", "No new foods right before event"]);
  if (current >= "2026-07-11" && current <= "2026-07-18") return listCard("Final Week Snatched Protocol", ["No crash dieting", "No new foods", "Hydration consistency", "Protein high", "Fiber consistent, not suddenly excessive", "Steps daily", "Sleep", "Reduce bloating triggers", "Keep workouts consistent but do not overtrain"]);
  return "";
}
function listCard(title, items) {
  return `<div class="card protocol"><h3>${title}</h3><div class="spacer"></div>${items.map(x => `<div class="tiny">✓ ${x}</div>`).join("")}</div>`;
}

function renderDashboard() {
  const log = dayLog(), snatched = score(log), gut = gutScore(log), check = nextCheckin();
  const workout = WORKOUTS[workoutIndex()][0];
  document.querySelector("#dashboardContent").innerHTML = `
    ${state.samplesLoaded ? `<div class="card protocol"><div class="row"><div><p class="eyebrow">PREVIEW DATA</p><p class="tiny">Sample logs are loaded so you can explore the app. Clear them in Settings when you are ready to begin.</p></div><button class="secondary-button" data-go="settings">Settings</button></div></div>` : ""}
    <div class="card hero-card">
      <div class="row"><div><p class="eyebrow" style="color:#ffe7e7">${phase()}</p><h2>${daysRemaining(state.settings.endDate)} days to Blast Fest</h2><p class="muted">${daysRemaining(state.settings.miniEventDate)} days to Seattle · Day ${getDayNumber()} of 45</p></div><div class="ring" style="--value:${snatched}" data-label="${snatched}"></div></div>
      <div class="spacer"></div><p><strong>Today's mission:</strong> ${todayFocus(log)}</p>
    </div>
    ${protocolCard()}
    <div class="grid-2">
      <div class="card"><p class="eyebrow">NEXT CHECK-IN</p><h2>Day ${check}</h2><p class="muted">${formatDate(challengeDate(check))} · ${daysRemaining(challengeDate(check))} days</p></div>
      <div class="card"><p class="eyebrow">STREAK</p><h2>${streak()} days</h2><p class="muted">${scoreLabel(snatched)}</p></div>
    </div>
    <div class="card stack">
      <div class="row"><h3>Today's essentials</h3><button class="secondary-button" data-go="today">Log today</button></div>
      ${progressRow("Water", log.water, state.settings.waterGoal, " oz")}
      ${progressRow("Protein", log.protein, state.settings.proteinGoal, "g")}
      ${progressRow("Fiber", log.fiber, state.settings.fiberGoal, "g")}
      ${progressRow("Steps", log.steps, state.settings.stepGoal)}
      ${progressRow("Sleep", log.sleep, 7, " hrs")}
    </div>
    <div class="metric-grid">
      <div class="metric"><small>Calories eaten</small><strong>${num(log.calories)}</strong></div>
      <div class="metric"><small>Estimated burn</small><strong>${burned(log)}</strong></div>
      <div class="metric"><small>Daily deficit</small><strong>${deficit(log)}</strong></div>
      <div class="metric"><small>Gut health</small><strong>${gut}/100</strong></div>
    </div>
    <div class="card"><div class="row"><div><p class="eyebrow">TODAY'S MOVEMENT</p><h3>${workout}</h3><p class="muted">${log.workoutCompleted ? "Workout complete. Nice work." : "One session. Then move on with your day."}</p></div><span class="pill">${log.workoutCompleted ? "Done" : "Open"}</span></div></div>
    <div class="card"><div class="row"><div><p class="eyebrow">CALORIE DASHBOARD</p><h3>Smart, steady deficit</h3></div><button class="secondary-button" data-go="progress">View trends</button></div><div class="spacer"></div>${calorieSummary()}</div>
    ${feedbackHTML(log)}
    <div class="card"><div class="row"><div><p class="eyebrow">ADHD-FRIENDLY RESET</p><h3>Fell off today?</h3></div><button class="danger-button" data-action="reset">Emergency reset</button></div></div>
  `;
}
function calorieSummary() {
  const logs7 = dailyEntries(7), logs9 = dailyEntries(9), averageDeficit = avg(logs9, deficit);
  const projected = round((averageDeficit * daysRemaining(state.settings.endDate)) / 3500, 1);
  return `<div class="grid-2"><div><span class="tiny">7-day calorie avg</span><strong>${avg(logs7, "calories") || "—"}</strong></div><div><span class="tiny">9-day calorie avg</span><strong>${avg(logs9, "calories") || "—"}</strong></div><div><span class="tiny">Avg deficit</span><strong>${averageDeficit || "—"}</strong></div><div><span class="tiny">Projected progress</span><strong>${projected || "—"} lbs</strong></div></div>`;
}

function renderToday() {
  const log = dayLog();
  const habitHTML = HABITS.map(([key, label]) => `<label class="habit"><input type="checkbox" data-habit="${key}" ${log.habits[key] ? "checked" : ""}><span>${label}</span></label>`).join("");
  document.querySelector("#todayContent").innerHTML = `
    <div class="card"><div class="row"><div><p class="eyebrow">DAY ${getDayNumber()} MISSION</p><h3>${todayFocus(log)}</h3></div><div class="ring soft-ring" style="--value:${score(log)}" data-label="${score(log)}"></div></div></div>
    <div class="card"><h3>Daily checklist</h3>${habitHTML}</div>
    <div class="card ${quickMode ? "" : "hidden"}"><h3>Quick check-in</h3><p class="tiny">The basics only. You can add details later.</p><div class="spacer"></div><div class="form-grid">${field("Water oz","water",log.water)}${field("Protein g","protein",log.protein)}${field("Fiber g","fiber",log.fiber)}${field("Steps","steps",log.steps)}${field("Calories","calories",log.calories)}${field("Sleep hours","sleep",log.sleep)}</div></div>
    <div class="card ${quickMode ? "hidden" : ""}"><h3>Daily check-in</h3><div class="spacer"></div><div class="form-grid">
      ${field("Calories consumed","calories",log.calories)}${field("Protein g","protein",log.protein)}${field("Fiber g","fiber",log.fiber)}${field("Water oz","water",log.water)}
      ${field("Steps","steps",log.steps)}${field("Active calories","activeCalories",log.activeCalories)}${field("Exercise minutes","exerciseMinutes",log.exerciseMinutes)}${field("Distance miles","distance",log.distance,"number",'step="0.1"')}
      ${field("Sleep hours","sleep",log.sleep,"number",'step="0.1"')}${selectField("Workout completed","workoutCompleted",String(Boolean(log.workoutCompleted)),["false","true"])}
      ${selectField("Cardio completed","cardio",String(Boolean(log.cardio)),["false","true"])}${selectField("Meal prep eaten","mealPrep",String(Boolean(log.mealPrep)),["false","true"])}
      ${selectField("Dinner completed","dinner",String(Boolean(log.dinner)),["false","true"])}${selectField("Alcohol","alcohol",String(Boolean(log.alcohol)),["false","true"])}
      ${field("Bloating level 1-10","bloating",log.bloating || 5)}${field("Constipation level 1-10","constipation",log.constipation || 5)}
      ${selectField("Did I poop today?","poop",log.poop || "no",["no","yes"])}${selectField("Bowel movement type","bowelType",log.bowelType || "none",["none","easy","normal","hard","diarrhea"])}
      ${field("Energy 1-10","energy",log.energy || 5)}${field("Mood 1-10","mood",log.mood || 5)}${field("Cravings 1-10","cravings",log.cravings || 5)}${field("Stress 1-10","stress",log.stress || 5)}
      ${noteField("Daily notes","notes",log.notes)}
    </div><p class="tiny">Version 1 uses manual Apple Health entry. Future iOS app version can connect directly to Apple Health.</p></div>
    ${feedbackHTML(log)}
  `;
}

function feedback(log) {
  const out = [];
  if (num(log.water) < 80) out.push("Hydration may be affecting bloating, constipation, hunger, and scale fluctuations.");
  if (num(log.protein) < 130) out.push("Prioritize protein before snacks at your next meal.");
  if (num(log.fiber) < 20) out.push("Fiber may be contributing to constipation and poor fullness. Increase it steadily.");
  const prior = dailyEntries(2).at(-2); if (prior && num(log.fiber) - num(prior.fiber) > 12) out.push("Fiber jumped quickly. Sudden increases can worsen bloating, so keep the change gradual.");
  if (num(log.steps) < 8000) out.push("Finish your steps with a short treadmill walk or an easy walk outside.");
  if (num(log.constipation) >= 7 && log.poop !== "yes") out.push("For constipation: water, walking, consistent fiber, vegetables, chia or flax, kefir, and regular meals.");
  if (log.alcohol === true) out.push("Alcohol can cause water retention and slow visible progress. Hydrate and reset.");
  if (num(log.sleep) && num(log.sleep) < 6) out.push("Low sleep can increase hunger, cravings, and water retention.");
  if (num(log.bloating) >= 7) out.push("High bloating: check sodium, alcohol, dairy, water, constipation, late eating, and sleep.");
  const recent = dailyEntries(3);
  if (recent.length >= 3 && recent.filter(x => num(x.calories) && num(x.calories) < 1200).length >= 2) out.push("Do not crash diet. Multiple very-low-calorie days can lead to fatigue, poor workouts, and rebound eating.");
  if (recent.length >= 3 && recent.filter(x => num(x.calories) > num(state.settings.calorieTarget) + 400).length >= 2) out.push("Simplify meals and pre-log the next one. A repeatable day beats a complicated one.");
  if (score(log) >= 80) out.unshift("Strong work. You completed the basics that create visible change.");
  return out;
}
function feedbackHTML(log) {
  const items = feedback(log);
  return `<div class="card"><p class="eyebrow">COACH NOTES</p><div class="stack">${items.length ? items.map(x => `<div class="feedback">${x}</div>`).join("") : `<div class="feedback">Lock back in today. You do not need to be perfect, but you do need to complete the basics: water, protein, fiber, steps, and dinner.</div>`}</div></div>`;
}

function renderNutrition() {
  const log = dayLog(), meals = log.meals || [];
  document.querySelector("#nutritionContent").innerHTML = `
    <div class="card"><div class="row"><div><p class="eyebrow">TODAY'S TOTAL</p><h2>${num(log.calories)} calories</h2></div><span class="pill">${num(log.protein)}g protein</span></div>${progressRow("Protein",log.protein,state.settings.proteinGoal,"g")}</div>
    <div class="card"><div class="row"><h3>Quick-add favorites</h3><button class="secondary-button" data-action="custom-meal">Custom meal</button></div><div class="spacer"></div><div class="stack">${QUICK_MEALS.map((m,i)=>`<button class="quick-add" data-quick-meal="${i}"><strong>${m[0]}</strong><br><span class="tiny">${m[2]} cal · ${m[3]}g protein · ${m[4]}g fiber</span></button>`).join("")}</div></div>
    <div class="card"><h3>Meals logged today</h3>${meals.length ? meals.map((m,i)=>`<div class="meal-item row"><div><strong>${m.name}</strong><div class="tiny">${m.type} · ${m.calories} cal · ${m.protein}g protein · ${m.fiber}g fiber</div></div><button class="secondary-button" data-remove-meal="${i}">Remove</button></div>`).join("") : `<div class="empty">No meals logged yet. One tap is enough.</div>`}</div>
    <div class="card"><p class="eyebrow">MEAL PHOTO</p><h3>Optional visual food log</h3><div class="spacer"></div><input type="file" accept="image/*" data-photo="meal-${todayKey()}"><p class="tiny">Photos stay on this device when browser storage allows it.</p></div>
  `;
}
function addMeal(meal) {
  const log = dayLog(); log.meals ||= [];
  log.meals.push({ name:meal[0], type:meal[1], calories:meal[2], protein:meal[3], fiber:meal[4], carbs:meal[5], fat:meal[6], notes:"", rating:5 });
  ["calories","protein","fiber","carbs","fat"].forEach((key, index) => log[key] = num(log[key]) + num(meal[index + 2]));
  saveState(); toast(`${meal[0]} added`); render();
}

function renderGut() {
  const log = dayLog(), scoreValue = gutScore(log);
  document.querySelector("#gutContent").innerHTML = `
    <div class="card"><div class="row"><div><p class="eyebrow">GUT HEALTH SCORE</p><h2>${scoreValue}/100</h2><p class="muted">Aim for steady inputs, not a perfect stomach every day.</p></div><div class="ring soft-ring" style="--value:${scoreValue}" data-label="${scoreValue}"></div></div></div>
    <div class="card"><h3>Gut health check-in</h3><div class="spacer"></div><div class="form-grid">
      ${field("Water oz","water",log.water)}${field("Fiber g","fiber",log.fiber)}${selectField("Vegetables eaten","vegetables",String(Boolean(log.vegetables)),["false","true"])}${selectField("Kefir","kefir",String(Boolean(log.kefir)),["false","true"])}
      ${selectField("Probiotic","probiotic",String(Boolean(log.probiotic)),["false","true"])}${selectField("Bowel movement","poop",log.poop || "no",["no","yes"])}${selectField("Bowel movement type","bowelType",log.bowelType || "none",["none","easy","normal","hard","diarrhea"])}
      ${field("Bloating 1-10","bloating",log.bloating || 5)}${field("Constipation 1-10","constipation",log.constipation || 5)}${field("Stress 1-10","stress",log.stress || 5)}${field("Sleep hours","sleep",log.sleep || "","number",'step="0.1"')}
    </div></div>
    ${feedbackHTML(log)}
  `;
}

function renderWorkouts() {
  const log = dayLog(), currentIndex = workoutIndex();
  document.querySelector("#workoutContent").innerHTML = `
    <div class="card hero-card"><p class="eyebrow" style="color:#ffe7e7">TODAY · DAY ${currentIndex + 1} OF 7</p><h2>${WORKOUTS[currentIndex][0]}</h2><p class="muted">Complete the planned work, then let your body recover.</p></div>
    <div class="card"><h3>Today's workout</h3>${WORKOUTS[currentIndex][1].map((x,i)=>`<label class="habit"><input type="checkbox" data-exercise="${i}" ${log.exercises?.[i] ? "checked" : ""}><span>${x}</span></label>`).join("")}
      <div class="spacer"></div><div class="form-grid">${selectField("Workout complete","workoutCompleted",String(Boolean(log.workoutCompleted)),["false","true"])}${selectField("Cardio complete","cardio",String(Boolean(log.cardio)),["false","true"])}</div>
      <div class="spacer"></div>${noteField("Workout notes","workoutNotes",log.workoutNotes)}
    </div>
    <div class="card"><h3>Repeating weekly split</h3>${WORKOUTS.map((x,i)=>`<div class="workout-item row"><div><strong>Day ${i+1}</strong><div class="tiny">${x[0]}</div></div>${i===currentIndex?'<span class="pill">Today</span>':""}</div>`).join("")}</div>
  `;
}

function renderProgress() {
  document.querySelector("#progressContent").innerHTML = `
    <div class="metric-grid">
      <div class="metric"><small>7-day calories</small><strong>${avg(dailyEntries(7),"calories") || "—"}</strong></div>
      <div class="metric"><small>9-day deficit</small><strong>${avg(dailyEntries(9),deficit) || "—"}</strong></div>
      <div class="metric"><small>Streak</small><strong>${streak()}</strong></div>
      <div class="metric"><small>Current cycle</small><strong>${Math.ceil(getDayNumber()/9)}</strong></div>
    </div>
    ${chartCard("Official weight trend", CHECKIN_DAYS.map(day => ({ label:`D${day}`, value:num(state.checkins[day]?.weight) })).filter(x=>x.value), "Official weigh-ins only. Private random weigh-ins never change this chart.")}
    ${chartCard("Waist trend", CHECKIN_DAYS.map(day => ({ label:`D${day}`, value:num(state.checkins[day]?.waist) })).filter(x=>x.value))}
    ${chartCard("Snatched Score", dailyEntries().map(x=>({label:formatDate(x.date),value:score(x)})))}
    ${chartCard("Calories consumed", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.calories)})).filter(x=>x.value))}
    ${chartCard("Average calorie deficit", dailyEntries().map(x=>({label:formatDate(x.date),value:deficit(x)})).filter(x=>x.value))}
    ${chartCard("Protein", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.protein)})).filter(x=>x.value))}
    ${chartCard("Fiber", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.fiber)})).filter(x=>x.value))}
    ${chartCard("Water", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.water)})).filter(x=>x.value))}
    ${chartCard("Steps", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.steps)})).filter(x=>x.value))}
    ${chartCard("Sleep", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.sleep)})).filter(x=>x.value))}
    ${chartCard("Bloating", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.bloating)})).filter(x=>x.value))}
    ${chartCard("Constipation", dailyEntries().map(x=>({label:formatDate(x.date),value:num(x.constipation)})).filter(x=>x.value))}
    ${chartCard("Gut Health Score", dailyEntries().map(x=>({label:formatDate(x.date),value:gutScore(x)})))}
    <div class="card"><h3>45-day calendar</h3><p class="tiny">Green means the day was completed or reset. Gold dots mark official check-ins.</p><div class="spacer"></div>${calendarHTML()}</div>
    <div class="card"><h3>Progress badges</h3><div class="row wrap">${badgesHTML()}</div></div>
  `;
}
function chartCard(title, data, note = "") {
  return `<div class="card"><h3>${title}</h3>${note ? `<p class="tiny">${note}</p>` : ""}${data.length ? lineChart(data) : `<div class="empty">Your trend will appear after you log data.</div>`}</div>`;
}
function lineChart(data) {
  const width=500,height=150,pad=18, vals=data.map(x=>x.value), min=Math.min(...vals), max=Math.max(...vals), range=max-min || 1;
  const points=data.map((x,i)=>({x:pad+(i/(Math.max(1,data.length-1)))*(width-pad*2),y:height-pad-((x.value-min)/range)*(height-pad*2),...x}));
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img"><line class="grid" x1="0" y1="${height-pad}" x2="${width}" y2="${height-pad}"/><polyline class="line" points="${points.map(p=>`${p.x},${p.y}`).join(" ")}"/>${points.map(p=>`<circle class="dot" cx="${p.x}" cy="${p.y}" r="4"><title>${p.label}: ${p.value}</title></circle>`).join("")}</svg><div class="row tiny"><span>${data[0].label}: ${data[0].value}</span><span>${data.at(-1).label}: ${data.at(-1).value}</span></div>`;
}
function calendarHTML() {
  return `<div class="calendar">${Array.from({length:45},(_,i)=>i+1).map(day => {
    const date=challengeDate(day), log=state.daily[date], complete=log&&(score(log)>=60||log.reset), classes=["day",complete?"complete":"",day===getDayNumber()?"current":"",CHECKIN_DAYS.includes(day)?"checkin":"",(date===state.settings.miniEventDate||date===state.settings.endDate)?"event":""].join(" ");
    return `<div class="${classes}" title="${date}${date===state.settings.miniEventDate?" · Seattle":date===state.settings.endDate?" · Blast Fest":""}">${day}</div>`;
  }).join("")}</div>`;
}
function badgesHTML() {
  const logs=dailyEntries(), earned=[["First log",logs.length>=1],["3-day rhythm",streak()>=3],["Locked in",logs.some(x=>score(x)>=90)],["Gut win",logs.some(x=>gutScore(x)>=80)],["Check-in complete",Object.keys(state.checkins).length>=1],["Reset queen",logs.some(x=>x.reset)]];
  return earned.map(([name,yes])=>`<span class="badge ${yes?"earned":"locked"}">${yes?"✓":"○"} ${name}</span>`).join("");
}

function renderCheckins() {
  const current=getDayNumber();
  document.querySelector("#checkinContent").innerHTML = `
    <div class="card"><p>Official check-ins are the only weights used for trends. Daily scale noise is not the assignment.</p><div class="spacer"></div><button class="secondary-button" data-action="random-weight">Log a private random weigh-in</button></div>
    <div class="card"><h3>Official schedule</h3>${CHECKIN_DAYS.map(day=>`<div class="checkin-item row"><div><strong>Day ${day} · ${formatDate(challengeDate(day))}</strong><div class="tiny">${state.checkins[day]?.weight ? `${state.checkins[day].weight} lbs · waist ${state.checkins[day].waist || "—"}` : day===current ? "Your official check-in is ready." : "Not logged yet"}</div></div><button class="secondary-button" data-checkin="${day}">${state.checkins[day]?"Edit":"Open"}</button></div>`).join("")}</div>
    <div class="card"><h3>Private random weigh-ins</h3>${state.randomWeights.length ? state.randomWeights.map(x=>`<div class="checkin-item row"><span>${formatDate(x.date)}</span><strong>${x.weight} lbs</strong></div>`).join("") : `<div class="empty">None logged. This is intentionally not the main focus.</div>`}</div>
  `;
}
function checkinModal(day) {
  const x=state.checkins[day]||{};
  modal(`<div class="modal-body"><p class="eyebrow">OFFICIAL CHECK-IN</p><h2>Day ${day}</h2><p class="muted">${formatDate(challengeDate(day))} · honest data, zero judgment.</p><div class="spacer"></div><form id="checkinForm" data-day="${day}"><div class="form-grid">
    ${field("Official weight","weight",x.weight,"number",'step="0.1"')}${field("Body fat %","bodyFat",x.bodyFat,"number",'step="0.1"')}${field("Muscle %","muscle",x.muscle,"number",'step="0.1"')}${field("Water %","waterPercent",x.waterPercent,"number",'step="0.1"')}
    ${field("Visceral fat","visceralFat",x.visceralFat)}${field("Metabolic age","metabolicAge",x.metabolicAge)}${field("Waist","waist",x.waist,"number",'step="0.1"')}${field("Hips","hips",x.hips,"number",'step="0.1"')}
    ${field("Chest","chest",x.chest,"number",'step="0.1"')}${field("Arm","arm",x.arm,"number",'step="0.1"')}${field("Thigh","thigh",x.thigh,"number",'step="0.1"')}
    <label>Front photo<input type="file" accept="image/*" data-photo="checkin-${day}-front"></label><label>Side photo<input type="file" accept="image/*" data-photo="checkin-${day}-side"></label><label>Back photo<input type="file" accept="image/*" data-photo="checkin-${day}-back"></label>
    ${noteField("Outfit fit notes","outfit",x.outfit)}${noteField("Bloating notes","bloatingNotes",x.bloatingNotes)}${noteField("Gut health notes","gutNotes",x.gutNotes)}${noteField("What went well?","wins",x.wins)}${noteField("What needs fixing?","challenges",x.challenges)}${noteField("Next 9-day focus","nextFocus",x.nextFocus)}
    </div><div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Save official check-in</button></div></form></div>`);
}

function summary(days=9) {
  const logs=dailyEntries(days), official=state.checkins[CHECKIN_DAYS.filter(x=>x<=getDayNumber()).at(-1)]||{};
  const bowel=logs.filter(x=>x.poop==="yes").length, workouts=logs.filter(x=>x.workoutCompleted).length;
  const missed=[["water",x=>num(x.water)<num(state.settings.waterGoal)],["protein",x=>num(x.protein)<num(state.settings.proteinGoal)],["fiber",x=>num(x.fiber)<num(state.settings.fiberGoal)],["steps",x=>num(x.steps)<num(state.settings.stepGoal)],["sleep",x=>num(x.sleep)<7]].map(([n,f])=>[n,logs.filter(f).length]).sort((a,b)=>b[1]-a[1]);
  return `Blast Fest Tracker Summary:
Dates: ${logs.length ? `${formatDate(logs[0].date)} - ${formatDate(logs.at(-1).date)}` : "No logs yet"}
Day range: ${logs.length ? `${getDayNumber(logs[0].date)} - ${getDayNumber(logs.at(-1).date)}` : "—"}
Official weigh-in: ${official.weight || "—"}
Waist: ${official.waist || "—"}
Average calories: ${avg(logs,"calories") || "—"}
Average protein: ${avg(logs,"protein") || "—"}g
Average fiber: ${avg(logs,"fiber") || "—"}g
Average water: ${avg(logs,"water") || "—"} oz
Average steps: ${avg(logs,"steps") || "—"}
Average active calories: ${avg(logs,"activeCalories") || "—"}
Average deficit: ${avg(logs,deficit) || "—"}
Workouts completed: ${workouts}/${logs.length}
Sleep average: ${avg(logs,"sleep") || "—"} hours
Bloating average: ${avg(logs,"bloating") || "—"}/10
Constipation average: ${avg(logs,"constipation") || "—"}/10
Bowel movements: ${bowel}/${logs.length} days
Biggest wins: ${logs.length ? scoreLabel(Math.round(avg(logs,score))) : "Start logging to reveal the pattern."}
Biggest struggles: ${missed.slice(0,2).map(x=>x[0]).join(", ")}
Notes: ${logs.map(x=>x.notes).filter(Boolean).join(" | ") || "—"}
Please analyze my progress and tell me what to adjust.`;
}
function renderCoach() {
  document.querySelector("#coachContent").innerHTML = `
    <div class="card hero-card"><p class="eyebrow" style="color:#ffe7e7">9-DAY REVIEW</p><h2>Patterns over perfection.</h2><p class="muted">Copy a clean summary into ChatGPT whenever you want a deeper coaching review.</p></div>
    <div class="card"><div class="row"><h3>Weekly / 9-day summary</h3><button class="button" data-action="copy-summary">Copy Summary for ChatGPT</button></div><div class="spacer"></div><textarea id="summaryText" style="min-height:360px">${summary()}</textarea></div>
    <div class="card"><p class="eyebrow">REMINDER</p><p>Weight, measurements, habits, and context belong together. Photos stay local to your device and are not pasted into the text report.</p></div>
  `;
}

function renderSettings() {
  const s=state.settings;
  document.querySelector("#settingsContent").innerHTML = `
    <div class="card"><h3>Challenge dates</h3><div class="spacer"></div><div class="form-grid">${field("Start date","settings.startDate",s.startDate,"date")}${field("Blast Fest","settings.endDate",s.endDate,"date")}${field("Seattle concert","settings.miniEventDate",s.miniEventDate,"date")}</div></div>
    <div class="card"><h3>Your goals</h3><div class="spacer"></div><div class="form-grid">
      ${field("Height inches","settings.height",s.height)}${field("Age","settings.age",s.age)}${selectField("Sex","settings.sex",s.sex,["female","male"])}${field("Official start weight","settings.startWeight",s.startWeight,"number",'step="0.1"')}
      ${field("Goal weight","settings.goalWeight",s.goalWeight,"number",'step="0.1"')}${selectField("Activity level","settings.activity",s.activity,["sedentary","light","moderate","active"])}${selectField("Goal intensity","settings.intensity",s.intensity,["moderate","aggressive"])}
      ${field("Water goal oz","settings.waterGoal",s.waterGoal)}${field("Protein goal g","settings.proteinGoal",s.proteinGoal)}${field("Fiber goal g","settings.fiberGoal",s.fiberGoal)}${field("Step goal","settings.stepGoal",s.stepGoal)}${field("Calorie target","settings.calorieTarget",s.calorieTarget)}${field("Deficit target","settings.deficitTarget",s.deficitTarget)}
    </div></div>
    <div class="card"><h3>TDEE calculator</h3><div class="spacer"></div><div class="grid-2"><div><span class="tiny">BMR</span><strong>${bmr()} cal</strong></div><div><span class="tiny">Maintenance</span><strong>${tdee()} cal</strong></div><div><span class="tiny">Moderate target</span><strong>${tdee()-500} cal</strong></div><div><span class="tiny">Aggressive target</span><strong>${Math.max(1200,tdee()-750)} cal</strong></div></div><div class="spacer"></div>${s.calorieTarget<1200?'<div class="feedback">Your target is too low for this tracker. Choose a more sustainable calorie target and seek professional guidance for personalized needs.</div>':'<p class="tiny">Recommended targets avoid extreme starvation calories. Individual needs vary.</p>'}</div>
    <div class="card"><h3>In-app reminders</h3><p class="muted">Water · protein · fiber · walk · meal prep · steps · stretch · night routine · official check-in</p><div class="spacer"></div><button class="secondary-button" data-action="notifications">Enable browser reminders</button></div>
    <div class="card"><h3>Starter data</h3><p class="muted">Load sample days to preview charts, or clear all tracker data when you are ready for a fresh start.</p><div class="spacer"></div><div class="row wrap"><button class="secondary-button" data-action="samples">Load sample data</button><button class="danger-button" data-action="clear-data">Clear all data</button></div></div>
    <div class="card"><p class="eyebrow">SAFETY NOTE</p><p>This tracker supports wellness and consistency. It is not medical advice. If you experience dizziness, fainting, extreme fatigue, severe constipation, chest pain, disordered eating symptoms, or worsening health symptoms, seek medical guidance.</p></div>
    <div class="card"><p class="tiny">All tracker data stays on this device in your browser. Version 1 stores simple data in localStorage and photos in IndexedDB when available.</p></div>
  `;
}

function renderMoreModal() {
  modal(`<div class="modal-body"><p class="eyebrow">MORE</p><h2>Where to?</h2><div class="stack gap" style="margin-top:14px"><button class="quick-add" data-go="checkins"><strong>Official check-ins</strong><br><span class="tiny">Every 9 days, no daily scale obsession</span></button><button class="quick-add" data-go="coach"><strong>AI Coach</strong><br><span class="tiny">Copy your 9-day summary for ChatGPT</span></button><button class="quick-add" data-go="settings"><strong>Settings</strong><br><span class="tiny">Edit dates, goals, and calorie target</span></button><button class="secondary-button" data-close>Close</button></div></div>`);
}

function render() {
  renderDashboard(); renderToday(); renderNutrition(); renderGut(); renderWorkouts(); renderProgress(); renderCheckins(); renderCoach(); renderSettings();
  document.querySelectorAll(".page").forEach(el=>el.classList.toggle("active",el.dataset.page===activePage));
  document.querySelectorAll(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.nav===activePage));
  document.querySelector("#pageTitle").textContent=pageTitles[activePage];
}
function go(page) {
  if (page==="more") return renderMoreModal();
  activePage=page; document.querySelector("#modal").close(); render(); window.scrollTo({top:0,behavior:"smooth"});
}
function toast(text) { const el=document.querySelector("#toast"); el.textContent=text; el.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2200); }
function modal(html) { const el=document.querySelector("#modal"); el.innerHTML=`<div id="modalContent">${html}</div>`; el.showModal(); }
function setDeep(obj, path, value) { const parts=path.split("."); const last=parts.pop(); const target=parts.reduce((x,k)=>x[k],obj); target[last]=value; }
function coerce(input) {
  if (input.tagName==="SELECT" && ["true","false"].includes(input.value)) return input.value==="true";
  if (input.type==="number") return input.value===""?"":num(input.value);
  return input.value;
}

document.addEventListener("click", e => {
  const nav=e.target.closest("[data-nav]"), goButton=e.target.closest("[data-go]");
  if(nav) go(nav.dataset.nav); if(goButton) go(goButton.dataset.go);
  if(e.target.matches("[data-close]")) document.querySelector("#modal").close();
  if(e.target.matches("[data-habit]")) { dayLog().habits[e.target.dataset.habit]=e.target.checked; saveState(); render(); }
  if(e.target.matches("[data-exercise]")) { dayLog().exercises[e.target.dataset.exercise]=e.target.checked; saveState(); render(); }
  if(e.target.matches("[data-quick-meal]")) addMeal(QUICK_MEALS[num(e.target.dataset.quickMeal)]);
  if(e.target.matches("[data-remove-meal]")) { const log=dayLog(), meal=log.meals.splice(num(e.target.dataset.removeMeal),1)[0]; ["calories","protein","fiber","carbs","fat"].forEach((key,index)=>log[key]=Math.max(0,num(log[key])-num(meal[key]))); saveState(); render(); }
  if(e.target.matches("[data-checkin]")) checkinModal(num(e.target.dataset.checkin));
  if(e.target.matches("[data-mic]")) startDictation(e.target.dataset.mic);
  if(e.target.matches("[data-action]")) handleAction(e.target.dataset.action);
});
document.addEventListener("change", e => {
  if(e.target.matches("[data-field]")) {
    const key=e.target.dataset.field, value=coerce(e.target);
    if(key.startsWith("settings.")) setDeep(state,key,value); else dayLog()[key]=value;
    saveState(); render();
  }
  if(e.target.matches("[data-photo]") && e.target.files[0]) storePhoto(e.target.dataset.photo,e.target.files[0]);
});
document.addEventListener("submit", e => {
  if(e.target.id==="checkinForm") {
    e.preventDefault(); const form=e.target, day=num(form.dataset.day), data={};
    form.querySelectorAll("[data-field]").forEach(input=>data[input.dataset.field]=coerce(input));
    state.checkins[day]=data; saveState(); document.querySelector("#modal").close(); toast(`Day ${day} official check-in saved`); render();
  }
});
document.querySelector("#quickModeButton").addEventListener("click",()=>{quickMode=!quickMode; document.querySelector("#quickModeButton").textContent=quickMode?"Full check-in":"Quick mode"; renderToday();});
document.querySelector("#notificationButton").addEventListener("click",()=>handleAction("notifications"));

function handleAction(action) {
  if(action==="reset") modal(`<div class="modal-body"><p class="eyebrow">EMERGENCY RESET</p><h2>Okay. The day is not ruined.</h2><p>Complete the reset three:</p><div class="card"><strong>1. Drink 24 oz water</strong><br><strong>2. Eat protein</strong><br><strong>3. Walk 15 minutes</strong></div><div class="modal-actions"><button class="secondary-button" data-close>Close</button><button class="button" data-action="complete-reset">Mark reset complete</button></div></div>`);
  if(action==="complete-reset") { dayLog().reset=true; saveState(); document.querySelector("#modal").close(); toast("Reset complete. That counts."); render(); }
  if(action==="custom-meal") modal(`<div class="modal-body"><p class="eyebrow">CUSTOM MEAL</p><h2>Add a meal</h2><form id="customMealForm"><div class="form-grid">${field("Meal name","name","","text")}${field("Meal type","type","Meal","text")}${field("Calories","calories","")}${field("Protein g","protein","")}${field("Fiber g","fiber","")}${field("Carbs g","carbs","")}${field("Fat g","fat","")}${noteField("Meal notes","mealNotes","")}</div><div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Add meal</button></div></form></div>`);
  if(action==="random-weight") modal(`<div class="modal-body"><p class="eyebrow">PRIVATE RANDOM WEIGH-IN</p><h2>This is not an official check-in day.</h2><p>Daily scale changes can be water, sodium, constipation, sleep, or hormones. Do you still want to log this as a private random weigh-in?</p><form id="randomWeightForm"><div class="spacer"></div>${field("Private weight","privateWeight","","number",'step="0.1"')}<div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Log privately</button></div></form></div>`);
  if(action==="copy-summary") navigator.clipboard.writeText(summary()).then(()=>toast("Summary copied for ChatGPT"));
  if(action==="notifications") requestNotifications();
  if(action==="samples") { loadSamples(); toast("Sample data loaded"); render(); }
  if(action==="clear-data") modal(`<div class="modal-body"><h2>Clear all local data?</h2><p>This removes daily logs, meals, check-ins, private weigh-ins, and settings from this browser.</p><div class="modal-actions"><button class="secondary-button" data-close>Cancel</button><button class="danger-button" data-action="confirm-clear">Clear everything</button></div></div>`);
  if(action==="confirm-clear") { localStorage.removeItem(STORAGE_KEY); state=createDefaultState(); saveState(); document.querySelector("#modal").close(); toast("Tracker cleared"); render(); }
}
document.addEventListener("submit",e=>{
  if(e.target.id==="customMealForm"){e.preventDefault();const d={};e.target.querySelectorAll("[data-field]").forEach(x=>d[x.dataset.field]=coerce(x));addMeal([d.name||"Custom meal",d.type||"Meal",num(d.calories),num(d.protein),num(d.fiber),num(d.carbs),num(d.fat)]);document.querySelector("#modal").close();}
  if(e.target.id==="randomWeightForm"){e.preventDefault();state.randomWeights.push({date:todayKey(),weight:num(e.target.querySelector("[data-field=privateWeight]").value)});saveState();document.querySelector("#modal").close();toast("Stored privately");render();}
});

function startDictation(fieldId) {
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition) return toast("Speech-to-text is not supported in this browser.");
  const recognition=new SpeechRecognition(); recognition.lang="en-US"; recognition.interimResults=false;
  recognition.onstart=()=>toast("Listening…");
  recognition.onresult=event=>{const target=document.querySelector(`#${fieldId}`);if(target){target.value=`${target.value} ${event.results[0][0].transcript}`.trim();target.dispatchEvent(new Event("change",{bubbles:true}));}};
  recognition.onerror=()=>toast("I could not capture that. Try again."); recognition.start();
}
function requestNotifications() {
  if(!("Notification" in window)) return toast("Browser reminders are not supported here.");
  Notification.requestPermission().then(permission=>{ if(permission==="granted"){ new Notification("Snatched Tracker",{body:"Reminders enabled. Water, protein, fiber, steps, then done."}); toast("Browser reminders enabled"); } else toast("Reminder permission was not enabled."); });
}

function openPhotoDB() {
  return new Promise((resolve,reject)=>{ const request=indexedDB.open("kenna-snatched-photos",1); request.onupgradeneeded=()=>request.result.createObjectStore("photos"); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
}
async function storePhoto(key,file) {
  try { const db=await openPhotoDB(); const tx=db.transaction("photos","readwrite"); tx.objectStore("photos").put(file,key); tx.oncomplete=()=>toast("Photo saved locally on this device"); }
  catch { toast("Photo preview selected, but local photo storage is unavailable."); }
}
function loadSamples() {
  for(let i=0;i<9;i++){const d=parseDate(state.settings.startDate);d.setDate(d.getDate()+i);const key=localISO(d);state.daily[key]={habits:{waterGoal:true,proteinGoal:true,plannedLunch:true,workout:i%3!==2,bowelMovement:true},calories:1680+i*22,protein:132+i*2,fiber:21+(i%4),water:88+i*2,steps:8200+i*240,activeCalories:310+i*11,exerciseMinutes:35+(i%3)*10,sleep:6.5+(i%4)*.3,workoutCompleted:i%3!==2,poop:i%4===0?"no":"yes",bowelType:i%4===0?"none":"normal",bloating:6-(i%3),constipation:5-(i%3),energy:6+i%3,mood:7,cravings:4,reset:false,meals:[],exercises:{}};}
  state.checkins[1]={weight:180,waist:34.5,hips:44,thigh:25,arm:13.5,wins:"Started with a clear plan."};
  state.checkins[9]={weight:177.8,waist:33.8,hips:43.5,thigh:24.8,arm:13.4,wins:"Meal prep made protein easier."};
  state.samplesLoaded=true; saveState();
}

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
if(!localStorage.getItem(STORAGE_KEY)) loadSamples();
render();
