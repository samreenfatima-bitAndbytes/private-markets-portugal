import { buildInitialDb } from "./seedData";

const STORAGE_KEY = "pm_static_demo_v6";
const SEED_VERSION = 6;

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

export function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === SEED_VERSION && Array.isArray(parsed.properties)) {
        return parsed;
      }
    }
    // Drop legacy demos so avatars / richer seed apply
    localStorage.removeItem("pm_static_demo_v1");
    localStorage.removeItem("pm_static_demo_v2");
    localStorage.removeItem("pm_static_demo_v3");
    localStorage.removeItem("pm_static_demo_v4");
    localStorage.removeItem("pm_static_demo_v5");
  } catch {
    /* ignore corrupt storage */
  }
  const fresh = buildInitialDb();
  saveDb(fresh);
  return fresh;
}

export function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb() {
  const fresh = buildInitialDb();
  saveDb(fresh);
  return fresh;
}

export function nextId(db, prefix) {
  db.idCounter = (db.idCounter || 100) + 1;
  return `${prefix}-${db.idCounter}`;
}

export function updateDb(mutator) {
  const db = loadDb();
  const result = mutator(db);
  saveDb(db);
  return result;
}

export function readDb() {
  return loadDb();
}

export { clone };
