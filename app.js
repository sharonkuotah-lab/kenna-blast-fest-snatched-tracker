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
const DEFAULT_SAVED_MEALS = [
  { id:"eggs-base", name:"Eggs + Egg Whites Base", category:"breakfast", calories:220, protein:25, fiber:0, carbs:2, fat:12, sodium:"", ingredients:["2 eggs","1/3 cup egg whites"], notes:"Base breakfast. Customize with add-ons depending on hunger.", tags:["breakfast","high protein","quick","favorite"], favorite:true, addons:[
    {name:"Avocado", calories:120, protein:2, fiber:5, carbs:6, fat:11},
    {name:"Banana", calories:105, protein:1, fiber:3, carbs:27, fat:0},
    {name:"Cheese", calories:110, protein:7, fiber:0, carbs:1, fat:9},
    {name:"Toast", calories:100, protein:4, fiber:2, carbs:18, fat:1},
    {name:"Fruit", calories:80, protein:1, fiber:3, carbs:20, fat:0},
    {name:"Coffee", calories:30, protein:0, fiber:0, carbs:5, fat:1},
    {name:"Green tea", calories:0, protein:0, fiber:0, carbs:0, fat:0}
  ]},
  { id:"eggs-avocado", name:"Eggs + Egg Whites + Avocado", category:"breakfast", calories:340, protein:27, fiber:5, carbs:8, fat:23, sodium:"", ingredients:["2 eggs","1/3 cup egg whites","Avocado"], notes:"Higher-fat breakfast that keeps fullness up.", tags:["breakfast","high protein","favorite"], favorite:true, addons:[] },
  { id:"protein-shake-fruit", name:"Protein Shake + Fruit", category:"snack", calories:280, protein:32, fiber:6, carbs:30, fat:5, sodium:"", ingredients:["Protein powder","Fruit","Water or milk"], notes:"Fast protein when meals are delayed.", tags:["high protein","quick","snack","favorite"], favorite:true, addons:[] },
  { id:"kefir-smoothie", name:"Kefir + Chia/Flax Smoothie", category:"snack", calories:320, protein:24, fiber:11, carbs:35, fat:10, sodium:"", ingredients:["Kefir","Chia seeds","Flax seeds","Fruit"], notes:"Gut-health smoothie. Increase fiber slowly.", tags:["high protein","quick","favorite"], favorite:true, addons:[] },
  { id:"wf-chicken-rice-broccoli", name:"Whole Foods Chicken + Rice + Broccoli", category:"lunch", calories:540, protein:48, fiber:7, carbs:58, fat:14, sodium:"", ingredients:["Chicken","Rice","Broccoli"], notes:"Easy class-day lunch.", tags:["Whole Foods","high protein","favorite"], favorite:true, addons:[] },
  { id:"wf-salmon-potatoes", name:"Whole Foods Salmon + Potatoes + Green Beans", category:"dinner", calories:610, protein:43, fiber:8, carbs:52, fat:25, sodium:"", ingredients:["Salmon","Potatoes","Green beans"], notes:"Repeatable dinner.", tags:["Whole Foods","high protein","favorite"], favorite:true, addons:[] },
  { id:"wf-turkey-bowl", name:"Whole Foods Turkey Bowl", category:"lunch", calories:520, protein:46, fiber:9, carbs:55, fat:13, sodium:"", ingredients:["Turkey","Rice","Vegetables"], notes:"Simple meal-prep bowl.", tags:["Whole Foods","high protein","quick"], favorite:false, addons:[] },
  { id:"wf-chicken-mash", name:"Whole Foods Chicken + Mashed Potatoes + Green Beans", category:"dinner", calories:570, protein:45, fiber:7, carbs:55, fat:17, sodium:"", ingredients:["Chicken","Mashed potatoes","Green beans"], notes:"Comfort meal that still hits protein.", tags:["Whole Foods","high protein"], favorite:false, addons:[] },
  { id:"wf-orange-chicken", name:"Whole Foods Orange Chicken + Rice + Broccoli", category:"dinner", calories:760, protein:34, fiber:6, carbs:88, fat:27, sodium:"", ingredients:["Orange chicken","Rice","Broccoli"], notes:"Higher calorie. Use when planned, not random.", tags:["Whole Foods","higher calorie"], favorite:false, addons:[] },
  { id:"chips-serving", name:"Tortilla Chips Serving", category:"snack", calories:210, protein:3, fiber:2, carbs:28, fat:10, sodium:"", ingredients:["Tortilla chips"], notes:"Log the serving and move on.", tags:["snack","quick"], favorite:false, addons:[] },
  { id:"coffee", name:"Cappuccino / Coffee", category:"drink", calories:30, protein:0, fiber:0, carbs:5, fat:1, sodium:"", ingredients:["Coffee"], notes:"Adjust if milk or syrup changes.", tags:["drink","quick"], favorite:false, addons:[] },
  { id:"green-tea-honey", name:"Green Tea with Ginger + Honey", category:"drink", calories:35, protein:0, fiber:0, carbs:9, fat:0, sodium:"", ingredients:["Green tea","Ginger","Honey"], notes:"Hydration-friendly warm drink.", tags:["drink","quick"], favorite:false, addons:[] }
];
const DEFAULT_SETTINGS = {
  name: "Kenna / Sharon", startDate: "2026-06-02", endDate: "2026-07-18", eventName: "Blast Fest",
  miniEventDate: "2026-06-19", miniEventName: "Seattle Concert", heightFeet: 5, heightInches: 8, height: 68,
  age: 25, sex: "female", startWeight: 180, goalWeight: 170,
  activity: "moderate", intensity: "aggressive", waterGoal: 100, proteinGoal: 140,
  fiberGoal: 25, stepGoal: 10000, calorieTarget: 1750, deficitTarget: 650, units: "US"
};
const STARTING_BASELINE = {
  weight: 183.6, bodyFat: 31.7, skeletalMuscle: 39.8, waist: 30.08, abdomen: 37.52,
  hips: 47.56, bmr: 1598, bodyWater: 46.9, visceralFat: 10
};
const WHOLE_FOODS_DEFAULTS = [
  { name:"Chicken + Rice + Broccoli", calories:540, protein:48, fiber:7, carbs:58, fat:14, sodium:"", price:"", notes:"Easy class-day lunch", rating:5, favorite:true },
  { name:"Salmon + Potatoes + Green Beans", calories:610, protein:43, fiber:8, carbs:52, fat:25, sodium:"", price:"", notes:"Repeatable dinner", rating:5, favorite:true },
  { name:"Turkey Bowl + Rice + Vegetables", calories:520, protein:46, fiber:9, carbs:55, fat:13, sodium:"", price:"", notes:"Simple meal-prep bowl", rating:5, favorite:true }
];
const GROCERY_DEFAULTS = ["Eggs","Egg whites","Chicken","Salmon","Turkey","Rice","Potatoes","Broccoli","Green beans","Spinach","Kale","Pineapple","Chia seeds","Flax seeds","Kefir","Greek yogurt","Protein powder","Tea","Water / electrolytes"];
const ROUTINES = {
  0:["Reset Day",["Grocery planning","Meal prep","Long walk or gym","Plan the week"],["Morning water","Plan groceries","Meal prep block","Long walk","Night check-in"]],
  1:["Off Day",["Workout","Flexible errands or content","Hit your steps"],["Morning water","Workout","Steps finish","Night check-in"]],
  2:["Prep Day",["Workout","Reset meals and water","Prep outfits and gym plan"],["Morning water","Workout","School-week prep","Night check-in"]],
  3:["Class Day",["Breakfast before class","Pack meal prep and water","Lunch around 12-1","Gym around 4 if possible","Finish steps"],["6 AM breakfast","Pack meal prep","12 PM lunch","3:30 PM gym","Evening check-in"]],
  4:["Clinical Day",["Gym before clinical","Meal prep before shift","Protein before shift","Hydration during clinical"],["Late-morning hydration","Eat before clinical","Pack meal prep","Protein before shift","Post-clinical recovery note"]],
  5:["Clinical Recovery Day",["Steps and walking","Food and water","Sleep recovery","No pressure for gym"],["Late-morning hydration","Eat before clinical","Pack meal prep","Protein before shift","Post-clinical recovery note"]],
  6:["Off Day",["Main workout or long walk","Meal prep or grocery planning","Keep structure simple"],["Morning water","Workout or long walk","Steps","Night check-in"]]
};
const pageTitles = { dashboard:"Dashboard", today:"Today", nutrition:"Nutrition + Gut", gut:"Gut Health", workouts:"Workouts", progress:"Progress", checkins:"Check-Ins", coach:"AI Coach", settings:"Settings" };

