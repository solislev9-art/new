// Simple IndexedDB helper for storing manga images (pages and covers)
// Fixed background: none (utility module)

const DB_NAME = 'MangaDB';
const DB_VERSION = 1;
const STORE_PAGES = 'pages';
const STORE_COVERS = 'covers';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PAGES)) {
        db.createObjectStore(STORE_PAGES);
      }
      if (!db.objectStoreNames.contains(STORE_COVERS)) {
        db.createObjectStore(STORE_COVERS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T = unknown>(db: IDBDatabase, store: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const req = fn(s);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export function makePageKey(mangaId: string, chapterNumber: number, pageNumber: number) {
  return `${mangaId}_ch${chapterNumber}_p${pageNumber}`;
}

export async function putPageBlob(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  await tx(db, STORE_PAGES, 'readwrite', (s) => s.put(blob, key));
}

export async function putCoverBlob(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  await tx(db, STORE_COVERS, 'readwrite', (s) => s.put(blob, key));
}

export async function getPageBlob(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return await tx<Blob | undefined>(db, STORE_PAGES, 'readonly', (s) => s.get(key));
}

export async function getCoverBlob(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return await tx<Blob | undefined>(db, STORE_COVERS, 'readonly', (s) => s.get(key));
}

// Convert an idb:// URL to a usable object URL
// Format: idb://pages/<key> or idb://covers/<key>
export async function resolveIdbUrl(src: string): Promise<string> {
  if (!src.startsWith('idb://')) return src;
  const [, store, key] = src.replace('idb://', '').split('/') as [string, string, string];
  const blob = store === 'pages' ? await getPageBlob(key) : await getCoverBlob(key);
  if (!blob) return '';
  return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url?: string) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}
