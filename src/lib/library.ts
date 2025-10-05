// Library management with local storage and custom auth tokens

export interface SavedManga {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
  genres: string[];
  savedAt: string;
  localPath?: string;
  totalChapters?: number;
  chapters?: LocalChapter[];
}

export interface LocalChapter {
  id: string;
  number: number;
  title: string;
  folderPath: string;
  pages: LocalPage[];
}

export interface LocalPage {
  id: string;
  pageNumber: number;
  fileName: string;
  filePath: string;
}

export interface UserLibrary {
  userId: string;
  mangas: SavedManga[];
}

// Generate a unique user ID for anonymous users
export const generateUserId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `user_${timestamp}_${randomStr}`;
};

// Get or create user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem("manga_user_id");
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem("manga_user_id", userId);
  }
  return userId;
};

// Get user's library
export const getUserLibrary = (): UserLibrary => {
  const userId = getUserId();
  const libraryData = localStorage.getItem(`manga_library_${userId}`);

  if (libraryData) {
    return JSON.parse(libraryData);
  }

  return {
    userId,
    mangas: [],
  };
};

// Save manga to library
export const saveMangaToLibrary = (
  manga: Omit<SavedManga, "savedAt">,
): boolean => {
  try {
    const library = getUserLibrary();

    // Check if manga is already saved
    const existingIndex = library.mangas.findIndex((m) => m.id === manga.id);
    if (existingIndex !== -1) {
      return false; // Already saved
    }

    const savedManga: SavedManga = {
      ...manga,
      savedAt: new Date().toISOString(),
    };

    library.mangas.push(savedManga);
    localStorage.setItem(
      `manga_library_${library.userId}`,
      JSON.stringify(library),
    );

    return true;
  } catch (error) {
    console.error("Error saving manga to library:", error);
    return false;
  }
};

// Remove manga from library
export const removeMangaFromLibrary = (mangaId: string): boolean => {
  try {
    const library = getUserLibrary();
    const initialLength = library.mangas.length;

    library.mangas = library.mangas.filter((m) => m.id !== mangaId);

    if (library.mangas.length < initialLength) {
      localStorage.setItem(
        `manga_library_${library.userId}`,
        JSON.stringify(library),
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error removing manga from library:", error);
    return false;
  }
};

// Check if manga is in library
export const isMangaInLibrary = (mangaId: string): boolean => {
  const library = getUserLibrary();
  return library.mangas.some((m) => m.id === mangaId);
};

// Get library stats
export const getLibraryStats = () => {
  const library = getUserLibrary();
  return {
    totalMangas: library.mangas.length,
    recentlyAdded: library.mangas
      .sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      )
      .slice(0, 5),
  };
};

// Reading progress tracking
export interface ReadingProgress {
  mangaId: string;
  currentChapter: number;
  currentPage: number;
  totalChapters: number;
  lastReadAt: string;
  readingTime: number; // in minutes
}

// User preferences
export interface UserPreferences {
  readingMode: "single" | "double" | "webtoon";
  autoBookmark: boolean;
  notifications: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  adultContent: boolean;
  autoPlay: boolean;
  readingDirection: "ltr" | "rtl";
}

// Bookmark system
export interface Bookmark {
  id: string;
  mangaId: string;
  chapterNumber: number;
  pageNumber: number;
  note?: string;
  createdAt: string;
}

// Reading history
export interface ReadingHistoryItem {
  mangaId: string;
  title: string;
  coverImage: string;
  lastChapter: number;
  lastPage: number;
  readAt: string;
  readingTime: number;
}

// Get user preferences
export const getUserPreferences = (): UserPreferences => {
  const userId = getUserId();
  const prefsData = localStorage.getItem(`manga_prefs_${userId}`);

  if (prefsData) {
    return JSON.parse(prefsData);
  }

  return {
    readingMode: "single",
    autoBookmark: true,
    notifications: true,
    theme: "dark",
    language: "en",
    adultContent: false,
    autoPlay: false,
    readingDirection: "ltr",
  };
};

// Save user preferences
export const saveUserPreferences = (prefs: UserPreferences): boolean => {
  try {
    const userId = getUserId();
    localStorage.setItem(`manga_prefs_${userId}`, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.error("Error saving preferences:", error);
    return false;
  }
};

// Reading progress functions
export interface ReadingProgress {
  mangaId: string;
  currentChapter: number;
  currentPage: number;
  totalChapters: number;
  lastReadAt: string;
  readingTime: number;
}

const STORAGE_KEY = "readingProgress";

// Save or update reading progress
export function saveReadingProgress(progress: ReadingProgress) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  existing[progress.mangaId] = progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

// Get reading progress for one manga
export function getReadingProgress(mangaId: string): ReadingProgress | null {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  return data[mangaId] || null;
}

// Get all reading progress entries
export function getAllReadingProgress(): Record<string, ReadingProgress> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

// Clear progress for one manga
export function clearReadingProgress(mangaId: string) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  delete existing[mangaId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

// Track reading time (increments seconds/minutes)
export function incrementReadingTime(mangaId: string, seconds: number = 60) {
  const progress = getReadingProgress(mangaId);
  if (progress) {
    progress.readingTime += seconds;
    progress.lastReadAt = new Date().toISOString();
    saveReadingProgress(progress);
  }
}

// Bookmark functions
export const getBookmarks = (mangaId?: string): Bookmark[] => {
  const userId = getUserId();
  const bookmarksData = localStorage.getItem(`manga_bookmarks_${userId}`);
  const bookmarks = bookmarksData ? JSON.parse(bookmarksData) : [];

  return mangaId
    ? bookmarks.filter((b: Bookmark) => b.mangaId === mangaId)
    : bookmarks;
};

export const addBookmark = (
  bookmark: Omit<Bookmark, "id" | "createdAt">,
): boolean => {
  try {
    const userId = getUserId();
    const bookmarks = getBookmarks();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
    };

    bookmarks.push(newBookmark);
    localStorage.setItem(
      `manga_bookmarks_${userId}`,
      JSON.stringify(bookmarks),
    );
    return true;
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return false;
  }
};

// Reading history functions
export const getReadingHistory = (): ReadingHistoryItem[] => {
  const userId = getUserId();
  const historyData = localStorage.getItem(`manga_history_${userId}`);
  return historyData ? JSON.parse(historyData) : [];
};

export const addToReadingHistory = (
  item: Omit<ReadingHistoryItem, "readAt">,
): boolean => {
  try {
    const userId = getUserId();
    const history = getReadingHistory();

    // Remove existing entry for this manga
    const filteredHistory = history.filter((h) => h.mangaId !== item.mangaId);

    // Add new entry at the beginning
    const newItem: ReadingHistoryItem = {
      ...item,
      readAt: new Date().toISOString(),
    };

    filteredHistory.unshift(newItem);

    // Keep only last 50 items
    const limitedHistory = filteredHistory.slice(0, 50);

    localStorage.setItem(
      `manga_history_${userId}`,
      JSON.stringify(limitedHistory),
    );
    return true;
  } catch (error) {
    console.error("Error adding to reading history:", error);
    return false;
  }
};

// Advanced library functions
export const sortLibrary = (
  sortBy: "title" | "author" | "rating" | "dateAdded",
  order: "asc" | "desc" = "asc",
): SavedManga[] => {
  const library = getUserLibrary();

  return library.mangas.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "author":
        comparison = a.author.localeCompare(b.author);
        break;
      case "rating":
        comparison = a.rating - b.rating;
        break;
      case "dateAdded":
        comparison =
          new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        break;
    }

    return order === "desc" ? -comparison : comparison;
  });
};

