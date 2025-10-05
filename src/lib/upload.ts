// Upload system for manga management
export interface MangaUpload {
  title: string;
  author: string;
  artist: string;
  description: string;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  type: 'manga' | 'manhwa' | 'manhua' | 'novel';
  released: string;
  serialization: string;
  rating: number;
  coverImage: File | null;
  chapters: ChapterUpload[];
}

export interface ChapterUpload {
  number: number;
  title: string;
  pages: File[];
}

export interface UploadedManga {
  id: string;
  title: string;
  author: string;
  artist: string;
  description: string;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  type: 'manga' | 'manhwa' | 'manhua' | 'novel';
  released: string;
  serialization: string;
  rating: number;
  coverImage: string;
  chapters: UploadedChapter[];
  uploadedAt: string;
  uploadedBy: string;
  postedOn: string;
  updatedOn: string;
  views: number;
}

export interface UploadedChapter {
  id: string;
  number: number;
  title: string;
  pages: UploadedPage[];
}

export interface UploadedPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  fileName: string;
}

const STORAGE_KEY = 'uploaded_manga';

// Simulate file upload to cloud storage
const uploadFile = async (file: File, path: string): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // In a real app, this would upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For demo purposes, we'll use data URLs
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// Upload manga with progress tracking
export const uploadManga = async (
  mangaData: MangaUpload,
  onProgress?: (progress: number, status: string) => void
): Promise<UploadedManga> => {
  const totalSteps = 1 + mangaData.chapters.reduce((sum, chapter) => sum + chapter.pages.length, 0);
  let currentStep = 0;

  const updateProgress = (status: string) => {
    currentStep++;
    const progress = Math.round((currentStep / totalSteps) * 100);
    onProgress?.(progress, status);
  };

  try {
    // Generate ID early so it can be used for IndexedDB keys
    const mangaId = `manga_${Date.now()}`;

    // Upload cover image (keep as data URL for UI compatibility)
    let coverImageUrl = '';
    if (mangaData.coverImage) {
      updateProgress('Uploading cover image...');
      coverImageUrl = await uploadFile(mangaData.coverImage, `covers/${mangaData.title}`);

      // Also store in IndexedDB for persistence (optional)
      try {
        const { putCoverBlob } = await import('./idb');
        await putCoverBlob(`${mangaId}_cover`, mangaData.coverImage);
      } catch (e) {
        console.warn('Cover IndexedDB save failed (non-critical):', e);
      }
    }

    // Upload chapters and pages to IndexedDB (store metadata in localStorage)
    const uploadedChapters: UploadedChapter[] = [];
    
    for (const chapter of mangaData.chapters) {
      const uploadedPages: UploadedPage[] = [];
      
      for (let i = 0; i < chapter.pages.length; i++) {
        const page = chapter.pages[i];
        updateProgress(`Saving Chapter ${chapter.number}, Page ${i + 1}...`);
        
        try {
          const { makePageKey, putPageBlob } = await import('./idb');
          const key = makePageKey(mangaId, chapter.number, i + 1);
          await putPageBlob(key, page);
          uploadedPages.push({
            id: `page_${Date.now()}_${i}`,
            pageNumber: i + 1,
            imageUrl: `idb://pages/${key}`,
            fileName: page.name
          });
        } catch (e) {
          console.error('Failed saving page to IndexedDB:', e);
          // Fallback: do not attach imageUrl to avoid localStorage bloat
          uploadedPages.push({
            id: `page_${Date.now()}_${i}`,
            pageNumber: i + 1,
            imageUrl: '',
            fileName: page.name
          });
        }
      }
      
      uploadedChapters.push({
        id: `chapter_${Date.now()}_${chapter.number}`,
        number: chapter.number,
        title: chapter.title,
        pages: uploadedPages
      });
    }

    const now = new Date().toISOString();
    
    // Create uploaded manga object
    const uploadedManga: UploadedManga = {
      id: mangaId,
      title: mangaData.title,
      author: mangaData.author,
      artist: mangaData.artist,
      description: mangaData.description,
      genres: mangaData.genres,
      status: mangaData.status,
      type: mangaData.type,
      released: mangaData.released,
      serialization: mangaData.serialization,
      rating: mangaData.rating,
      coverImage: coverImageUrl,
      chapters: uploadedChapters,
      uploadedAt: now,
      uploadedBy: 'admin',
      postedOn: now,
      updatedOn: now,
      views: 0
    };

    // Save to localStorage (small metadata only)
    const existingManga = getMangaList();
    const updatedManga = [...existingManga, uploadedManga];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedManga));

    updateProgress('Upload completed!');
    return uploadedManga;

  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('Failed to upload manga');
  }
};