let state = loadState();
let activePage = "dashboard";
let quickMode = false;
let nutritionTab = "meals";
let workoutDay = null;

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
  return { settings: { ...DEFAULT_SETTINGS }, baseline: { ...STARTING_BASELINE }, daily: {}, checkins: {}, randomWeights: [], favorites: [], savedMeals: DEFAULT_SAVED_MEALS.map(cloneMealTemplate), wholeFoodsMeals: WHOLE_FOODS_DEFAULTS.map(x=>({...x})), groceries: GROCERY_DEFAULTS.map(name=>({name,done:false})), extraEvents: [], coachNotes: [], reminders: true, samplesLoaded: false };
}
function loadState() {
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)), base=createDefaultState(), merged={...base,...saved,settings:{...base.settings,...(saved?.settings||{})}};
    merged.baseline={...base.baseline,...(saved?.baseline||{})};
    merged.wholeFoodsMeals=(saved?.wholeFoodsMeals||base.wholeFoodsMeals).map(x=>({...x}));
    merged.savedMeals=mergeSavedMeals(saved?.savedMeals, base.savedMeals);
    merged.settings.heightFeet=num(merged.settings.heightFeet,Math.floor(num(merged.settings.height,68)/12));
    merged.settings.heightInches=num(merged.settings.heightInches,num(merged.settings.height,68)%12);
    merged.settings.height=merged.settings.heightFeet*12+merged.settings.heightInches;
    return merged;
  }
  catch { return createDefaultState(); }
}
function cloneMealTemplate(meal) { return {...meal, ingredients:[...(meal.ingredients||[])], tags:[...(meal.tags||[])], addons:(meal.addons||[]).map(x=>({...x}))}; }
function mergeSavedMeals(savedMeals, defaults) {
  const list=(savedMeals||[]).map(cloneMealTemplate), ids=new Set(list.map(x=>x.id));
  defaults.forEach(meal=>{ if(!ids.has(meal.id)) list.push(cloneMealTemplate(meal)); });
  return list;
}
function mealId() { return `meal-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function mealTemplateFromLegacy(m) {
  return { id:mealId(), name:m.name, category:m.category||m.type||"meal", calories:num(m.calories), protein:num(m.protein), fiber:num(m.fiber), carbs:num(m.carbs), fat:num(m.fat), sodium:m.sodium||"", ingredients:m.ingredients||[], notes:m.notes||"", tags:m.tags||[], favorite:Boolean(m.favorite), addons:m.addons||[], useCount:num(m.useCount), lastUsed:m.lastUsed||"" };
}
function loggedMealFromTemplate(template, overrides={}) {
  return { logId:mealId(), templateId:template.id||"", name:template.name, type:template.category||"meal", category:template.category||"meal", calories:num(template.calories), protein:num(template.protein), fiber:num(template.fiber), carbs:num(template.carbs), fat:num(template.fat), sodium:template.sodium||"", ingredients:[...(template.ingredients||[])], notes:template.notes||"", tags:[...(template.tags||[])], addons:[], photoKey:template.photoKey||"", ...overrides };
}
function recalcMealTotals(log=dayLog()) {
  ["calories","protein","fiber","carbs","fat"].forEach(key=>log[key]=(log.meals||[]).reduce((sum,meal)=>sum+num(meal[key]),0));
}
function sortedSavedMeals() {
  return [...(state.savedMeals||[])].sort((a,b)=>
    Number(Boolean(b.favorite))-Number(Boolean(a.favorite)) ||
    String(b.lastUsed||"").localeCompare(String(a.lastUsed||"")) ||
    num(b.useCount)-num(a.useCount) ||
    a.name.localeCompare(b.name)
  );
}
function findSavedMeal(id) { return (state.savedMeals||[]).find(x=>x.id===id); }
function touchTemplate(id) { const m=findSavedMeal(id); if(m){ m.lastUsed=todayKey(); m.useCount=num(m.useCount)+1; } }
function addMealObject(meal, {touch=true}={}) {
  const log=dayLog(); log.meals ||= [];
  log.meals.push({...meal, logId:meal.logId||mealId()});
  if(touch && meal.templateId) touchTemplate(meal.templateId);
  recalcMealTotals(log); saveState(); toast(`${meal.name} logged`); render();
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
  return logs.length ? logs.at(-1).weight : state.baseline.weight || state.settings.startWeight;
}
function officialCheckins() { return CHECKIN_DAYS.map(day=>({day,...(state.checkins[day]||{})})).filter(x=>num(x.weight)); }
function dailyEntries(limit = 45) {
  return Object.entries(state.daily).sort(([a], [b]) => a.localeCompare(b)).slice(-limit).map(([date, log]) => ({ date, ...log }));
}
function hasLogData(log) { return ["calories","protein","fiber","water","steps","sleep","notes","gutNotes"].some(key=>log[key]) || log.reset || log.workoutCompleted || Object.values(log.habits||{}).some(Boolean) || (log.meals||[]).length; }
function trendEntries() { return dailyEntries().filter(hasLogData); }
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
function forecast() {
  const checkins=officialCheckins(), current=num(latestOfficialWeight()), remaining=Math.max(1,daysRemaining(state.settings.endDate)), goal=num(state.settings.goalWeight);
  const logs=dailyEntries(9).filter(hasLogData), averageDeficit=avg(logs,deficit);
  let weeklyRate=averageDeficit ? round((averageDeficit*7)/3500,2) : 0;
  if(checkins.length>=2) {
    const first=checkins[0], latest=checkins.at(-1), elapsed=Math.max(1,first.day===latest.day ? latest.day-1 : latest.day-first.day);
    weeklyRate=round(((num(first.weight)-num(latest.weight))*7)/elapsed,2);
  }
  const estimated=round(current-(weeklyRate*remaining/7),1), needed=round(Math.max(0,current-goal)*7/remaining,2);
  const difference=estimated-goal;
  const pace=difference<=-1 ? "Ahead of goal" : difference<=1 ? "On track" : difference<=3 ? "Slightly behind" : "Significantly behind";
  const recommendation=weeklyRate>=needed ? "Keep the routine steady. Consistency is doing the work." : smartPriority(logs).recommendation;
  return { current, estimated, needed, weeklyRate, pace, recommendation };
}
function smartPriority(logs=dailyEntries(7).filter(hasLogData)) {
  if(!logs.length) return { title:"Start with the basics", body:"Your first few logs will reveal the pattern. Today: water, protein, steps, and one meal you planned.", recommendation:"Log the basics today so your forecast can become personal." };
  const protein=avg(logs,"protein"), steps=avg(logs,"steps"), calories=avg(logs,"calories"), loggedDays=logs.length, workouts=logs.filter(x=>x.workoutCompleted).length;
  const weekends=logs.filter(x=>[0,6].includes(parseDate(x.date).getDay())), weekdays=logs.filter(x=>![0,6].includes(parseDate(x.date).getDay()));
  if(loggedDays<5) return { title:"Consistency is the priority", body:`You logged ${loggedDays}/7 recent days. A quick log still counts.`, recommendation:"Use the 30-second Quick Log daily, even when the day is imperfect." };
  if(protein<num(state.settings.proteinGoal)*.8) return { title:"Protein is the priority", body:`Your average is ${protein}g. Your goal is ${state.settings.proteinGoal}g.`, recommendation:"Build breakfast and your next meal around protein before snacks." };
  if(steps<num(state.settings.stepGoal)*.75) return { title:"Steps are the priority", body:`Your average is ${Math.round(steps).toLocaleString()}. Your goal is ${num(state.settings.stepGoal).toLocaleString()}.`, recommendation:"Increase average steps with a 20-minute treadmill walk or evening walk." };
  if(weekends.length&&weekdays.length&&avg(weekends,"calories")>avg(weekdays,"calories")*1.2) return { title:"Weekend structure is the priority", body:"Your calories rise noticeably on weekends.", recommendation:"Pre-plan one protein meal and one walk before the weekend starts." };
  if(workouts<3) return { title:"Movement rhythm is the priority", body:`You completed ${workouts} workout${workouts===1?"":"s"} in your recent logs.`, recommendation:"Choose the next realistic workout slot now and keep it simple." };
  if(calories&&calories>num(state.settings.calorieTarget)+250) return { title:"Meal simplicity is the priority", body:`Your calorie average is ${calories}, above your ${state.settings.calorieTarget} target.`, recommendation:"Repeat your easiest meal-prep day and pre-log the next meal." };
  return { title:"Protect the rhythm", body:"Your fundamentals are lining up. Keep the next day repeatable.", recommendation:"Keep protein, water, steps, and sleep steady." };
}
function weeklyReview() {
  const logs=dailyEntries(7).filter(hasLogData), priority=smartPriority(logs);
  if(!logs.length) return { logs, wins:["Your tracker is ready for Day 1."], bottleneck:"No pattern yet.", focus:"Log the basics for a few days. The app will adjust with you.", note:"Start simple. You do not need a perfect first week." };
  const proteinHits=logs.filter(x=>num(x.protein)>=num(state.settings.proteinGoal)).length, workouts=logs.filter(x=>x.workoutCompleted).length;
  return { logs, wins:[`Hit protein goal ${proteinHits}/${logs.length} logged days`,`Completed ${workouts} workout${workouts===1?"":"s"}`,`Logged ${logs.length}/7 recent days`], bottleneck:priority.body, focus:priority.recommendation, note:`${priority.title}. ${priority.recommendation}` };
}
function previousExerciseDetail(key, date=todayKey()) {
  const prior=dailyEntries().filter(x=>x.date<date).reverse().find(x=>x.workoutDetails?.[key]?.weight);
  return prior?.workoutDetails?.[key] || null;
}
function todayFocus(log) {
  const routine=routineToday();
  if (routine[0]==="Class Day") return "Pack meal prep, fill your water bottle, eat lunch, then gym or steps after class.";
  if (routine[0].includes("Clinical")) return "Eat and hydrate before clinical. Pack protein and protect your recovery.";
  if (routine[0]==="Reset Day") return "Reset gently: groceries, meal prep, a long walk, and your plan for the week.";
  if (pct(log.water, state.settings.waterGoal) < 50) return "Start with water. Hydration makes every other choice easier.";
  if (pct(log.protein, state.settings.proteinGoal) < 55) return "Build the next meal around protein before snacks.";
  if (pct(log.steps, state.settings.stepGoal) < 60) return "A short walk is the fastest way to build momentum.";
  return "Keep it steady. Finish the basics and let consistency do the work.";
}
function routineToday(date=todayKey()) { return ROUTINES[parseDate(date).getDay()] || ROUTINES[1]; }
function routineCard() { const [type,priorities,reminders]=routineToday(); return `<div class="card"><div class="row"><div><p class="eyebrow">TODAY'S SCHEDULE TYPE</p><h3>${type}</h3></div><span class="pill">${formatDate(todayKey())}</span></div><div class="chip-row">${priorities.map(x=>`<span class="meal-chip">${x}</span>`).join("")}</div><details><summary>Routine reminders</summary><div class="detail-body">${reminders.map(x=>`<p class="tiny">○ ${x}</p>`).join("")}</div></details></div>`; }
function phase() {
  const current = todayKey();
  if (current >= "2026-07-11" && current <= "2026-07-18") return "Final Week";
  if (current >= "2026-06-16" && current <= "2026-06-19") return "Concert Week";
  return `Cycle ${Math.ceil(getDayNumber() / 9)}`;
}

function progressRow(label, value, goal, unit = "") {
  return `<div><div class="row"><strong>${label}</strong><span class="tiny">${num(value)} / ${goal}${unit}</span></div><div class="progress"><span style="width:${pct(value, goal)}%"></span></div></div>`;
}
function mic(fieldId) { return `<button type="button" class="mic-button" data-mic="${fieldId}" aria-label="Talk it out">🎤</button>`; }
function field(label, key, value = "", type = "number", extra = "") {
  return `<label>${label}<input type="${type}" data-field="${key}" value="${value ?? ""}" ${extra}></label>`;
}
function selectField(label, key, value, choices) {
  return `<label>${label}<select data-field="${key}">${choices.map(x => { const option=Array.isArray(x)?x:[x,x]; return `<option value="${option[0]}" ${String(value) === String(option[0]) ? "selected" : ""}>${option[1]}</option>`; }).join("")}</select></label>`;
}
function yesNoField(label,key,value) { return selectField(label,key,String(Boolean(value)),[["false","No"],["true","Yes"]]); }
function completeField(label,key,value) { return selectField(label,key,String(Boolean(value)),[["false","Not complete"],["true","Complete"]]); }
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
  const workout = WORKOUTS[workoutIndex()][0], outlook=forecast(), review=weeklyReview(), priority=smartPriority();
  const events=[{name:state.settings.miniEventName,date:state.settings.miniEventDate},{name:state.settings.eventName,date:state.settings.endDate},...(state.extraEvents||[])].filter(x=>x.date>=todayKey()).sort((a,b)=>a.date.localeCompare(b.date));
  const nextEvent=events[0]||{name:state.settings.eventName,date:state.settings.endDate};
  const missions=[["Protein",pct(log.protein,state.settings.proteinGoal)>=100],["Water",pct(log.water,state.settings.waterGoal)>=100],["Workout",Boolean(log.workoutCompleted||log.activeRecovery)],["Steps",pct(log.steps,state.settings.stepGoal)>=100],["Sleep",num(log.sleep)>=7]];
  document.querySelector("#dashboardContent").innerHTML = `
    ${state.samplesLoaded ? `<div class="card protocol"><div class="row"><div><p class="eyebrow">PREVIEW DATA</p><p class="tiny">Sample logs are loaded so you can explore the app. Clear them in Settings when you are ready to begin.</p></div><button class="secondary-button" data-go="settings">Settings</button></div></div>` : ""}
    <div class="card hero-card command-hero">
      <p class="eyebrow" style="color:#f7d9d7">${phase()} · KENNA'S COMMAND CENTER</p><h2 class="hero-title">Day ${getDayNumber()} <em>of</em> 45</h2>
      <div class="hero-metrics"><div><strong>${daysRemaining(state.settings.endDate)}</strong><span>days to Blast Fest</span></div><div><strong>${outlook.estimated}</strong><span>forecast lbs</span></div><div><strong>Day ${check}</strong><span>next check-in</span></div></div>
    </div>
    <div class="card mission-card"><div class="row"><div><p class="eyebrow">TODAY'S MISSION</p><h3 style="margin-top:5px">${todayFocus(log)}</h3></div><div class="mini-score"><strong>${snatched}</strong><span>score</span></div></div><div class="mission-grid">${missions.map(([name,done])=>`<span class="${done?"done":""}">${done?"✓":"○"} ${name}</span>`).join("")}</div></div>
    <div class="quick-actions"><button data-action="quick-log"><span>🎤</span>Quick log</button><button data-go="nutrition"><span>📸</span>Meal photo</button><button data-go="workouts"><span>🏋</span>Workout</button><button data-go="checkins"><span>⚖</span>Check-in</button><button data-go="coach"><span>✦</span>Ask coach</button></div>
    ${protocolCard()}
    <button class="card movement-card" data-go="workouts"><span><span class="eyebrow">TODAY'S MOVEMENT</span><strong>${workout}</strong><small>${log.workoutCompleted ? "Complete. Nice work." : "Tap to open today's exercises"}</small></span><span class="movement-arrow">→</span></button>
    <div class="card forecast-card"><div class="row"><div><p class="eyebrow">SNATCHED FORECAST</p><h3>Estimated ${formatDate(state.settings.endDate)} weight</h3></div><span class="pill">${outlook.pace}</span></div><div class="forecast-main"><strong>${outlook.estimated}</strong><span>lbs</span></div><div class="forecast-meta"><span>Need <b>${outlook.needed}</b> lbs/week</span><span>Current <b>${outlook.weeklyRate}</b> lbs/week</span></div><p class="tiny">${outlook.recommendation}</p></div>
    <div class="card weekly-card"><div class="row"><div><p class="eyebrow">WEEKLY PROGRESS</p><h3>${review.logs.length ? "Protect the rhythm" : "Your transformation starts here"}</h3></div><div class="ring micro-ring" style="--value:${Math.round(avg(review.logs,score))}" data-label="${Math.round(avg(review.logs,score))||0}"></div></div><p class="muted">${priority.body}</p></div>
    <div class="card"><div class="row"><div><p class="eyebrow">NEXT EVENT</p><h3>${nextEvent.name}</h3></div><span class="pill">${daysRemaining(nextEvent.date)} days</span></div><p class="muted">${formatDate(nextEvent.date)}${nextEvent.notes?` · ${nextEvent.notes}`:""}</p></div>
    <details class="card"><summary>Calories</summary><div class="detail-body"><div class="metric-grid"><div class="metric"><small>Eaten</small><strong>${num(log.calories)}</strong></div><div class="metric"><small>Est. burn</small><strong>${burned(log)}</strong></div><div class="metric"><small>Deficit</small><strong>${deficit(log)}</strong></div></div>${calorieSummary()}</div></details>
    <details class="card"><summary>Gut health</summary><div class="detail-body"><p class="muted">Gut score ${gut}/100</p>${progressRow("Water",log.water,state.settings.waterGoal," oz")}${progressRow("Protein",log.protein,state.settings.proteinGoal,"g")}${progressRow("Steps",log.steps,state.settings.stepGoal)}${progressRow("Fiber", log.fiber, state.settings.fiberGoal, "g")}<div class="spacer"></div><button class="secondary-button" data-go="gut">Open gut log</button></div></details>
    <details class="card"><summary>Trends + check-ins</summary><div class="detail-body"><p class="muted">Next official check-in: Day ${check} · ${formatDate(challengeDate(check))}</p><div class="action-row"><button class="secondary-button" data-go="progress">Progress</button><button class="secondary-button" data-go="checkins">Check-ins</button></div></div></details>
    <details class="card"><summary>Schedule + reminders</summary><div class="detail-body">${routineCard()}${events.map(x=>`<p class="tiny">○ ${formatDate(x.date)} · ${x.name}</p>`).join("")}<button class="secondary-button" data-action="notifications">Browser reminders</button></div></details>
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
    ${routineCard()}
    <div class="card"><h3>Daily checklist</h3>${habitHTML}</div>
    <div class="card ${quickMode ? "" : "hidden"}"><p class="eyebrow">QUICK LOG</p><h3>30-second check-in</h3><p class="tiny">Log the basics and keep moving.</p><div class="spacer"></div><div class="form-grid">${field("Water oz","water",log.water)}${field("Protein g","protein",log.protein)}${field("Fiber g","fiber",log.fiber)}${field("Steps","steps",log.steps)}${field("Calories","calories",log.calories)}${completeField("Workout","workoutCompleted",log.workoutCompleted)}${selectField("Poop today?","poop",log.poop||"no",[["no","No"],["yes","Yes"]])}${field("Bloating 1-10","bloating",log.bloating||5)}${noteField("Quick note","notes",log.notes)}</div></div>
    <div class="card ${quickMode ? "hidden" : ""}"><p class="eyebrow">FULL CHECK-IN</p><h3>Detailed end-of-day review</h3><p class="tiny">Use this when you want the full pattern.</p><div class="spacer"></div><div class="form-grid">
      ${field("Calories consumed","calories",log.calories)}${field("Protein g","protein",log.protein)}${field("Fiber g","fiber",log.fiber)}${field("Water oz","water",log.water)}
      ${field("Steps","steps",log.steps)}${field("Active calories","activeCalories",log.activeCalories)}${field("Exercise minutes","exerciseMinutes",log.exerciseMinutes)}${field("Distance miles","distance",log.distance,"number",'step="0.1"')}
      ${field("Sleep hours","sleep",log.sleep,"number",'step="0.1"')}${completeField("Workout","workoutCompleted",log.workoutCompleted)}
      ${completeField("Cardio","cardio",log.cardio)}${yesNoField("Meal prep eaten","mealPrep",log.mealPrep)}
      ${yesNoField("Dinner completed","dinner",log.dinner)}${yesNoField("Alcohol","alcohol",log.alcohol)}
      ${field("Bloating level 1-10","bloating",log.bloating || 5)}${field("Constipation level 1-10","constipation",log.constipation || 5)}
      ${selectField("Did I poop today?","poop",log.poop || "no",[["no","No"],["yes","Yes"]])}${selectField("Bowel movement type","bowelType",log.bowelType || "none",[["none","None"],["easy","Easy"],["normal","Normal"],["hard","Hard"],["diarrhea","Diarrhea"]])}
      ${field("Energy 1-10","energy",log.energy || 5)}${field("Mood 1-10","mood",log.mood || 5)}${field("Cravings 1-10","cravings",log.cravings || 5)}${field("Stress 1-10","stress",log.stress || 5)}
      ${noteField("Daily notes","notes",log.notes)}
    </div><div class="spacer"></div><button class="secondary-button" data-mic="note-notes">🎤 Talk check-in</button><p class="tiny">Speak naturally. Your transcript saves as a note. Version 1 uses manual Apple Health entry.</p></div>
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
    <div class="subnav">${[["meals","Meals"],["gut","Gut"],["grocery","Grocery"],["wholefoods","Whole Foods"]].map(([key,label])=>`<button class="${nutritionTab===key?"active":""}" data-nutrition-tab="${key}">${label}</button>`).join("")}</div>
    ${nutritionTab==="gut" ? gutPanel(log) : nutritionTab==="grocery" ? groceryPanel() : nutritionTab==="wholefoods" ? wholeFoodsPanel() : `
    <div class="card hero-card"><p class="eyebrow" style="color:#f7d9d7">TODAY'S NOURISHMENT</p><h2>${num(log.calories)} calories</h2><p class="muted">Build the plate around protein. Keep the rest simple.</p><div class="spacer"></div>${progressRow("Protein",log.protein,state.settings.proteinGoal,"g")}</div>
    ${savedMealsPanel()}
    <div class="card"><h3>Meals logged today</h3>${meals.length ? meals.map((m,i)=>`<div class="meal-item row"><div><strong>${m.name}</strong><div class="tiny">${m.category||m.type} · ${m.calories} cal · ${m.protein}g protein · ${m.fiber}g fiber</div>${m.addons?.length?`<div class="chip-row">${m.addons.map(x=>`<span class="meal-chip">+ ${x.name}</span>`).join("")}</div>`:""}</div><div class="meal-actions"><button class="secondary-button" data-edit-logged-meal="${i}">Edit</button><button class="secondary-button" data-remove-meal="${i}">Remove</button></div></div>`).join("") : `<div class="empty">No meals logged yet. Your first meal will show up here.</div>`}</div>
    <div class="card"><p class="eyebrow">PHOTO FOOD LOG</p><h3>Take a quick meal photo</h3><div class="spacer"></div><input type="file" accept="image/*" capture="environment" data-photo="meal-${todayKey()}"><p class="tiny">On mobile, this can open your camera. Photos stay on this device.</p></div>`}
  `;
}
function savedMealsPanel() {
  const meals=sortedSavedMeals();
  return `<div class="card saved-meals-card"><div class="row"><div><p class="eyebrow">MY SAVED MEALS</p><h3>Tap a meal, then log as-is or customize today.</h3></div><button class="secondary-button" data-action="new-saved-meal">+ Meal</button></div><div class="saved-meal-list">${meals.map(meal=>`<button class="saved-meal-card" data-saved-meal="${meal.id}"><span class="library-star">${meal.favorite?"★":"☆"}</span><strong>${meal.name}</strong><small>${meal.category} · used ${num(meal.useCount)}x</small><div class="chip-row"><span class="meal-chip">${num(meal.calories)} cal</span><span class="meal-chip">${num(meal.protein)}g P</span><span class="meal-chip">${num(meal.fiber)}g fiber</span></div>${meal.tags?.length?`<div class="chip-row">${meal.tags.slice(0,4).map(tag=>`<span class="tag-chip">${tag}</span>`).join("")}</div>`:""}</button>`).join("")}</div></div>`;
}
function macroChips(meal) { return `<div class="chip-row"><span class="meal-chip">${num(meal.calories)} cal</span><span class="meal-chip">${num(meal.protein)}g protein</span><span class="meal-chip">${num(meal.fiber)}g fiber</span><span class="meal-chip">${num(meal.carbs)}g carbs</span><span class="meal-chip">${num(meal.fat)}g fat</span></div>`; }
function mealChoiceModal(id) {
  const meal=findSavedMeal(id); if(!meal) return toast("Saved meal not found.");
  modal(`<div class="modal-body"><p class="eyebrow">SAVED MEAL</p><h2>${meal.name}</h2>${macroChips(meal)}<p class="muted">${meal.notes||"No notes yet."}</p>${meal.ingredients?.length?`<div class="chip-row">${meal.ingredients.map(x=>`<span class="tag-chip">${x}</span>`).join("")}</div>`:""}<div class="stack gap" style="margin-top:14px"><button class="button" data-log-as-is="${meal.id}">Log as-is</button><button class="secondary-button" data-customize-meal="${meal.id}">Customize today</button><button class="secondary-button" data-edit-template="${meal.id}">Edit template</button><button class="secondary-button" data-toggle-favorite="${meal.id}">${meal.favorite?"Unmark favorite":"Mark favorite"}</button><button class="danger-button" data-delete-template="${meal.id}">Delete saved meal</button><button class="secondary-button" data-close>Close</button></div></div>`);
}
function mealFormFields(meal, prefix="") {
  return `${field("Meal name",`${prefix}name`,meal.name||"","text")}${selectField("Category",`${prefix}category`,meal.category||"breakfast",["breakfast","lunch","dinner","snack","drink"])}${field("Calories",`${prefix}calories`,meal.calories)}${field("Protein g",`${prefix}protein`,meal.protein)}${field("Fiber g",`${prefix}fiber`,meal.fiber)}${field("Carbs g",`${prefix}carbs`,meal.carbs)}${field("Fat g",`${prefix}fat`,meal.fat)}${field("Sodium optional",`${prefix}sodium`,meal.sodium||"")}<label class="full">Ingredients, one per line<textarea data-field="${prefix}ingredients">${(meal.ingredients||[]).join("\n")}</textarea></label><label class="full">Tags, comma separated<textarea data-field="${prefix}tags">${(meal.tags||[]).join(", ")}</textarea></label><label class="full">Notes<textarea data-field="${prefix}notes">${meal.notes||""}</textarea></label><label class="full">Photo optional<input type="file" accept="image/*" capture="environment" data-photo="saved-meal-${meal.id||"new"}"></label>`;
}
function templateFormModal(id=null) {
  const meal=id?findSavedMeal(id):{id:mealId(),name:"",category:"breakfast",calories:"",protein:"",fiber:"",carbs:"",fat:"",sodium:"",ingredients:[],tags:[],notes:"",favorite:false,addons:[]};
  if(!meal) return toast("Saved meal not found.");
  modal(`<div class="modal-body"><p class="eyebrow">${id?"EDIT TEMPLATE":"NEW SAVED MEAL"}</p><h2>${id?"Update saved meal":"Create meal template"}</h2><form id="savedMealForm" data-template-id="${meal.id}" data-existing="${id?"yes":"no"}"><div class="form-grid">${mealFormFields(meal)}</div><div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Save template</button></div></form></div>`);
}
function customizeMealModal(id, mode="today", logIndex="") {
  const source=mode==="logged" ? dayLog().meals[num(logIndex)] : findSavedMeal(id);
  if(!source) return toast("Meal not found.");
  const meal=mode==="logged" ? {...source, id:source.templateId||""} : loggedMealFromTemplate(source);
  const addons=mode==="logged" ? [] : (source.addons||[]);
  modal(`<div class="modal-body"><p class="eyebrow">${mode==="logged"?"EDIT TODAY'S MEAL":"LOG WITH EDITS"}</p><h2>${meal.name}</h2><form id="mealBuilderForm" data-template-id="${id||meal.templateId||""}" data-mode="${mode}" data-log-index="${logIndex}"><div class="form-grid">${mealFormFields(meal,"meal.")}${field("Portion multiplier","meal.portion",1,"number",'step="0.1"')}</div>${addons.length?`<div class="card compact-card"><p class="eyebrow">OPTIONAL ADD-ONS</p><div class="addon-grid">${addons.map((a,i)=>`<label class="addon-chip"><input type="checkbox" data-addon-choice="${i}" ${meal.addons?.some(x=>x.name===a.name)?"checked":""}><span>${a.name}<small>${a.calories} cal · ${a.protein||0}g P</small></span></label>`).join("")}</div><p class="tiny">Add-on macros are included when you save today’s version.</p></div>`:""}<div id="mealBuilderEstimate" class="feedback">Estimated: ${meal.calories} cal · ${meal.protein}g protein · ${meal.fiber}g fiber</div><div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button>${mode==="logged"?`<button class="button" name="saveMode" value="today">Save today</button>`:`<button class="secondary-button" name="saveMode" value="new">Save as new custom meal</button><button class="secondary-button" name="saveMode" value="update">Update original</button><button class="button" name="saveMode" value="today">Save only for today</button>`}</div></form></div>`);
  updateMealBuilderEstimate();
}
function collectMealForm(form, prefix="") {
  const data={}; form.querySelectorAll("[data-field]").forEach(x=>{ if(!prefix || x.dataset.field.startsWith(prefix)) data[x.dataset.field.replace(prefix,"")]=coerce(x); });
  return { id:form.dataset.templateId||mealId(), name:data.name||"Saved meal", category:data.category||"meal", calories:num(data.calories), protein:num(data.protein), fiber:num(data.fiber), carbs:num(data.carbs), fat:num(data.fat), sodium:data.sodium||"", ingredients:String(data.ingredients||"").split("\n").map(x=>x.trim()).filter(Boolean), notes:data.notes||"", tags:String(data.tags||"").split(",").map(x=>x.trim()).filter(Boolean), favorite:false, addons:[] };
}
function applyAddons(base, form, templateId) {
  const source=findSavedMeal(templateId), addons=source?.addons||[];
  const selected=[...form.querySelectorAll("[data-addon-choice]:checked")].map(x=>addons[num(x.dataset.addonChoice)]).filter(Boolean);
  const portion=num(base.portion,1)||1;
  const meal={...base, calories:round(num(base.calories)*portion), protein:round(num(base.protein)*portion), fiber:round(num(base.fiber)*portion), carbs:round(num(base.carbs)*portion), fat:round(num(base.fat)*portion), addons:selected, availableAddons:addons, ingredients:[...(base.ingredients||[]),...selected.map(x=>x.name)]};
  selected.forEach(addon=>["calories","protein","fiber","carbs","fat"].forEach(key=>meal[key]=round(num(meal[key])+num(addon[key]))));
  delete meal.portion;
  return meal;
}
function updateMealBuilderEstimate() {
  const form=document.querySelector("#mealBuilderForm"), output=document.querySelector("#mealBuilderEstimate");
  if(!form||!output) return;
  const meal=applyAddons(collectMealForm(form,"meal."), form, form.dataset.templateId);
  output.textContent=`Estimated: ${num(meal.calories)} cal · ${num(meal.protein)}g protein · ${num(meal.fiber)}g fiber`;
}
function gutPanel(log) {
  return `<div class="card"><div class="row"><div><p class="eyebrow">GUT HEALTH</p><h2>${gutScore(log)}/100</h2></div><div class="ring soft-ring" style="--value:${gutScore(log)}" data-label="${gutScore(log)}"></div></div></div><div class="card"><div class="form-grid">${field("Water oz","water",log.water)}${field("Fiber g","fiber",log.fiber)}${yesNoField("Vegetables","vegetables",log.vegetables)}${yesNoField("Kefir","kefir",log.kefir)}${yesNoField("Probiotic","probiotic",log.probiotic)}${selectField("Poop today?","poop",log.poop||"no",[["no","No"],["yes","Yes"]])}${field("Bloating 1-10","bloating",log.bloating||5)}${field("Constipation 1-10","constipation",log.constipation||5)}${noteField("Gut notes","gutNotes",log.gutNotes)}</div></div>${feedbackHTML(log)}`;
}
function groceryPanel() {
  return `<div class="card"><p class="eyebrow">GROCERY BUILDER</p><h2>Keep the fridge easy</h2><p class="muted">Tap items as they make it into the cart.</p><div class="spacer"></div>${(state.groceries||[]).map((x,i)=>`<label class="habit"><input type="checkbox" data-grocery="${i}" ${x.done?"checked":""}><span>${x.name}</span></label>`).join("")}<div class="spacer"></div><button class="secondary-button" data-action="add-grocery">+ Add grocery item</button></div>`;
}
function wholeFoodsPanel() {
  const meals=state.wholeFoodsMeals||[];
  return `<div class="card hero-card"><p class="eyebrow" style="color:#f7d9d7">WHOLE FOODS LIBRARY</p><h2>Busy-day favorites</h2><p class="muted">Save repeatable meals so busy days need less thought.</p></div><div class="card"><div class="row"><div><p class="eyebrow">SAVED MEALS</p><h3>Tap once to log</h3></div><button class="secondary-button" data-action="wholefoods-meal">+ Save meal</button></div><div class="library-grid">${meals.length?meals.map((m,i)=>`<button class="library-card" data-wholefood-meal="${i}"><span class="library-star">${m.favorite?"★":"☆"}</span><strong>${m.name}</strong><small>${m.calories} cal · ${m.protein}g protein · ${m.fiber}g fiber</small><span>${m.price?`$${m.price} · `:""}${m.rating||"—"}/5</span></button>`).join(""):`<div class="empty">No Whole Foods meals saved yet. Add your first reliable meal prep.</div>`}</div></div>`;
}
function addMeal(meal) {
  addMealObject({ logId:mealId(), name:meal[0], type:meal[1], category:String(meal[1]||"meal").toLowerCase(), calories:meal[2], protein:meal[3], fiber:meal[4], carbs:meal[5], fat:meal[6], notes:"", rating:5, ingredients:[], tags:[], addons:[] }, {touch:false});
}

