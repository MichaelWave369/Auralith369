const DB_NAME = 'auralith369-session-recovery';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';
const LATEST_KEY = 'latest';

export const AURALITH_RECOVERY_KIND = 'auralith.recovery';
export const AURALITH_RECOVERY_VERSION = 1;

export function createRecoveryEnvelope(project, savedAt = new Date().toISOString()) {
  return {
    kind: AURALITH_RECOVERY_KIND,
    version: AURALITH_RECOVERY_VERSION,
    savedAt,
    project
  };
}

export function isRecoveryEnvelope(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    value.kind === AURALITH_RECOVERY_KIND &&
    value.version === AURALITH_RECOVERY_VERSION &&
    typeof value.savedAt === 'string' &&
    value.project &&
    typeof value.project === 'object'
  );
}

function openRecoveryDatabase(indexedDb = globalThis.indexedDB) {
  if (!indexedDb) return Promise.reject(new Error('IndexedDB is unavailable.'));

  return new Promise((resolve, reject) => {
    const request = indexedDb.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error || new Error('Unable to open recovery database.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function runTransaction(mode, operation, indexedDb) {
  const database = await openRecoveryDatabase(indexedDb);
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      let request;

      try {
        request = operation(store);
      } catch (error) {
        reject(error);
        return;
      }

      transaction.onerror = () => reject(transaction.error || new Error('Recovery transaction failed.'));
      transaction.onabort = () => reject(transaction.error || new Error('Recovery transaction was aborted.'));
      if (request) {
        request.onerror = () => reject(request.error || new Error('Recovery request failed.'));
        request.onsuccess = () => resolve(request.result);
      } else {
        transaction.oncomplete = () => resolve(undefined);
      }
    });
  } finally {
    database.close();
  }
}

export async function saveRecoverySnapshot(project, indexedDb = globalThis.indexedDB) {
  const envelope = createRecoveryEnvelope(project);
  await runTransaction('readwrite', store => store.put(envelope, LATEST_KEY), indexedDb);
  return envelope;
}

export async function loadRecoverySnapshot(indexedDb = globalThis.indexedDB) {
  const value = await runTransaction('readonly', store => store.get(LATEST_KEY), indexedDb);
  return isRecoveryEnvelope(value) ? value : null;
}

export async function clearRecoverySnapshot(indexedDb = globalThis.indexedDB) {
  await runTransaction('readwrite', store => store.delete(LATEST_KEY), indexedDb);
}