export const filterLibraryByGenre = (genre: string): SavedManga[] => {
  const library = getUserLibrary();
  return library.mangas.filter((manga) =>
    manga.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())),
  );
};

export const searchLibrary = (query: string): SavedManga[] => {
  const library = getUserLibrary();
  const lowercaseQuery = query.toLowerCase();

  return library.mangas.filter(
    (manga) =>
      manga.title.toLowerCase().includes(lowercaseQuery) ||
      manga.author.toLowerCase().includes(lowercaseQuery) ||
      manga.genres.some((genre) =>
        genre.toLowerCase().includes(lowercaseQuery),
      ),
  );
};

// Local file management functions



export const getLocalMangaPages = (
  mangaId: string,
  chapterNumber: number,
): LocalPage[] => {
  const library = getUserLibrary();
  const manga = library.mangas.find((m) => m.id === mangaId);

  if (!manga || !manga.chapters) return [];

  const chapter = manga.chapters.find((c) => c.number === chapterNumber);
  return chapter?.pages || [];
};

export const isLocalManga = (mangaId: string): boolean => {
  return mangaId.startsWith("local_");
};

// Export/Import library
export const exportLibrary = (): string => {
  const library = getUserLibrary();
  const preferences = getUserPreferences();
  const history = getReadingHistory();
  const bookmarks = getBookmarks();

  return JSON.stringify({
    library,
    preferences,
    history,
    bookmarks,
    exportedAt: new Date().toISOString(),
  });
};

export const importLibrary = (data: string): boolean => {
  try {
    const importData = JSON.parse(data);
    const userId = getUserId();

    if (importData.library) {
      localStorage.setItem(
        `manga_library_${userId}`,
        JSON.stringify(importData.library),
      );
    }
    if (importData.preferences) {
      localStorage.setItem(
        `manga_prefs_${userId}`,
        JSON.stringify(importData.preferences),
      );
    }
    if (importData.history) {
      localStorage.setItem(
        `manga_history_${userId}`,
        JSON.stringify(importData.history),
      );
    }
    if (importData.bookmarks) {
      localStorage.setItem(
        `manga_bookmarks_${userId}`,
        JSON.stringify(importData.bookmarks),
      );
    }

    return true;
  } catch (error) {
    console.error("Error importing library:", error);
    return false;
  }
};