function renderGut() {
  document.querySelector("#gutContent").innerHTML = `<div class="card"><p class="muted">Gut tracking now lives beside your meals so food, fiber, water, and digestion stay connected.</p><div class="spacer"></div><button class="button" data-action="open-gut-tab">Open Nutrition + Gut</button></div>${gutPanel(dayLog())}`;
}

function renderWorkouts() {
  const log = dayLog(), currentIndex = workoutIndex(), selected=workoutDay===null?currentIndex:workoutDay;
  log.workoutDetails ||= {}; state.customExercises ||= {};
  const exercises=[...WORKOUTS[selected][1],...(state.customExercises[selected]||[])];
  document.querySelector("#workoutContent").innerHTML = `
    <div class="card hero-card"><p class="eyebrow" style="color:#ffe7e7">TODAY · DAY ${currentIndex + 1} OF 7</p><h2>${WORKOUTS[currentIndex][0]}</h2><p class="muted">Open the plan, track the work, then recover.</p></div>
    <div class="split-scroll">${WORKOUTS.map((x,i)=>`<button class="${i===selected?"active":""}" data-workout-day="${i}"><span>Day ${i+1}</span><strong>${x[0]}</strong></button>`).join("")}</div>
    <div class="card"><div class="row"><div><p class="eyebrow">${selected===currentIndex?"TODAY'S WORKOUT":"WORKOUT TEMPLATE"}</p><h3>${WORKOUTS[selected][0]}</h3></div><button class="secondary-button" data-action="add-exercise">+ Exercise</button></div>${exercises.map((x,i)=>{
        const key=`${selected}-${i}`, detail=log.workoutDetails[key]||{}, previous=previousExerciseDetail(key), name=x.split(" · ")[0], prescription=x.split(" · ")[1]||"", change=previous?.weight&&detail.weight?num(detail.weight)-num(previous.weight):0;
        return `<div class="exercise-card"><label class="habit"><input type="checkbox" data-exercise="${key}" ${log.exercises?.[key] ? "checked" : ""}><span><strong>${name}</strong><small>${prescription}</small></span></label>${previous?.weight?`<div class="overload-note"><span>Last: ${previous.weight} lbs</span><b>${detail.weight?`${change>=0?"↑":"↓"} ${Math.abs(change)} lbs`:"Add today's weight"}</b></div>`:""}<div class="exercise-grid">${field("Sets",`workoutDetails.${key}.sets`,detail.sets)}${field("Reps",`workoutDetails.${key}.reps`,detail.reps)}${field("Weight lbs",`workoutDetails.${key}.weight`,detail.weight)}${field("Notes",`workoutDetails.${key}.notes`,detail.notes,"text")}</div></div>`;
      }).join("")}
      <div class="spacer"></div><div class="form-grid">${completeField("Workout","workoutCompleted",log.workoutCompleted)}${completeField("Cardio","cardio",log.cardio)}</div>
      <div class="spacer"></div>${noteField("Workout notes","workoutNotes",log.workoutNotes)}
    </div>
    <div class="card"><p class="eyebrow">CARDIO FINISHER</p><h3>Optional movement log</h3><div class="form-grid">${selectField("Type","cardioType",log.cardioType||"Treadmill walk",["Treadmill walk","Incline walk","Run / walk intervals","Outdoor walk","Steps finish"])}${field("Duration minutes","cardioMinutes",log.cardioMinutes)}${field("Distance miles","distance",log.distance,"number",'step="0.1"')}${field("Calories if known","cardioCalories",log.cardioCalories)}${completeField("Completed","cardio",log.cardio)}</div></div>
  `;
}

