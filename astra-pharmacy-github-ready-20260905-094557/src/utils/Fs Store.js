// ---------------------------------------------------------------------
// fsStore — lets the app read/write its data directly to a folder on a
// USB flash drive using the browser's File System Access API
// (Chrome / Edge only). No local server, no backend: the flash drive
// itself is the data store, while the app's static files stay hosted
// wherever they're deployed (e.g. Vercel).
//
// Flow:
//   1. connectFlashDrive() — user picks a folder (a one-time gesture).
//      The folder *handle* is saved in IndexedDB so future visits can
//      silently reconnect without asking again (subject to the
//      browser's permission model).
//   2. Every state change is written to "astra-data.json" inside that
//      folder, in addition to the normal localStorage fallback.
//   3. On load, if a previously-granted handle is found, its file is
//      read and used as the source of truth instead of localStorage.
// ---------------------------------------------------------------------

const DATA_FILE_NAME = 'astra-data.json';
const IDB_DB_NAME = 'astra-fs-handles';
const IDB_STORE_NAME = 'handles';
const IDB_KEY = 'dataFolder';

export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// ---- tiny IndexedDB helper (no external dependency) ----
function openHandleDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readonly');
    const req = tx.objectStore(IDB_STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    tx.objectStore(IDB_STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    tx.objectStore(IDB_STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---- permission helpers ----
async function verifyPermission(handle, forWrite = true) {
  const opts = forWrite ? { mode: 'readwrite' } : {};
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  // requestPermission requires a user gesture the first time; silent
  // reconnect attempts should call this only after a real click.
  if ((await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

/**
 * Silently check for a previously-connected folder without prompting
 * the user. Used on app load to auto-reconnect if permission is still
 * granted from a prior visit.
 */
export async function getSavedFolderHandle() {
  if (!isFileSystemAccessSupported()) return null;
  try {
    const handle = await idbGet(IDB_KEY);
    if (!handle) return null;
    const granted = (await handle.queryPermission({ mode: 'readwrite' })) === 'granted';
    return granted ? handle : null;
  } catch {
    return null;
  }
}

/**
 * Open the OS folder picker (must be called from a user click) and
 * save the chosen handle for future visits.
 */
export async function pickFolder() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('المتصفح لا يدعم الوصول المباشر لمجلدات الجهاز.');
  }
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
  const ok = await verifyPermission(handle, true);
  if (!ok) throw new Error('تم رفض صلاحية الوصول للمجلد.');
  await idbSet(IDB_KEY, handle);
  return handle;
}

export async function forgetFolder() {
  await idbDelete(IDB_KEY);
}

/**
 * Read astra-data.json from the given folder handle.
 * Returns the parsed object, or null if the file doesn't exist yet
 * (e.g. a brand-new empty flash drive).
 */
export async function readDataFile(dirHandle) {
  try {
    const fileHandle = await dirHandle.getFileHandle(DATA_FILE_NAME, { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return null; // not found / unreadable / empty — caller falls back
  }
}

/**
 * Write the given state object to astra-data.json in the folder,
 * creating the file if needed.
 */
export async function writeDataFile(dirHandle, data) {
  const fileHandle = await dirHandle.getFileHandle(DATA_FILE_NAME, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data));
  await writable.close();
}
