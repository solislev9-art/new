import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Bookmark,
  Share2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Star,
  Eye,
  Clock,
  Menu,
  X,
  StickyNote,
  History,
  BookOpen,
  Palette,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Timer,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import cover01 from "./images/front/1.webp";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  saveReadingProgress,
  getReadingProgress,
  addBookmark,
  getUserPreferences,
  saveUserPreferences,
  addToReadingHistory,
} from "@/lib/library";
import CommentSection from "./CommentSection";

// ----------------- Types -----------------
interface MangaPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: MangaPage[];
}

interface RelatedManga {
  id: string;
  title: string;
  coverImage: string;
  rating: number;
  status: string;
  author: string;
}

interface ReadingNote {
  id: string;
  pageNumber: number;
  chapterNumber: number;
  note: string;
  timestamp: string;
}

interface ReadingSession {
  startTime: Date;
  currentTime: number;
  isActive: boolean;
}

// ----------------- Local Images -----------------
const modules = import.meta.glob(
  "/src/components/images/manga/My Life Turned Around After Being Cheated on and Falsely Accused/ch*/**/*.webp",
  { eager: true, import: "default" }
);

const mangaSources: Record<string, Record<number, string[]>> = {
  1: {}
};

Object.entries(modules).forEach(([path, mod]) => {
  const match = path.match(/ch(\d+)/);
  if (match) {
    const chapter = parseInt(match[1]);
    if (!mangaSources[1][chapter]) {
      mangaSources[1][chapter] = [];
    }
    mangaSources[1][chapter].push(mod as string);
  }
});

Object.keys(mangaSources[1]).forEach(ch => {
  mangaSources[1][+ch].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
});