function renderProgress() {
  const logs=trendEntries();
  document.querySelector("#progressContent").innerHTML = `
    <div class="metric-grid">
      <div class="metric"><small>7-day calories</small><strong>${avg(dailyEntries(7),"calories") || "—"}</strong></div>
      <div class="metric"><small>9-day deficit</small><strong>${avg(dailyEntries(9),deficit) || "—"}</strong></div>
      <div class="metric"><small>Streak</small><strong>${streak()}</strong></div>
      <div class="metric"><small>Current cycle</small><strong>${Math.ceil(getDayNumber()/9)}</strong></div>
    </div>
    ${chartCard("Official weight trend", CHECKIN_DAYS.map(day => ({ label:`D${day}`, value:num(state.checkins[day]?.weight) })).filter(x=>x.value), "Official weigh-ins only. Private random weigh-ins never change this chart.")}
    ${chartCard("Waist trend", CHECKIN_DAYS.map(day => ({ label:`D${day}`, value:num(state.checkins[day]?.waist) })).filter(x=>x.value))}
    ${chartCard("Snatched Score", logs.map(x=>({label:formatDate(x.date),value:score(x)})))}
    ${chartCard("Calories consumed", logs.map(x=>({label:formatDate(x.date),value:num(x.calories)})).filter(x=>x.value))}
    ${chartCard("Average calorie deficit", logs.map(x=>({label:formatDate(x.date),value:deficit(x)})).filter(x=>x.value))}
    ${chartCard("Protein", logs.map(x=>({label:formatDate(x.date),value:num(x.protein)})).filter(x=>x.value))}
    ${chartCard("Fiber", logs.map(x=>({label:formatDate(x.date),value:num(x.fiber)})).filter(x=>x.value))}
    ${chartCard("Water", logs.map(x=>({label:formatDate(x.date),value:num(x.water)})).filter(x=>x.value))}
    ${chartCard("Steps", logs.map(x=>({label:formatDate(x.date),value:num(x.steps)})).filter(x=>x.value))}
    ${chartCard("Sleep", logs.map(x=>({label:formatDate(x.date),value:num(x.sleep)})).filter(x=>x.value))}
    ${chartCard("Bloating", logs.map(x=>({label:formatDate(x.date),value:num(x.bloating)})).filter(x=>x.value))}
    ${chartCard("Constipation", logs.map(x=>({label:formatDate(x.date),value:num(x.constipation)})).filter(x=>x.value))}
    ${chartCard("Gut Health Score", logs.map(x=>({label:formatDate(x.date),value:gutScore(x)})))}
    <div class="card"><h3>Challenge calendar</h3><p class="tiny">Tap any day to view its log. Gold dots mark official check-ins. Day 45 is your final measurement; the last two days are your Blast Fest buffer.</p><div class="spacer"></div>${calendarHTML()}</div>
    <div class="card"><h3>Progress badges</h3><div class="row wrap">${badgesHTML()}</div></div>
  `;
}
function chartCard(title, data, note = "") {
  return `<div class="card"><h3>${title}</h3>${note ? `<p class="tiny">${note}</p>` : ""}${data.length ? lineChart(data) : `<div class="empty">No trends yet. Your first trend will appear after your first few logs.</div>`}</div>`;
}
function lineChart(data) {
  const width=500,height=150,pad=18, vals=data.map(x=>x.value), min=Math.min(...vals), max=Math.max(...vals), range=max-min || 1;
  const points=data.map((x,i)=>({x:pad+(i/(Math.max(1,data.length-1)))*(width-pad*2),y:height-pad-((x.value-min)/range)*(height-pad*2),...x}));
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img"><line class="grid" x1="0" y1="${height-pad}" x2="${width}" y2="${height-pad}"/><polyline class="line" points="${points.map(p=>`${p.x},${p.y}`).join(" ")}"/>${points.map(p=>`<circle class="dot" cx="${p.x}" cy="${p.y}" r="4"><title>${p.label}: ${p.value}</title></circle>`).join("")}</svg><div class="row tiny"><span>${data[0].label}: ${data[0].value}</span><span>${data.at(-1).label}: ${data.at(-1).value}</span></div>`;
}
function calendarHTML() {
  const runway=Math.max(45,daysBetween(state.settings.startDate,state.settings.endDate)+1);
  return `<div class="calendar">${Array.from({length:runway},(_,i)=>i+1).map(day => {
    const date=challengeDate(day), log=state.daily[date], complete=log&&(score(log)>=60||log.reset), extra=(state.extraEvents||[]).find(x=>x.date===date), eventName=date===state.settings.miniEventDate?state.settings.miniEventName:date===state.settings.endDate?state.settings.eventName:extra?.name, classes=["day",complete?"complete":"",day===getDayNumber()?"current":"",CHECKIN_DAYS.includes(day)?"checkin":"",eventName?"event":""].join(" ");
    return `<button class="${classes}" data-calendar-day="${date}" title="${date}${eventName?` · ${eventName}`:""}"><span>${day}</span><small>${parseDate(date).getDate()}</small></button>`;
  }).join("")}</div>`;
}
function badgesHTML() {
  const logs=dailyEntries(), earned=[["First log",logs.length>=1],["3-day rhythm",streak()>=3],["Locked in",logs.some(x=>score(x)>=90)],["Gut win",logs.some(x=>gutScore(x)>=80)],["Check-in complete",Object.keys(state.checkins).length>=1],["Reset queen",logs.some(x=>x.reset)]];
  return earned.map(([name,yes])=>`<span class="badge ${yes?"earned":"locked"}">${yes?"✓":"○"} ${name}</span>`).join("");
}
function comparisonRow(label,start,previous,current,unit) {
  const change=current!==undefined&&current!==""?round(num(current)-num(start),2):"—";
  return `<div class="comparison-row"><strong>${label}</strong><span><small>Start</small>${start}${unit}</span><span><small>Previous</small>${previous??"—"}${previous!==undefined?unit:""}</span><span><small>Current</small>${current??"—"}${current!==undefined?unit:""}</span><span class="${num(change)<0?"positive":""}"><small>Total</small>${change==="—"?"—":`${change>0?"+":""}${change}${unit}`}</span></div>`;
}