// Add chapter to existing manga
export const addChapterToManga = async (
  mangaId: string,
  chapterData: ChapterUpload,
  onProgress?: (progress: number, status: string) => void
): Promise<boolean> => {
  try {
    const mangaList = getMangaList();
    const mangaIndex = mangaList.findIndex(manga => manga.id === mangaId);
    
    if (mangaIndex === -1) {
      throw new Error('Manga not found');
    }

    const totalSteps = chapterData.pages.length;
    let currentStep = 0;

    const updateProgress = (status: string) => {
      currentStep++;
      const progress = Math.round((currentStep / totalSteps) * 100);
      onProgress?.(progress, status);
    };

    // Upload chapter pages to IndexedDB
    const uploadedPages: UploadedPage[] = [];
    
    for (let i = 0; i < chapterData.pages.length; i++) {
      const page = chapterData.pages[i];
      updateProgress(`Saving Chapter ${chapterData.number}, Page ${i + 1}...`);
      
      try {
        const { makePageKey, putPageBlob } = await import('./idb');
        const key = makePageKey(mangaId, chapterData.number, i + 1);
        await putPageBlob(key, page);
        uploadedPages.push({
          id: `page_${Date.now()}_${i}`,
          pageNumber: i + 1,
          imageUrl: `idb://pages/${key}`,
          fileName: page.name
        });
      } catch (e) {
        console.error('Failed saving page to IndexedDB:', e);
        uploadedPages.push({
          id: `page_${Date.now()}_${i}`,
          pageNumber: i + 1,
          imageUrl: '',
          fileName: page.name
        });
      }
    }

    // Create new chapter
    const newChapter: UploadedChapter = {
      id: `chapter_${Date.now()}_${chapterData.number}`,
      number: chapterData.number,
      title: chapterData.title,
      pages: uploadedPages
    };

    // Add chapter to manga
    mangaList[mangaIndex].chapters.push(newChapter);
    mangaList[mangaIndex].updatedOn = new Date().toISOString();

    // Save updated manga list
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mangaList));

    return true;
  } catch (error) {
    console.error('Failed to add chapter:', error);
    return false;
  }
};

// Get list of uploaded manga
export const getMangaList = (): UploadedManga[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load manga list:', error);
    return [];
  }
};

// Get specific manga by ID
export const getMangaById = (id: string): UploadedManga | null => {
  const mangaList = getMangaList();
  return mangaList.find(manga => manga.id === id) || null;
};

// Update manga
export const updateManga = async (id: string, updates: Partial<MangaUpload>): Promise<boolean> => {
  try {
    const mangaList = getMangaList();
    const mangaIndex = mangaList.findIndex(manga => manga.id === id);
    
    if (mangaIndex === -1) {
      throw new Error('Manga not found');
    }

    // Apply updates (simplified - in real app, handle file uploads properly)
    const updatedManga = {
      ...mangaList[mangaIndex],
      ...updates,
      // Don't update these fields
      id: mangaList[mangaIndex].id,
      uploadedAt: mangaList[mangaIndex].uploadedAt,
      uploadedBy: mangaList[mangaIndex].uploadedBy
    };

    mangaList[mangaIndex] = updatedManga as UploadedManga;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mangaList));
    
    return true;
  } catch (error) {
    console.error('Failed to update manga:', error);
    return false;
  }
};

// Delete manga
export const deleteManga = async (id: string): Promise<boolean> => {
  try {
    const mangaList = getMangaList();
    const filteredManga = mangaList.filter(manga => manga.id !== id);
    
    if (filteredManga.length === mangaList.length) {
      throw new Error('Manga not found');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredManga));
    return true;
  } catch (error) {
    console.error('Failed to delete manga:', error);
    return false;
  }
};

// Search manga
export const searchManga = (query: string): UploadedManga[] => {
  const mangaList = getMangaList();
  const lowercaseQuery = query.toLowerCase();
  
  return mangaList.filter(manga =>
    manga.title.toLowerCase().includes(lowercaseQuery) ||
    manga.author.toLowerCase().includes(lowercaseQuery) ||
    manga.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery))
  );
};

// Get manga statistics
export const getMangaStats = () => {
  const mangaList = getMangaList();
  
  return {
    totalManga: mangaList.length,
    totalChapters: mangaList.reduce((sum, manga) => sum + manga.chapters.length, 0),
    totalPages: mangaList.reduce((sum, manga) => 
      sum + manga.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.pages.length, 0), 0
    ),
    averageRating: mangaList.length > 0 
      ? mangaList.reduce((sum, manga) => sum + manga.rating, 0) / mangaList.length 
      : 0,
    statusBreakdown: {
      ongoing: mangaList.filter(m => m.status === 'ongoing').length,
      completed: mangaList.filter(m => m.status === 'completed').length,
      hiatus: mangaList.filter(m => m.status === 'hiatus').length,
      cancelled: mangaList.filter(m => m.status === 'cancelled').length,
    },
    genreBreakdown: mangaList.reduce((acc, manga) => {
      manga.genres.forEach(genre => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  };
};

// Convert uploaded manga to the format expected by the frontend
export const convertToFrontendFormat = (uploadedManga: UploadedManga) => {
  return {
    id: uploadedManga.id,
    title: uploadedManga.title,
    author: uploadedManga.author,
    coverImage: uploadedManga.coverImage,
    rating: uploadedManga.rating,
    genres: uploadedManga.genres,
    status: uploadedManga.status,
    description: uploadedManga.description,
    totalChapters: uploadedManga.chapters.length,
    chapters: uploadedManga.chapters.map(chapter => ({
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      pages: chapter.pages.map(page => ({
        id: page.id,
        pageNumber: page.pageNumber,
        imageUrl: page.imageUrl,
        width: 800, // Default dimensions
        height: 1200
      }))
    }))
  };
};