// ----------------- Component -----------------
const MangaReaderPage = () => {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterData, setCurrentChapterData] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [readingMode, setReadingMode] = useState<"single" | "double" | "webtoon">("single");
  const [readingDirection, setReadingDirection] = useState<"ltr" | "rtl">("ltr");
  const [showChapterList, setShowChapterList] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [readingSession, setReadingSession] = useState<ReadingSession>({
    startTime: new Date(),
    currentTime: 0,
    isActive: true
  });
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [readingTimer, setReadingTimer] = useState(0);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mangaDetails = {
    id: id || "1",
    title: "My Life Turned Around: After Being Cheated on and Falsely Accused, I Ended up Being Adored by the Most Beautiful Girl in School",
    author: "D",
    coverImage: cover01,
    rating: 8.58,
    status: "Ongoing",
    totalChapters: 3,
  };


  // Reading timer effect
  useEffect(() => {
    if (readingSession.isActive) {
      timerRef.current = setInterval(() => {
        setReadingTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [readingSession.isActive]);

  useEffect(() => {
    const generateChapters = () => {
      const mockChapters: Chapter[] = [];
      const mangaKey = "1";

      if (mangaSources[mangaKey]) {
        for (const [chapterNumber, imgs] of Object.entries(mangaSources[mangaKey])) {
          const pages = imgs.map((img, index) => ({
            id: `page-${chapterNumber}-${index + 1}`,
            pageNumber: index + 1,
            imageUrl: img,
            width: 800,
            height: 1200,
          }));

          mockChapters.push({
            id: `chapter-${chapterNumber}`,
            number: Number(chapterNumber),
            title: `Chapter ${chapterNumber}`,
            pages,
          });
        }
      }
      return mockChapters;
    };

    const mockChapters = generateChapters();
    setChapters(mockChapters);

    const savedProgress = getReadingProgress(id || "1");
    if (savedProgress) {
      setCurrentChapter(savedProgress.currentChapter);
      setCurrentChapterData(mockChapters[savedProgress.currentChapter - 1]);
      setCurrentPage(savedProgress.currentPage);
    }

    const initialChapter = parseInt(chapterId || "1");
    setCurrentChapter(initialChapter);
    setCurrentChapterData(mockChapters[initialChapter - 1] || mockChapters[0]);
    setIsLoading(false);

    const prefs = getUserPreferences();
    setReadingMode(prefs.readingMode);
    setReadingDirection(prefs.readingDirection);
  }, [chapterId]);

  useEffect(() => {
    if (currentChapterData) {
      const loadAllPages = async () => {
        const pageNumbers = currentChapterData.pages.map((p) => p.pageNumber);
        for (const pageNum of pageNumbers) {
          setTimeout(() => {
            setLoadedPages((prev) => new Set([...prev, pageNum]));
          }, pageNum * 0);
        }
      };

      setLoadedPages(new Set());
      loadAllPages();
    }
  }, [currentChapterData]);

  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (showControls) {
      resetControlsTimeout();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleChapterChange = (chapterNumber: number) => {
    const chapter = chapters.find((c) => c.number === chapterNumber);
    if (chapter) {
      setCurrentChapter(chapterNumber);
      setCurrentChapterData(chapter);
      setCurrentPage(1);
      setShowChapterList(false);

      navigate(`/reader/${id}/${chapterNumber}`, { replace: true });

      saveReadingProgress({
        mangaId: id || "1",
        currentChapter: chapterNumber,
        currentPage: 1,
        totalChapters: chapters.length,
        lastReadAt: new Date().toISOString(),
        readingTime: readingTimer,
      });
    }
  };

  const handlePageChange = (pageNumber: number) => {
    if (currentChapterData && pageNumber >= 1 && pageNumber <= currentChapterData.pages.length) {
      setCurrentPage(pageNumber);

      saveReadingProgress({
        mangaId: id || "1",
        currentChapter,
        currentPage: pageNumber,
        totalChapters: chapters.length,
        lastReadAt: new Date().toISOString(),
        readingTime: readingTimer,
      });
    }
  };

  const goToNextPage = () => {
    if (currentChapterData) {
      if (currentPage < currentChapterData.pages.length) {
        handlePageChange(currentPage + 1);
      } else if (currentChapter < chapters.length) {
        handleChapterChange(currentChapter + 1);
      }
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    } else if (currentChapter > 1) {
      const prevChapter = chapters.find((c) => c.number === currentChapter - 1);
      if (prevChapter) {
        setCurrentChapter(currentChapter - 1);
        setCurrentChapterData(prevChapter);
        setCurrentPage(prevChapter.pages.length);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleBookmark = () => {
    addBookmark({
      mangaId: id || "1",
      chapterNumber: currentChapter,
      pageNumber: currentPage,
      note: `Chapter ${currentChapter}, Page ${currentPage}`,
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/reader/${id}/${currentChapter}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPageProgress = () => {
    if (!currentChapterData) return 0;
    return (currentPage / currentChapterData.pages.length) * 100;
  };

  const getTotalProgress = () => {
    const totalPages = chapters.reduce((sum, chapter) => sum + chapter.pages.length, 0);
    const currentTotalPages = chapters
      .slice(0, currentChapter - 1)
      .reduce((sum, chapter) => sum + chapter.pages.length, 0) + currentPage;
    return (currentTotalPages / totalPages) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading manga pages...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        <div
          ref={readerRef}
          className="min-h-screen text-white relative overflow-hidden"
          style={{ backgroundColor }}
          onMouseMove={handleMouseMove}
        >
          {/* Top Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(-1)}
                      className="text-white hover:bg-white/20"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    <div className="text-white">
                      <h1 className="text-lg font-semibold">{mangaDetails.title}</h1>
                      <p className="text-sm text-white/70">
                        Chapter {currentChapter} - Page {currentPage} of {currentChapterData?.pages.length || 0}
                      </p>
                      <p className="text-xs text-white/50">
                        Reading time: {formatTime(readingTimer)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chapter List */}
                    <Sheet open={showChapterList} onOpenChange={setShowChapterList}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Menu className="mr-2 h-4 w-4" /> Chapters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-80 bg-black/95 text-white border-white/20">
                        <SheetHeader>
                          <SheetTitle className="text-white">Chapters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-2 max-h-[80vh] overflow-y-auto">
                          {chapters.map((chapter) => (
                            <Button
                              key={chapter.id}
                              variant={chapter.number === currentChapter ? "default" : "ghost"}
                              className={cn(
                                "w-full justify-start text-left",
                                chapter.number === currentChapter
                                  ? "bg-primary text-primary-foreground"
                                  : "text-white hover:bg-white/20"
                              )}
                              onClick={() => handleChapterChange(chapter.number)}
                            >
                              <div>
                                <div className="font-medium">{chapter.title}</div>
                                <div className="text-xs opacity-70">{chapter.pages.length} pages</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>

                    {/* Settings */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/95 text-white border-white/20 w-64">
                        <DropdownMenuLabel>Reader Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/20" />
                        
                        <div className="p-2 space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Background Color</Label>
                            <div className="flex gap-2">
                              {["#000000", "#1a1a1a", "#2d2d2d", "#ffffff"].map((color) => (
                                <button
                                  key={color}
                                  className="w-6 h-6 rounded border border-white/20"
                                  style={{ backgroundColor: color }}
                                  onClick={() => setBackgroundColor(color)}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">Brightness: {brightness}%</Label>
                            <Slider
                              value={[brightness]}
                              onValueChange={([value]) => setBrightness(value)}
                              max={200}
                              min={50}
                              step={10}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">Contrast: {contrast}%</Label>
                            <Slider
                              value={[contrast]}
                              onValueChange={([value]) => setContrast(value)}
                              max={200}
                              min={50}
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </div>
                        
                        <DropdownMenuSeparator className="bg-white/20" />
                        <DropdownMenuItem onClick={handleBookmark}>
                          <Bookmark className="mr-2 h-4 w-4" /> Bookmark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShare}>
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={toggleFullscreen}>
                          {isFullscreen ? (
                            <>
                              <Minimize className="mr-2 h-4 w-4" /> Exit Fullscreen
                            </>
                          ) : (
                            <>
                              <Maximize className="mr-2 h-4 w-4" /> Fullscreen
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowControls(false)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>Chapter Progress</span>
                    <span>{Math.round(getCurrentPageProgress())}%</span>
                  </div>
                  <Progress value={getCurrentPageProgress()} className="h-1" />

                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>Total Progress</span>
                    <span>{Math.round(getTotalProgress())}%</span>
                  </div>
                  <Progress value={getTotalProgress()} className="h-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Reader Area */}
          <div className="flex-1 flex items-center justify-center min-h-screen p-4">
            {currentChapterData && (
              <div className="relative max-w-4xl mx-auto">
                {readingMode === "webtoon" ? (
                  <div className="space-y-2">
                    {currentChapterData.pages.map((page) => (
                      <motion.div
                        key={page.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: loadedPages.has(page.pageNumber) ? 1 : 0.3,
                          y: 0,
                        }}
                        className="relative"
                      >
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-auto max-w-full"
                          style={{ 
                            transform: `scale(${zoom / 100})`,
                            filter: `brightness(${brightness}%) contrast(${contrast}%) sepia(${sepia}%)`
                          }}
                          loading="lazy"
                        />
                        {!loadedPages.has(page.pageNumber) && (
                          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                            <div className="text-white text-sm">Loading page {page.pageNumber}...</div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    key={`${currentChapter}-${currentPage}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {currentChapterData.pages[currentPage - 1] && (
                      <>
                        <img
                          src={currentChapterData.pages[currentPage - 1].imageUrl}
                          alt={`Page ${currentPage}`}
                          className="max-w-full max-h-[90vh] object-contain mx-auto"
                          style={{ 
                            transform: `scale(${zoom / 100})`,
                            filter: `brightness(${brightness}%) contrast(${contrast}%) sepia(${sepia}%)`
                          }}
                        />
                        {!loadedPages.has(currentPage) && (
                          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                            <div className="text-white">Loading page {currentPage}...</div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {showControls && readingMode !== "webtoon" && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-40"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={readingDirection === "ltr" ? goToPreviousPage : goToNextPage}
                        className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                        disabled={
                          (readingDirection === "ltr" && currentChapter === 1 && currentPage === 1) ||
                          (readingDirection === "rtl" && currentChapter === chapters.length && currentPage === (currentChapterData?.pages.length || 0))
                        }
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {readingDirection === "ltr" ? "Previous Page" : "Next Page"}
                    </TooltipContent>
                  </Tooltip>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-40"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={readingDirection === "ltr" ? goToNextPage : goToPreviousPage}
                        className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
                        disabled={
                          (readingDirection === "ltr" && currentChapter === chapters.length && currentPage === (currentChapterData?.pages.length || 0)) ||
                          (readingDirection === "rtl" && currentChapter === 1 && currentPage === 1)
                        }
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {readingDirection === "ltr" ? "Next Page" : "Previous Page"}
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Bottom Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentChapter === 1 && currentPage === 1}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom(Math.max(50, zoom - 25))}
                        className="text-white hover:bg-white/20"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-white/70 min-w-[60px] text-center">{zoom}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom(Math.min(200, zoom + 25))}
                        className="text-white hover:bg-white/20"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Select value={readingMode} onValueChange={(value: any) => setReadingMode(value)}>
                      <SelectTrigger className="w-32 bg-black/50 text-white border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 text-white border-white/20">
                        <SelectItem value="single">Single Page</SelectItem>
                        <SelectItem value="webtoon">All Pages/Webtoon</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentChapter === chapters.length && currentPage === (currentChapterData?.pages.length || 0)}
                      className="text-white hover:bg-white/20"
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Page Navigation Slider */}
                {readingMode !== "webtoon" && currentChapterData && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>Page {currentPage} of {currentChapterData.pages.length}</span>
                      <span>Chapter {currentChapter} of {chapters.length}</span>
                    </div>
                    <Slider
                      value={[currentPage]}
                      onValueChange={([value]) => handlePageChange(value)}
                      max={currentChapterData.pages.length}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment Section */}
        <CommentSection 
          mangaId={id || "1"} 
          chapterId={currentChapter.toString()}
          className="max-w-4xl mx-auto mt-8 mb-8"
        />
      </div>
    </TooltipProvider>
  );
};

export default MangaReaderPage;