function renderCheckins() {
  const current=getDayNumber(), completed=officialCheckins(), latest=completed.at(-1), previous=completed.at(-2), baseline=state.baseline;
  document.querySelector("#checkinContent").innerHTML = `
    <div class="card hero-card"><p class="eyebrow" style="color:#f7d9d7">EDITORIAL WELLNESS REPORT</p><h2>Your official glow-up log</h2><p class="muted">Check in every nine days. Observe the pattern without letting scale noise run the day.</p></div>
    <div class="card"><div class="row"><div><p class="eyebrow">STARTING BASELINE</p><h3>Your permanent reference point</h3></div><span class="pill">RENPHO + TAPE</span></div><div class="baseline-grid">${[["Weight",baseline.weight,"lbs"],["Body fat",baseline.bodyFat,"%"],["Skeletal muscle",baseline.skeletalMuscle,"%"],["Waist",baseline.waist,"in"],["Abdomen",baseline.abdomen,"in"],["Hip",baseline.hips,"in"],["BMR",baseline.bmr,""],["Body water",baseline.bodyWater,"%"],["Visceral fat",baseline.visceralFat,""]].map(([label,value,unit])=>`<div><small>${label}</small><strong>${value}${unit}</strong></div>`).join("")}</div></div>
    <div class="card"><div class="row"><div><p class="eyebrow">WHAT CHANGED?</p><h3>Starting · previous · current</h3></div><span class="pill">OFFICIAL ONLY</span></div>${comparisonRow("Weight",baseline.weight,previous?.weight,latest?.weight,"lbs")}${comparisonRow("Waist",baseline.waist,previous?.waist,latest?.waist,"in")}${comparisonRow("Hip",baseline.hips,previous?.hips,latest?.hips,"in")}</div>
    <div class="card"><div class="row"><div><p class="eyebrow">PHOTO PROGRESS</p><h3>Compare your official photos</h3></div><span class="pill">STAYS LOCAL</span></div><p class="muted">See Day 1 beside a later official check-in. Photos never leave this browser.</p><div class="action-row">${CHECKIN_DAYS.slice(1).map(day=>`<button class="secondary-button" data-photo-compare="${day}">Day 1 vs ${day}</button>`).join("")}</div></div>
    <div class="card"><p>Official check-ins are the only weights used for trends. Daily scale noise is not the assignment.</p><div class="spacer"></div><button class="secondary-button" data-action="random-weight">Log a private random weigh-in</button></div>
    <div class="card"><h3>Official schedule</h3>${CHECKIN_DAYS.map(day=>`<div class="checkin-item row"><div><strong>Day ${day} · ${formatDate(challengeDate(day))}</strong><div class="tiny">${state.checkins[day]?.weight ? `${state.checkins[day].weight} lbs · waist ${state.checkins[day].waist || "—"}` : day===current ? "Your official check-in is ready." : "Not logged yet"}</div></div><button class="secondary-button" data-checkin="${day}">${state.checkins[day]?"Edit":"Open"}</button></div>`).join("")}</div>
    <div class="card"><h3>Private random weigh-ins</h3>${state.randomWeights.length ? state.randomWeights.map(x=>`<div class="checkin-item row"><span>${formatDate(x.date)}</span><strong>${x.weight} lbs</strong></div>`).join("") : `<div class="empty">None logged. This is intentionally not the main focus.</div>`}</div>
  `;
}
function checkinModal(day) {
  const x=state.checkins[day]||{};
  modal(`<div class="modal-body"><p class="eyebrow">OFFICIAL CHECK-IN</p><h2>Day ${day}</h2><p class="muted">${formatDate(challengeDate(day))} · honest data, zero judgment.</p><div class="spacer"></div><form id="checkinForm" data-day="${day}"><div class="form-grid">
    ${field("Official weight","weight",x.weight,"number",'step="0.1"')}${field("Body fat %","bodyFat",x.bodyFat,"number",'step="0.1"')}${field("Muscle %","muscle",x.muscle,"number",'step="0.1"')}${field("Water %","waterPercent",x.waterPercent,"number",'step="0.1"')}
    ${field("Visceral fat","visceralFat",x.visceralFat)}${field("Metabolic age","metabolicAge",x.metabolicAge)}${field("Waist","waist",x.waist,"number",'step="0.01"')}${field("Abdomen","abdomen",x.abdomen,"number",'step="0.01"')}${field("Hips","hips",x.hips,"number",'step="0.01"')}
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
  const review=weeklyReview(), priority=smartPriority(), outlook=forecast();
  document.querySelector("#coachContent").innerHTML = `
    <div class="card hero-card"><p class="eyebrow" style="color:#ffe7e7">AI COACH</p><h2>Get clear feedback.</h2><p class="muted">Paste a clean summary into ChatGPT when you want help adjusting the plan.</p></div>
    <div class="card priority-card"><p class="eyebrow">ONE PRIORITY</p><h3>${priority.title}</h3><p class="muted">${priority.body}</p><p class="tiny">${priority.recommendation}</p></div>
    <div class="card"><p class="eyebrow">SUNDAY REVIEW</p><h3>Weekly coach notes</h3><div class="review-list">${review.wins.map(x=>`<p>✓ ${x}</p>`).join("")}</div><div class="feedback"><strong>Biggest bottleneck</strong><br>${review.bottleneck}</div><div class="spacer"></div><p class="tiny"><strong>Focus this week:</strong> ${review.focus}</p></div>
    <div class="card"><p class="eyebrow">EXPORT FOR CHATGPT</p><div class="stack"><button class="button" data-action="copy-export">Export For ChatGPT</button><button class="quick-add" data-action="copy-daily-summary"><strong>Copy Daily Summary</strong><br><span class="tiny">Use for a quick same-day adjustment.</span></button><button class="quick-add" data-action="copy-summary"><strong>Copy 9-Day Summary</strong><br><span class="tiny">Use for a deeper progress review.</span></button><button class="quick-add" data-action="copy-photo-prompt"><strong>Copy Meal Photo Prompt</strong><br><span class="tiny">Attach a meal photo in ChatGPT and estimate the macros.</span></button></div></div>
    <div class="coach-note"><p class="eyebrow">COACHING PROMPT</p><p style="margin-top:5px">Paste this into ChatGPT when you want feedback. Ask for your top three priorities and one thing to simplify.</p></div>
    <div class="card"><p class="eyebrow">SAVE COACH FEEDBACK</p><h3>Keep advice you want to revisit</h3><textarea id="coachFeedback" placeholder="Paste useful coach feedback here..."></textarea><div class="spacer"></div><button class="button" data-action="save-coach-note">Save coach note</button></div>
    <div class="card"><p class="eyebrow">SAVED COACH NOTES</p>${(state.coachNotes||[]).length?state.coachNotes.map(x=>`<div class="coach-note"><span class="tiny">${formatDate(x.date)}</span><p>${x.text}</p></div>`).join(""):`<div class="empty">No saved coach notes yet.</div>`}</div>
    <div class="card"><p class="eyebrow">FORECAST SNAPSHOT</p><p><strong>${outlook.estimated} lbs</strong> estimated for Blast Fest · ${outlook.pace.toLowerCase()}.</p><p class="tiny">Forecasts are estimates, not promises. Official check-ins and consistent logs make them more useful.</p></div>
  `;
}
function chatGPTExport() {
  const logs=dailyEntries(9).filter(hasLogData), outlook=forecast(), priority=smartPriority(logs), official=officialCheckins();
  return `Kenna's Blast Fest Coach Export
Date: ${formatDate(todayKey())}
Challenge day: ${getDayNumber()} of 45
Current official weight: ${latestOfficialWeight()} lbs
Goal weight: ${state.settings.goalWeight} lbs
Forecast Blast Fest weight: ${outlook.estimated} lbs
Forecast pace: ${outlook.pace}
Needed rate: ${outlook.needed} lbs/week
Current estimated rate: ${outlook.weeklyRate} lbs/week
9-day calories average: ${avg(logs,"calories")||"—"}
9-day protein average: ${avg(logs,"protein")||"—"}g
9-day fiber average: ${avg(logs,"fiber")||"—"}g
9-day water average: ${avg(logs,"water")||"—"} oz
9-day steps average: ${avg(logs,"steps")||"—"}
9-day sleep average: ${avg(logs,"sleep")||"—"} hours
Workouts: ${logs.filter(x=>x.workoutCompleted).length}/${logs.length||0}
Gut health score average: ${avg(logs,gutScore)||"—"}/100
Official check-ins: ${official.length?official.map(x=>`Day ${x.day}: ${x.weight} lbs, waist ${x.waist||"—"} in`).join(" | "):"None logged yet"}
Coach priority: ${priority.title}. ${priority.recommendation}
Saved coach notes: ${(state.coachNotes||[]).map(x=>x.text).join(" | ")||"—"}
Please analyze this progress and give me one main priority, two practical adjustments, and one thing to keep doing.`;
}
function dailySummary() { const log=dayLog(); return `Blast Fest Daily Check-In:
Date: ${formatDate(todayKey())}
Day: ${getDayNumber()} of 45
Schedule type: ${routineToday()[0]}
Calories: ${num(log.calories)||"—"}
Protein: ${num(log.protein)||"—"}g
Fiber: ${num(log.fiber)||"—"}g
Water: ${num(log.water)||"—"} oz
Steps: ${num(log.steps)||"—"}
Workout: ${log.workoutCompleted?"Complete":"Not complete"}
Poop: ${log.poop==="yes"?"Yes":"No"}
Bloating: ${num(log.bloating)||"—"}/10
Notes: ${log.notes||"—"}
Please tell me the top three priorities for tomorrow and one thing to simplify.`; }

function renderSettings() {
  const s=state.settings;
  document.querySelector("#settingsContent").innerHTML = `
    <div class="card hero-card"><p class="eyebrow" style="color:#f7d9d7">PERSONALIZE YOUR TRACKER</p><h2>Built around your real life.</h2><p class="muted">Set the plan once. Let the app make daily decisions smaller.</p></div>
    <div class="card"><p class="eyebrow">START FRESH TOMORROW</p><h3>Ready for your real Day 1?</h3><p class="muted">Clear preview logs and begin fresh on June 2, 2026. Your meal and workout templates stay ready.</p><div class="spacer"></div><button class="button" data-action="fresh-start">Clear Sample Data + Start My Real Tracker</button></div>
    <div class="card"><p class="eyebrow">CHALLENGE SETTINGS</p><h3>Dates and events</h3><div class="spacer"></div><div class="form-grid">${field("Start date","settings.startDate",s.startDate,"date")}${field("Final event date","settings.endDate",s.endDate,"date")}${field("Final event name","settings.eventName",s.eventName,"text")}${field("Seattle concert date","settings.miniEventDate",s.miniEventDate,"date")}${field("Seattle concert name","settings.miniEventName",s.miniEventName,"text")}</div><div class="spacer"></div>${(state.extraEvents||[]).map((x,i)=>`<div class="checkin-item row"><div><strong>${x.name}</strong><div class="tiny">${formatDate(x.date)}${x.notes?` · ${x.notes}`:""}</div></div><button class="secondary-button" data-remove-event="${i}">Remove</button></div>`).join("")}<button class="secondary-button" data-action="add-event">+ Add another event</button></div>
    <div class="card"><p class="eyebrow">USER PROFILE</p><h3>Your goals</h3><div class="spacer"></div><div class="form-grid">
      ${field("Name","settings.name",s.name,"text")}${field("Age","settings.age",s.age)}${field("Height feet","settings.heightFeet",s.heightFeet)}${field("Height inches","settings.heightInches",s.heightInches)}${field("Official start weight","settings.startWeight",s.startWeight,"number",'step="0.1"')}
      ${field("Goal weight","settings.goalWeight",s.goalWeight,"number",'step="0.1"')}${selectField("Activity level","settings.activity",s.activity,["sedentary","light","moderate","active"])}${selectField("Goal intensity","settings.intensity",s.intensity,["moderate","aggressive"])}
      ${field("Water goal oz","settings.waterGoal",s.waterGoal)}${field("Protein goal g","settings.proteinGoal",s.proteinGoal)}${field("Fiber goal g","settings.fiberGoal",s.fiberGoal)}${field("Step goal","settings.stepGoal",s.stepGoal)}${field("Calorie target","settings.calorieTarget",s.calorieTarget)}${field("Deficit target","settings.deficitTarget",s.deficitTarget)}
    </div><p class="tiny">Height display: ${s.heightFeet}′${s.heightInches}″</p></div>
    <div class="card"><p class="eyebrow">PERMANENT BASELINE</p><h3>Your starting RENPHO + tape snapshot</h3><p class="muted">These values anchor every official comparison.</p><div class="spacer"></div><div class="form-grid">${field("Weight","baseline.weight",state.baseline.weight,"number",'step="0.1"')}${field("Body fat %","baseline.bodyFat",state.baseline.bodyFat,"number",'step="0.1"')}${field("Skeletal muscle %","baseline.skeletalMuscle",state.baseline.skeletalMuscle,"number",'step="0.1"')}${field("Waist","baseline.waist",state.baseline.waist,"number",'step="0.01"')}${field("Abdomen","baseline.abdomen",state.baseline.abdomen,"number",'step="0.01"')}${field("Hip","baseline.hips",state.baseline.hips,"number",'step="0.01"')}${field("BMR","baseline.bmr",state.baseline.bmr)}${field("Body water %","baseline.bodyWater",state.baseline.bodyWater,"number",'step="0.1"')}${field("Visceral fat","baseline.visceralFat",state.baseline.visceralFat)}</div></div>
    <div class="card"><h3>TDEE calculator</h3><div class="spacer"></div><div class="grid-2"><div><span class="tiny">BMR</span><strong>${bmr()} cal</strong></div><div><span class="tiny">Maintenance</span><strong>${tdee()} cal</strong></div><div><span class="tiny">Moderate target</span><strong>${tdee()-500} cal</strong></div><div><span class="tiny">Aggressive target</span><strong>${Math.max(1200,tdee()-750)} cal</strong></div></div><div class="spacer"></div>${s.calorieTarget<1200?'<div class="feedback">Your target is too low for this tracker. Choose a more sustainable calorie target and seek professional guidance for personalized needs.</div>':'<p class="tiny">Recommended targets avoid extreme starvation calories. Individual needs vary.</p>'}</div>
    <div class="card"><h3>Routine-based reminders</h3><p class="muted">${routineToday()[2].join(" · ")}</p><div class="spacer"></div><button class="secondary-button" data-action="notifications">Enable optional browser reminders</button></div>
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
function setDeep(obj, path, value) { const parts=path.split("."); const last=parts.pop(); const target=parts.reduce((x,k)=>(x[k] ||= {}),obj); target[last]=value; }
function coerce(input) {
  if (input.tagName==="SELECT" && ["true","false"].includes(input.value)) return input.value==="true";
  if (input.type==="number") return input.value===""?"":num(input.value);
  return input.value;
}

document.addEventListener("click", e => {
  const nav=e.target.closest("[data-nav]"), goButton=e.target.closest("[data-go]"), quickMeal=e.target.closest("[data-quick-meal]"), savedMeal=e.target.closest("[data-saved-meal]"), logAsIs=e.target.closest("[data-log-as-is]"), customizeMeal=e.target.closest("[data-customize-meal]"), editTemplate=e.target.closest("[data-edit-template]"), toggleFavorite=e.target.closest("[data-toggle-favorite]"), deleteTemplate=e.target.closest("[data-delete-template]"), confirmDeleteTemplate=e.target.closest("[data-confirm-delete-template]"), editLoggedMeal=e.target.closest("[data-edit-logged-meal]"), libraryMeal=e.target.closest("[data-wholefood-meal]"), removeMeal=e.target.closest("[data-remove-meal]"), checkin=e.target.closest("[data-checkin]"), photoCompare=e.target.closest("[data-photo-compare]"), microphone=e.target.closest("[data-mic]"), action=e.target.closest("[data-action]"), tab=e.target.closest("[data-nutrition-tab]"), grocery=e.target.closest("[data-grocery]"), workout=e.target.closest("[data-workout-day]"), calendar=e.target.closest("[data-calendar-day]"), removeEvent=e.target.closest("[data-remove-event]");
  if(nav) go(nav.dataset.nav); if(goButton) go(goButton.dataset.go);
  if(e.target.matches("[data-close]")) document.querySelector("#modal").close();
  if(e.target.matches("[data-habit]")) { dayLog().habits[e.target.dataset.habit]=e.target.checked; saveState(); render(); }
  if(e.target.matches("[data-exercise]")) { dayLog().exercises[e.target.dataset.exercise]=e.target.checked; saveState(); render(); }
  if(quickMeal) addMeal(QUICK_MEALS[num(quickMeal.dataset.quickMeal)]);
  if(savedMeal) mealChoiceModal(savedMeal.dataset.savedMeal);
  if(logAsIs) { const m=findSavedMeal(logAsIs.dataset.logAsIs); if(m){ addMealObject(loggedMealFromTemplate(m)); document.querySelector("#modal").close(); } }
  if(customizeMeal) customizeMealModal(customizeMeal.dataset.customizeMeal);
  if(editTemplate) templateFormModal(editTemplate.dataset.editTemplate);
  if(toggleFavorite) { const m=findSavedMeal(toggleFavorite.dataset.toggleFavorite); if(m){ m.favorite=!m.favorite; saveState(); mealChoiceModal(m.id); renderNutrition(); } }
  if(deleteTemplate) { const m=findSavedMeal(deleteTemplate.dataset.deleteTemplate); if(m) modal(`<div class="modal-body"><p class="eyebrow">DELETE SAVED MEAL</p><h2>${m.name}</h2><p>Delete this saved meal? This will not delete meals already logged in your history.</p><div class="modal-actions"><button class="secondary-button" data-close>Cancel</button><button class="danger-button" data-confirm-delete-template="${m.id}">Delete</button></div></div>`); }
  if(confirmDeleteTemplate) { state.savedMeals=state.savedMeals.filter(x=>x.id!==confirmDeleteTemplate.dataset.confirmDeleteTemplate); saveState(); document.querySelector("#modal").close(); toast("Saved meal deleted. History is unchanged."); render(); }
  if(editLoggedMeal) customizeMealModal("", "logged", editLoggedMeal.dataset.editLoggedMeal);
  if(libraryMeal) { const m=state.wholeFoodsMeals[num(libraryMeal.dataset.wholefoodMeal)]; addMeal([m.name,"Meal prep",m.calories,m.protein,m.fiber,m.carbs,m.fat]); }
  if(removeMeal) { const log=dayLog(); log.meals.splice(num(removeMeal.dataset.removeMeal),1); recalcMealTotals(log); saveState(); render(); }
  if(checkin) checkinModal(num(checkin.dataset.checkin));
  if(photoCompare) showPhotoComparison(num(photoCompare.dataset.photoCompare));
  if(microphone) startDictation(microphone.dataset.mic);
  if(action) handleAction(action.dataset.action);
  if(tab) { nutritionTab=tab.dataset.nutritionTab; renderNutrition(); }
  if(grocery) { state.groceries[num(grocery.dataset.grocery)].done=grocery.checked; saveState(); renderNutrition(); }
  if(workout) { workoutDay=num(workout.dataset.workoutDay); renderWorkouts(); }
  if(calendar) openDayModal(calendar.dataset.calendarDay);
  if(removeEvent) { state.extraEvents.splice(num(removeEvent.dataset.removeEvent),1); saveState(); renderSettings(); }
});
document.addEventListener("change", e => {
  if(e.target.closest("#mealBuilderForm")) updateMealBuilderEstimate();
  if(e.target.matches("[data-field]")) {
    if(e.target.closest("#savedMealForm,#mealBuilderForm,#customMealForm,#wholeFoodsForm,#randomWeightForm,#eventForm,#groceryForm,#exerciseForm,#checkinForm")) return;
    const key=e.target.dataset.field, value=coerce(e.target);
    if(key.startsWith("settings.")) { setDeep(state,key,value); state.settings.height=num(state.settings.heightFeet)*12+num(state.settings.heightInches); }
    else if(key.startsWith("baseline.")) setDeep(state,key,value);
    else if(key.includes(".")) setDeep(dayLog(),key,value); else dayLog()[key]=value;
    saveState(); render();
  }
  if(e.target.matches("[data-photo]") && e.target.files[0]) storePhoto(e.target.dataset.photo,e.target.files[0]);
});
document.addEventListener("input", e => { if(e.target.closest("#mealBuilderForm")) updateMealBuilderEstimate(); });
document.addEventListener("submit", e => {
  if(e.target.id==="checkinForm") {
    e.preventDefault(); const form=e.target, day=num(form.dataset.day), data={};
    form.querySelectorAll("[data-field]").forEach(input=>data[input.dataset.field]=coerce(input));
    state.checkins[day]=data; saveState(); document.querySelector("#modal").close(); toast(`Day ${day} official check-in saved`); render();
  }
});
document.querySelector("#quickModeButton").addEventListener("click",()=>{quickMode=!quickMode; document.querySelector("#quickModeButton").textContent=quickMode?"Full check-in":"Quick log"; renderToday();});
document.querySelector("#notificationButton").addEventListener("click",()=>handleAction("notifications"));

function handleAction(action) {
  if(action==="quick-log") { quickMode=true; go("today"); document.querySelector("#quickModeButton").textContent="Full check-in"; }
  if(action==="full-checkin") { quickMode=false; go("today"); document.querySelector("#quickModeButton").textContent="Quick log"; }
  if(action==="open-gut-tab") { nutritionTab="gut"; go("nutrition"); }
  if(action==="reset") modal(`<div class="modal-body"><p class="eyebrow">EMERGENCY RESET</p><h2>Okay. The day is not ruined.</h2><p>Complete the reset three:</p><div class="card"><strong>1. Drink 24 oz water</strong><br><strong>2. Eat protein</strong><br><strong>3. Walk 15 minutes</strong></div><div class="modal-actions"><button class="secondary-button" data-close>Close</button><button class="button" data-action="complete-reset">Mark reset complete</button></div></div>`);
  if(action==="complete-reset") { dayLog().reset=true; saveState(); document.querySelector("#modal").close(); toast("Reset complete. That counts."); render(); }
  if(action==="custom-meal" || action==="new-saved-meal") templateFormModal();
  if(action==="random-weight") modal(`<div class="modal-body"><p class="eyebrow">PRIVATE RANDOM WEIGH-IN</p><h2>This is not an official check-in day.</h2><p>Daily scale changes can be water, sodium, constipation, sleep, or hormones. Do you still want to log this as a private random weigh-in?</p><form id="randomWeightForm"><div class="spacer"></div>${field("Private weight","privateWeight","","number",'step="0.1"')}<div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Log privately</button></div></form></div>`);
  if(action==="copy-summary") navigator.clipboard.writeText(summary()).then(()=>toast("Summary copied for ChatGPT"));
  if(action==="copy-daily-summary") navigator.clipboard.writeText(dailySummary()).then(()=>toast("Daily summary copied"));
  if(action==="copy-export") navigator.clipboard.writeText(chatGPTExport()).then(()=>toast("Coach export copied for ChatGPT"));
  if(action==="copy-photo-prompt") navigator.clipboard.writeText("I am attaching a meal photo. Please estimate calories, protein, fiber, carbs, fat, and sodium range. Tell me how to make this meal more supportive of my protein and gut-health goals without being extreme.").then(()=>toast("Meal photo prompt copied"));
  if(action==="save-coach-note") { const text=document.querySelector("#coachFeedback")?.value.trim(); if(text){ state.coachNotes.push({date:todayKey(),text}); saveState(); toast("Coach note saved"); renderCoach(); } }
  if(action==="notifications") requestNotifications();
  if(action==="samples") { loadSamples(); toast("Sample data loaded"); render(); }
  if(action==="fresh-start") modal(`<div class="modal-body"><p class="eyebrow">START FRESH</p><h2>Begin your real tracker on June 2?</h2><p>This clears preview logs, fake trends, completed samples, meals, and check-ins. Your templates and goals stay ready.</p><div class="modal-actions"><button class="secondary-button" data-close>Cancel</button><button class="button" data-action="confirm-fresh-start">Start my real tracker</button></div></div>`);
  if(action==="confirm-fresh-start") { state=createDefaultState(); saveState(); document.querySelector("#modal").close(); toast("Clean slate ready. Day 1 starts June 2."); render(); }
  if(action==="add-event") modal(`<div class="modal-body"><p class="eyebrow">EXTRA EVENT</p><h2>Add a milestone</h2><form id="eventForm"><div class="form-grid">${field("Event name","eventName","","text")}${field("Event date","eventDate","","date")}${noteField("Goal or notes","eventNotes","")}</div><div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Save event</button></div></form></div>`);
  if(action==="add-grocery") modal(`<div class="modal-body"><h2>Add grocery item</h2><form id="groceryForm">${field("Item name","groceryName","","text")}<div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Add item</button></div></form></div>`);
  if(action==="wholefoods-meal") modal(`<div class="modal-body"><p class="eyebrow">WHOLE FOODS LIBRARY</p><h2>Save meal prep</h2><form id="wholeFoodsForm"><div class="form-grid">${field("Meal name","name","","text")}${field("Calories","calories","")}${field("Protein g","protein","")}${field("Fiber g","fiber","")}${field("Carbs g","carbs","")}${field("Fat g","fat","")}${field("Sodium optional","sodium","")}${field("Price optional","price","","number",'step="0.01"')}${field("Rating 1-5","rating","5")}${yesNoField("Favorite","favorite",true)}${noteField("Meal notes","mealNotes","")}<label>Meal photo<input type="file" accept="image/*" capture="environment" data-photo="wholefoods-${todayKey()}"></label></div><div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Save and log meal</button></div></form></div>`);
  if(action==="add-exercise") modal(`<div class="modal-body"><h2>Add exercise</h2><form id="exerciseForm">${field("Exercise name","exerciseName","","text")}<div class="modal-actions"><button type="button" class="secondary-button" data-close>Cancel</button><button class="button">Add exercise</button></div></form></div>`);
  if(action==="clear-data") modal(`<div class="modal-body"><h2>Clear all local data?</h2><p>This removes daily logs, meals, check-ins, private weigh-ins, and settings from this browser.</p><div class="modal-actions"><button class="secondary-button" data-close>Cancel</button><button class="danger-button" data-action="confirm-clear">Clear everything</button></div></div>`);
  if(action==="confirm-clear") { localStorage.removeItem(STORAGE_KEY); state=createDefaultState(); saveState(); document.querySelector("#modal").close(); toast("Tracker cleared"); render(); }
}
document.addEventListener("submit",e=>{
  if(e.target.id==="customMealForm"){e.preventDefault();const d={};e.target.querySelectorAll("[data-field]").forEach(x=>d[x.dataset.field]=coerce(x));addMeal([d.name||"Custom meal",d.type||"Meal",num(d.calories),num(d.protein),num(d.fiber),num(d.carbs),num(d.fat)]);document.querySelector("#modal").close();}
  if(e.target.id==="savedMealForm"){e.preventDefault();const existing=e.target.dataset.existing==="yes", id=e.target.dataset.templateId, prior=findSavedMeal(id), meal=collectMealForm(e.target); meal.id=id; meal.favorite=prior?Boolean(prior.favorite):Boolean(meal.tags.includes("favorite")); meal.addons=prior?.addons||[]; meal.useCount=num(prior?.useCount); meal.lastUsed=prior?.lastUsed||""; meal.photoKey=`saved-meal-${id}`; if(existing){ const index=state.savedMeals.findIndex(x=>x.id===id); state.savedMeals[index]=meal; } else state.savedMeals.push(meal); saveState(); document.querySelector("#modal").close(); toast("Saved meal template updated"); render(); }
  if(e.target.id==="mealBuilderForm"){e.preventDefault();const clicked=e.submitter?.value||"today", mode=e.target.dataset.mode, templateId=e.target.dataset.templateId, base=collectMealForm(e.target,"meal."), meal=applyAddons({...base, templateId}, e.target, templateId); if(mode==="logged"){ const log=dayLog(), idx=num(e.target.dataset.logIndex); meal.logId=log.meals[idx]?.logId||mealId(); meal.templateId=log.meals[idx]?.templateId||templateId; log.meals[idx]=meal; recalcMealTotals(log); saveState(); document.querySelector("#modal").close(); toast("Today's meal updated"); render(); return; } if(clicked==="update"){ const original=findSavedMeal(templateId); if(original){ Object.assign(original, {...meal, id:templateId, favorite:original.favorite, addons:original.addons||[], useCount:num(original.useCount), lastUsed:original.lastUsed||""}); saveState(); } } if(clicked==="new"){ const newTemplate={...meal, id:mealId(), favorite:false, useCount:0, lastUsed:"", addons:[], tags:[...(meal.tags||[]),"custom"]}; state.savedMeals.push(newTemplate); meal.templateId=newTemplate.id; } addMealObject({...meal, logId:mealId()}); document.querySelector("#modal").close(); }
  if(e.target.id==="randomWeightForm"){e.preventDefault();state.randomWeights.push({date:todayKey(),weight:num(e.target.querySelector("[data-field=privateWeight]").value)});saveState();document.querySelector("#modal").close();toast("Stored privately");render();}
  if(e.target.id==="eventForm"){e.preventDefault();const inputs=e.target.querySelectorAll("[data-field]");const data={};inputs.forEach(x=>data[x.dataset.field]=coerce(x));if(!data.eventDate)return toast("Add a date for this milestone.");state.extraEvents.push({name:data.eventName||"Extra event",date:data.eventDate,notes:data.eventNotes});saveState();document.querySelector("#modal").close();toast("Event added");renderSettings();}
  if(e.target.id==="groceryForm"){e.preventDefault();const name=e.target.querySelector("[data-field=groceryName]").value.trim();if(name)state.groceries.push({name,done:false});saveState();document.querySelector("#modal").close();renderNutrition();}
  if(e.target.id==="wholeFoodsForm"){e.preventDefault();const d={};e.target.querySelectorAll("[data-field]").forEach(x=>d[x.dataset.field]=coerce(x));const meal={name:d.name||"Whole Foods meal prep",calories:num(d.calories),protein:num(d.protein),fiber:num(d.fiber),carbs:num(d.carbs),fat:num(d.fat),sodium:d.sodium,price:d.price,notes:d.mealNotes,rating:num(d.rating,5),favorite:Boolean(d.favorite)};state.wholeFoodsMeals.push(meal);saveState();addMeal([meal.name,"Meal prep",meal.calories,meal.protein,meal.fiber,meal.carbs,meal.fat]);document.querySelector("#modal").close();}
  if(e.target.id==="exerciseForm"){e.preventDefault();const name=e.target.querySelector("[data-field=exerciseName]").value.trim();const selected=workoutDay===null?workoutIndex():workoutDay;if(name)(state.customExercises[selected]||=[]).push(name);saveState();document.querySelector("#modal").close();renderWorkouts();}
});
function openDayModal(date) { const log=state.daily[date], day=daysBetween(state.settings.startDate,date)+1; modal(`<div class="modal-body"><p class="eyebrow">${day<=45?`DAY ${day}`:"BLAST FEST BUFFER"} · ${formatDate(date)}</p><h2>${log&&hasLogData(log)?"Logged day":"No log yet"}</h2>${log&&hasLogData(log)?`<div class="compare-grid"><div class="compare-card"><span class="tiny">Water</span><strong>${num(log.water)} oz</strong></div><div class="compare-card"><span class="tiny">Protein</span><strong>${num(log.protein)}g</strong></div><div class="compare-card"><span class="tiny">Steps</span><strong>${num(log.steps)}</strong></div><div class="compare-card"><span class="tiny">Score</span><strong>${score(log)}</strong></div></div><p class="muted">${log.notes||"No notes added."}</p>`:`<p class="muted">Nothing logged for this date yet.</p>`}<div class="modal-actions"><button class="secondary-button" data-close>Close</button></div></div>`); }

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
async function getPhoto(key) {
  try { const db=await openPhotoDB(); return await new Promise(resolve=>{ const request=db.transaction("photos").objectStore("photos").get(key); request.onsuccess=()=>resolve(request.result); request.onerror=()=>resolve(null); }); }
  catch { return null; }
}
async function showPhotoComparison(day) {
  modal(`<div class="modal-body"><p class="eyebrow">PHOTO PROGRESS</p><h2>Day 1 vs Day ${day}</h2><p class="muted">Drag each slider to compare. Photos stay local to this browser.</p><div id="photoComparison" class="stack"><div class="empty">Loading your local photos…</div></div><div class="modal-actions"><button class="secondary-button" data-close>Close</button></div></div>`);
  const poses=["front","side","back"], container=document.querySelector("#photoComparison");
  const photos=await Promise.all(poses.map(async pose=>[pose,await getPhoto(`checkin-1-${pose}`),await getPhoto(`checkin-${day}-${pose}`)]));
  container.innerHTML=photos.map(([pose,start,current])=>`<div class="photo-compare-card"><p class="eyebrow">${pose.toUpperCase()}</p>${start&&current?`<div class="photo-compare" style="--reveal:50%"><img src="${URL.createObjectURL(start)}" alt="Day 1 ${pose}"><div class="photo-after"><img src="${URL.createObjectURL(current)}" alt="Day ${day} ${pose}"></div></div><input type="range" min="0" max="100" value="50" aria-label="${pose} photo comparison slider" data-compare-slider>`:`<div class="empty">Add both Day 1 and Day ${day} ${pose} photos to compare.</div>`}</div>`).join("");
}
document.addEventListener("input",e=>{ if(e.target.matches("[data-compare-slider]")) e.target.previousElementSibling.style.setProperty("--reveal",`${e.target.value}%`); });
function loadSamples() {
  for(let i=0;i<9;i++){const d=parseDate(state.settings.startDate);d.setDate(d.getDate()+i);const key=localISO(d);state.daily[key]={habits:{waterGoal:true,proteinGoal:true,plannedLunch:true,workout:i%3!==2,bowelMovement:true},calories:1680+i*22,protein:132+i*2,fiber:21+(i%4),water:88+i*2,steps:8200+i*240,activeCalories:310+i*11,exerciseMinutes:35+(i%3)*10,sleep:6.5+(i%4)*.3,workoutCompleted:i%3!==2,poop:i%4===0?"no":"yes",bowelType:i%4===0?"none":"normal",bloating:6-(i%3),constipation:5-(i%3),energy:6+i%3,mood:7,cravings:4,reset:false,meals:[],exercises:{}};}
  state.checkins[1]={weight:180,waist:34.5,hips:44,thigh:25,arm:13.5,wins:"Started with a clear plan."};
  state.checkins[9]={weight:177.8,waist:33.8,hips:43.5,thigh:24.8,arm:13.4,wins:"Meal prep made protein easier."};
  state.samplesLoaded=true; saveState();
}

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
render();
