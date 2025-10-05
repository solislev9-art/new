import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  BookOpen,
  Heart,
  Share2,
  Play,
  Calendar,
  Clock,
  Eye,
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  Tag,
  User,
  Building,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getMangaList, UploadedManga } from "@/lib/upload";

// Import images
import cover01 from "@/components/images/front/1.webp";

const MangaDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chapters");
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [readingProgress, setReadingProgress] = useState(65);
  const [mangaDetails, setMangaDetails] = useState<UploadedManga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMangaDetails = () => {
      try {
        const mangaList = getMangaList();
        const manga = mangaList.find(m => m.id === id);
        
        if (manga) {
          // Increment view count
          manga.views = (manga.views || 0) + 1;
          const updatedList = mangaList.map(m => m.id === id ? manga : m);
          localStorage.setItem('uploaded_manga', JSON.stringify(updatedList));
          
          setMangaDetails(manga);
        } else {
          // Fallback to mock data if manga not found
          setMangaDetails({
            id: id || "1",
            title: "Jinsei Gyakuten - Uwaki sare, Enzai wo Kiserareta Ore ga, Gakuen Ichi no Bishoujo ni Natsukareru",
            description: "At the end of summer, Eiji Aono witnesses his childhood friend and girlfriend, Miyuki Amada, cheating on him with Kondo, the ace of the soccer team. Betrayed by her and emotionally shattered, Eiji becomes the target of baseless slander and harassment. Cornered and with nowhere to turn, he escapes to the school rooftop—where he meets a mysterious girl...",
            coverImage: cover01,
            rating: 8.58,
            status: "ongoing",
            type: "manga",
            released: "2025",
            author: "D",
            artist: "IKAGUCHI Ei, Higeneko",
            serialization: "Comic Walker",
            uploadedBy: "Admin",
            postedOn: "2025-06-15T00:00:00.000Z",
            updatedOn: "2025-12-15T00:00:00.000Z",
            uploadedAt: "2025-06-15T00:00:00.000Z",
            views: 2400,
            genres: ["Romance", "Drama", "School Life", "Psychological", "Slice of Life", "Seinen"],
            chapters: [
              {
                id: "ch1",
                number: 1,
                title: "The Betrayal",
                pages: []
              },
              {
                id: "ch2", 
                number: 2,
                title: "Meeting Her",
                pages: []
              },
              {
                id: "ch3",
                number: 3,
                title: "New Beginning",
                pages: []
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error loading manga details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMangaDetails();
  }, [id]);

  // Mock chapters data
  const chapters = [
    {
      id: "ch1",
      number: 1,
      title: "The Betrayal",
      releaseDate: "Dec 15, 2024",
      pages: 55,
      isRead: true,
    },
    {
      id: "ch2",
      number: 2,
      title: "Meeting Her",
      releaseDate: "Dec 10, 2024",
      pages: 33,
      isRead: true,
    },
    {
      id: "ch3",
      number: 3,
      title: "New Beginning",
      releaseDate: "Dec 5, 2024",
      pages: 29,
      isRead: false,
    },
  ];

  // Mock related series
  const relatedSeries = [
    {
      id: "2",
      title: "Another Romance Story",
      coverImage: cover01,
      rating: 8.2,
      status: "Ongoing",
      type: "Manga",
    },
    {
      id: "3",
      title: "School Drama Series",
      coverImage: cover01,
      rating: 7.9,
      status: "Completed",
      type: "Manhwa",
    },
  ];

  const handleContinueReading = () => {
    if (mangaDetails) {
      navigate(`/reader/${mangaDetails.id}`);
    }
  };

  const handleReadChapter = (chapterNumber: number) => {
    if (mangaDetails) {
      navigate(`/reader/${mangaDetails.id}/${chapterNumber}`);
    }
  };

  const handleAddToLibrary = () => {
    setIsInLibrary(!isInLibrary);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading manga details...</p>
        </div>
      </div>
    );
  }

  if (!mangaDetails) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Manga Not Found</h1>
          <Button onClick={() => navigate('/')} className="bg-white text-black hover:bg-gray-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <TooltipProvider>
        {/* Header with Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${mangaDetails.coverImage})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          {/* Navigation */}
          <div className="relative z-10 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800/90 text-white border-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>

          {/* Manga Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <img
                    src={mangaDetails.coverImage}
                    alt={mangaDetails.title}
                    className="w-32 md:w-48 h-48 md:h-72 object-cover rounded-lg shadow-2xl border-2 border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                </motion.div>

                <div className="flex-1 text-white">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg text-white"
                  >
                    {mangaDetails.title}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-4 mb-4"
                  >
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-white">
                        {mangaDetails.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <BookOpen className="h-4 w-4 text-white" />
                      <span className="text-white font-medium">
                        {mangaDetails.chapters.length} chapters
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gray-800 text-white border-gray-600 capitalize"
                    >
                      {mangaDetails.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-white capitalize"
                    >
                      {mangaDetails.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-4 w-4 text-white" />
                      <span className="text-white">{mangaDetails.views.toLocaleString()}</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-3"
                  >
                    <Button
                      onClick={handleContinueReading}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Continue Reading
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleAddToLibrary}
                      className={cn(
                        "border-gray-600 text-white hover:bg-gray-800",
                        isInLibrary &&
                          "bg-red-900/20 border-red-400 text-red-100",
                      )}
                    >
                      <Heart
                        className={cn(
                          "mr-2 h-4 w-4",
                          isInLibrary && "fill-current",
                        )}
                      />
                      {isInLibrary ? "In Library" : "Add to Library"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-gray-800"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Reading Progress */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="h-5 w-5" />
                    Reading Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>
                        Chapter {mangaDetails.chapters.length} of{" "}
                        {mangaDetails.chapters.length}
                      </span>
                      <span>{readingProgress}%</span>
                    </div>
                    <Progress value={readingProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    {mangaDetails.description}
                  </p>
                </CardContent>
              </Card>

              {/* Tabs for Chapters and Related */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                  <TabsTrigger value="chapters" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">Chapters</TabsTrigger>
                  <TabsTrigger value="related" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">Related Series</TabsTrigger>
                </TabsList>

                <TabsContent value="chapters" className="mt-6">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <span>Chapters ({mangaDetails?.chapters.length || 0})</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-600">
                            <DropdownMenuItem className="text-white hover:bg-gray-700">
                              Mark all as read
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-600" />
                            <DropdownMenuItem className="text-white hover:bg-gray-700">Sort by newest</DropdownMenuItem>
                            <DropdownMenuItem className="text-white hover:bg-gray-700">Sort by oldest</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-1">
                        {mangaDetails?.chapters.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No chapters available yet</p>
                          </div>
                        ) : (
                          mangaDetails?.chapters.map((chapter, index) => (
                            <motion.div
                              key={chapter.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "flex items-center justify-between p-4 hover:bg-gray-800 transition-colors border-b border-gray-700 last:border-b-0",
                              )}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  <div>
                                    <h4 className="font-medium text-white">
                                      Chapter {chapter.number}: {chapter.title}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                      <span>{chapter.pages.length} pages</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                                      <Bookmark className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Bookmark</TooltipContent>
                                </Tooltip>
                                <Button
                                  onClick={() =>
                                    handleReadChapter(chapter.number)
                                  }
                                  size="sm"
                                  className="bg-white text-black hover:bg-gray-200"
                                >
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Read
                                </Button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="related" className="mt-6">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Related Series</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedSeries.map((manga) => (
                          <motion.div
                            key={manga.id}
                            whileHover={{ y: -2 }}
                            className="flex gap-3 p-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all cursor-pointer"
                            onClick={() => navigate(`/manga/${manga.id}`)}
                          >
                            <img
                              src={manga.coverImage}
                              alt={manga.title}
                              className="w-16 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium line-clamp-1 text-white">
                                {manga.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-gray-300">
                                    {manga.rating}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                  {manga.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {manga.type}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Manga Information */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Status</p>
                        <p className="text-sm text-gray-300 capitalize">
                          {mangaDetails.status}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Type</p>
                        <p className="text-sm text-gray-300 capitalize">
                          {mangaDetails.type}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Released</p>
                        <p className="text-sm text-gray-300">
                          {mangaDetails.released}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Author</p>
                        <p className="text-sm text-gray-300">
                          {mangaDetails.author}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Artist</p>
                        <p className="text-sm text-gray-300">
                          {mangaDetails.artist}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Serialization</p>
                        <p className="text-sm text-gray-300">
                          {mangaDetails.serialization}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Posted By</p>
                        <p className="text-sm text-gray-300">
                          {mangaDetails.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Posted On</p>
                        <p className="text-sm text-gray-300">
                          {new Date(mangaDetails.postedOn).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Updated On</p>
                        <p className="text-sm text-gray-300">
                          {new Date(mangaDetails.updatedOn).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Views</p>
                        <p className="text-sm text-gray-300">
                          {mangaDetails.views.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white">Genres</p>
                      <div className="flex flex-wrap gap-1">
                        {mangaDetails?.genres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="border-gray-600 text-white hover:bg-gray-800 text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full bg-white text-black hover:bg-gray-200" onClick={handleContinueReading}>
                    <Play className="mr-2 h-4 w-4" />
                    Continue Reading
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-white hover:bg-gray-800"
                    onClick={handleAddToLibrary}
                  >
                    <Heart
                      className={cn(
                        "mr-2 h-4 w-4",
                        isInLibrary && "fill-current text-red-500",
                      )}
                    />
                    {isInLibrary ? "Remove from Library" : "Add to Library"}
                  </Button>

                  <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MangaDetailsPage;