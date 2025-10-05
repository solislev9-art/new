import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Plus,
  Save,
  X,
  Image,
  FileText,
  User,
  Star,
  Calendar,
  Tag,
  BookOpen,
  ChevronDown,
  Trash2,
  Edit,
  Eye,
  LogOut,
  Settings,
  BarChart3,
  Users,
  Library,
  AlertCircle,
  Check,
  Clock,
  Link,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { getCurrentUser, logout, hasPermission } from '@/lib/auth';
import { uploadManga, getMangaList, deleteManga, MangaUpload, UploadedManga } from '@/lib/upload';

interface ChapterUpload {
  id: string;
  number: number;
  title: string;
  pages: File[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('upload');
  const [mangaList, setMangaList] = useState<UploadedManga[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [chapterPageUrls, setChapterPageUrls] = useState<{ [chapterId: string]: string }>({});

  // Form state
  const [mangaForm, setMangaForm] = useState<MangaUpload>({
    title: '',
    author: '',
    artist: '',
    description: '',
    genres: [],
    status: 'ongoing',
    type: 'manga',
    released: new Date().getFullYear().toString(),
    serialization: '',
    rating: 0,
    coverImage: null,
    chapters: []
  });

  const [newGenre, setNewGenre] = useState('');
  const [chapters, setChapters] = useState<ChapterUpload[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/admin/login');
      return;
    }
    loadMangaList();
  }, [currentUser, navigate]);

  const loadMangaList = async () => {
    try {
      const list = await getMangaList();
      setMangaList(list);
    } catch (error) {
      console.error('Failed to load manga list:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleInputChange = (field: keyof MangaUpload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMangaForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Utility function to fetch image from URL and convert to File
  const fetchImageAsFile = async (url: string, filename: string): Promise<File> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMangaForm(prev => ({
        ...prev,
        coverImage: file
      }));
      setCoverImageUrl(''); // Clear URL input when file is selected
    }
  };

  const handleCoverImageUrlChange = async () => {
    if (coverImageUrl.trim()) {
      try {
        const file = await fetchImageAsFile(coverImageUrl, `cover-${Date.now()}.jpg`);
        setMangaForm(prev => ({
          ...prev,
          coverImage: file
        }));
        setUploadStatus('Cover image fetched successfully!');
      } catch (error) {
        setUploadStatus('Failed to fetch cover image from URL.');
      }
    }
  };

  const addGenre = () => {
    if (newGenre.trim() && !mangaForm.genres.includes(newGenre.trim())) {
      setMangaForm(prev => ({
        ...prev,
        genres: [...prev.genres, newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setMangaForm(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  const addChapter = () => {
    const newChapter: ChapterUpload = {
      id: `chapter_${Date.now()}`,
      number: chapters.length + 1,
      title: `Chapter ${chapters.length + 1}`,
      pages: []
    };
    setChapters(prev => [...prev, newChapter]);
    setChapterPageUrls(prev => ({ ...prev, [newChapter.id]: '' }));
  };

  const updateChapter = (id: string, field: keyof ChapterUpload, value: any) => {
    setChapters(prev => prev.map(chapter => 
      chapter.id === id ? { ...chapter, [field]: value } : chapter
    ));
  };

  const removeChapter = (id: string) => {
    setChapters(prev => prev.filter(chapter => chapter.id !== id));
    setChapterPageUrls(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleChapterPagesChange = (chapterId: string, files: FileList | null) => {
    if (files) {
      const pagesArray = Array.from(files);
      updateChapter(chapterId, 'pages', pagesArray);
      setChapterPageUrls(prev => ({ ...prev, [chapterId]: '' })); // Clear URL input when files are selected
    }
  };

  const handleChapterPageUrlChange = async (chapterId: string) => {
    const url = chapterPageUrls[chapterId]?.trim();
    if (url) {
      try {
        const file = await fetchImageAsFile(url, `page-${Date.now()}.jpg`);
        setChapters(prev => prev.map(chapter => 
          chapter.id === chapterId ? { ...chapter, pages: [...chapter.pages, file] } : chapter
        ));
        setUploadStatus(`Page added to Chapter ${chapters.find(ch => ch.id === chapterId)?.number} successfully!`);
        setChapterPageUrls(prev => ({ ...prev, [chapterId]: '' }));
      } catch (error) {
        setUploadStatus('Failed to fetch page image from URL.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('upload_manga')) {
      alert('You do not have permission to upload manga');
      return;
    }

    // Validate required fields
    if (!mangaForm.title.trim()) {
      alert('Please enter a manga title');
      return;
    }

    if (!mangaForm.author.trim()) {
      alert('Please enter an author name');
      return;
    }

    if (mangaForm.genres.length === 0) {
      alert('Please add at least one genre');
      return;
    }

    if (chapters.length === 0) {
      alert('Please add at least one chapter');
      return;
    }

    // Validate chapters have pages
    const chaptersWithoutPages = chapters.filter(ch => ch.pages.length === 0);
    if (chaptersWithoutPages.length > 0) {
      alert(`Please add pages to all chapters. Missing pages in: ${chaptersWithoutPages.map(ch => `Chapter ${ch.number}`).join(', ')}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      const mangaData: MangaUpload = {
        ...mangaForm,
        chapters: chapters.map(chapter => ({
          number: chapter.number,
          title: chapter.title,
          pages: chapter.pages
        }))
      };

      const uploadedManga = await uploadManga(mangaData, (progress, status) => {
        setUploadProgress(progress);
        setUploadStatus(status);
      });

      // Reset form
      setMangaForm({
        title: '',
        author: '',
        artist: '',
        description: '',
        genres: [],
        status: 'ongoing',
        type: 'manga',
        released: new Date().getFullYear().toString(),
        serialization: '',
        rating: 0,
        coverImage: null,
        chapters: []
      });
      setChapters([]);
      setNewGenre('');
      setCoverImageUrl('');
      setChapterPageUrls({});
      
      // Reload manga list
      await loadMangaList();
      
      setUploadStatus('Upload completed successfully!');
      setTimeout(() => {
        setUploadStatus('');
        setUploadProgress(0);
      }, 3000);

      // Navigate to the created manga page
      navigate(`/manga/${uploadedManga.id}`);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteManga = async (mangaId: string) => {
    if (!hasPermission('delete_manga')) {
      alert('You do not have permission to delete manga');
      return;
    }

    if (confirm('Are you sure you want to delete this manga? This action cannot be undone.')) {
      try {
        await deleteManga(mangaId);
        await loadMangaList();
      } catch (error) {
        console.error('Failed to delete manga:', error);
        alert('Failed to delete manga');
      }
    }
  };

  const handleViewManga = (mangaId: string) => {
    navigate(`/manga/${mangaId}`);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">MangaVerse Admin</h1>
              </div>
              <Badge variant="outline" className="text-white border-white">
                {currentUser.role}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {currentUser.username}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                    <Settings className="h-4 w-4 mr-2" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 text-white border-gray-700">
                  <DropdownMenuItem onClick={() => navigate('/')} className="hover:bg-gray-800">
                    <Eye className="mr-2 h-4 w-4" />
                    View Site
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-800">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="upload" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              <Upload className="h-4 w-4 mr-2" />
              Upload Manga
            </TabsTrigger>
            <TabsTrigger value="manage" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              <Library className="h-4 w-4 mr-2" />
              Manage Manga
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="bg-gray-900 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Manga
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Add a new manga series with all details, chapters and pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Title *</Label>
                      <Input
                        id="title"
                        value={mangaForm.title}
                        onChange={handleInputChange('title')}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        placeholder="Enter manga title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-white">Author *</Label>
                      <Input
                        id="author"
                        value={mangaForm.author}
                        onChange={handleInputChange('author')}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        placeholder="Enter author name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="artist" className="text-white">Artist</Label>
                      <Input
                        id="artist"
                        value={mangaForm.artist}
                        onChange={handleInputChange('artist')}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        placeholder="Enter artist name (e.g., IKAGUCHI Ei, Higeneko)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serialization" className="text-white">Serialization</Label>
                      <Input
                        id="serialization"
                        value={mangaForm.serialization}
                        onChange={handleInputChange('serialization')}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        placeholder="Magazine/Publisher name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={mangaForm.description}
                      onChange={handleInputChange('description')}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                      placeholder="Enter manga description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-white">Status</Label>
                      <Select value={mangaForm.status} onValueChange={(value: any) => setMangaForm(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-600">
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="hiatus">Hiatus</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-white">Type</Label>
                      <Select value={mangaForm.type} onValueChange={(value: any) => setMangaForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-600">
                          <SelectItem value="manga">Manga</SelectItem>
                          <SelectItem value="manhwa">Manhwa</SelectItem>
                          <SelectItem value="manhua">Manhua</SelectItem>
                          <SelectItem value="novel">Novel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="released" className="text-white">Released Year</Label>
                      <Input
                        id="released"
                        value={mangaForm.released}
                        onChange={handleInputChange('released')}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-white">Rating (0-10)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={mangaForm.rating}
                      onChange={handleInputChange('rating')}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label htmlFor="cover" className="text-white">Cover Image</Label>
                    <Input
                      id="cover"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="bg-gray-800 border-gray-600 text-white file:bg-white file:text-black file:border-0 file:rounded file:px-3 file:py-1"
                    />
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="cover-url"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        placeholder="Or enter cover image URL"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCoverImageUrlChange())}
                      />
                      <Button
                        type="button"
                        onClick={handleCoverImageUrlChange}
                        size="sm"
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="space-y-2">
                    <Label className="text-white">Genres (Add as many as needed)</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        placeholder="Add genre (e.g., Romance, Action, Drama)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                      />
                      <Button type="button" onClick={addGenre} size="sm" className="bg-white text-black hover:bg-gray-200">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mangaForm.genres.map((genre) => (
                        <Badge key={genre} variant="secondary" className="bg-gray-700 text-white">
                          {genre}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-4 w-4 p-0 text-white hover:text-gray-300"
                            onClick={() => removeGenre(genre)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    {mangaForm.genres.length > 0 && (
                      <p className="text-sm text-gray-400">
                        {mangaForm.genres.length} genre{mangaForm.genres.length !== 1 ? 's' : ''} added
                      </p>
                    )}
                  </div>

                  {/* Chapters */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Chapters</Label>
                      <Button type="button" onClick={addChapter} size="sm" className="bg-white text-black hover:bg-gray-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Chapter
                      </Button>
                    </div>

                    {chapters.map((chapter) => (
                      <Card key={chapter.id} className="bg-gray-800 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">Chapter {chapter.number}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChapter(chapter.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-white">Chapter Title</Label>
                              <Input
                                value={chapter.title}
                                onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                                className="bg-gray-700 border-gray-500 text-white placeholder-gray-400"
                                placeholder="Chapter title"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-white">Chapter Number</Label>
                              <Input
                                type="number"
                                value={chapter.number}
                                onChange={(e) => updateChapter(chapter.id, 'number', parseInt(e.target.value))}
                                className="bg-gray-700 border-gray-500 text-white placeholder-gray-400"
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <Label className="text-white">Pages (Images)</Label>
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleChapterPagesChange(chapter.id, e.target.files)}
                              className="bg-gray-700 border-gray-500 text-white file:bg-white file:text-black file:border-0 file:rounded file:px-3 file:py-1"
                            />
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={chapterPageUrls[chapter.id] || ''}
                                onChange={(e) => setChapterPageUrls(prev => ({ ...prev, [chapter.id]: e.target.value }))}
                                className="bg-gray-700 border-gray-500 text-white placeholder-gray-400"
                                placeholder="Or enter page image URL"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleChapterPageUrlChange(chapter.id))}
                              />
                              <Button
                                type="button"
                                onClick={() => handleChapterPageUrlChange(chapter.id)}
                                size="sm"
                                className="bg-white text-black hover:bg-gray-200"
                              >
                                <Link className="h-4 w-4" />
                              </Button>
                            </div>
                            {chapter.pages.length > 0 && (
                              <p className="text-sm text-gray-400">
                                {chapter.pages.length} pages selected
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Upload Progress</span>
                        <span className="text-sm text-gray-300">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-gray-400">{uploadStatus}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUploading || !mangaForm.title || !mangaForm.author}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Upload Manga
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage">
            <Card className="bg-gray-900 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Manage Manga
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View and manage uploaded manga series
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mangaList.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No manga uploaded yet</p>
                    </div>
                  ) : (
                    mangaList.map((manga) => (
                      <Card key={manga.id} className="bg-gray-800 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              {manga.coverImage && (
                                <img
                                  src={manga.coverImage}
                                  alt={manga.title}
                                  className="w-16 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="text-white font-semibold">{manga.title}</h3>
                                <p className="text-gray-400 text-sm">by {manga.author}</p>
                                {manga.artist && manga.artist !== manga.author && (
                                  <p className="text-gray-400 text-sm">Artist: {manga.artist}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                                    {manga.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                                    {manga.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                                    {manga.chapters.length} chapters
                                  </Badge>
                                  <div className="flex items-center gap-1 text-yellow-400">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-xs">{manga.rating}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {manga.genres.map((genre) => (
                                    <Badge key={genre} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                      {genre}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  <p>Released: {manga.released} | Serialization: {manga.serialization}</p>
                                  <p>Posted by {manga.uploadedBy} on {new Date(manga.postedOn).toLocaleDateString()}</p>
                                  <p>Views: {manga.views} | Updated: {new Date(manga.updatedOn).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-gray-700">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-400 hover:text-green-300 hover:bg-gray-700"
                                onClick={() => handleViewManga(manga.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                                onClick={() => handleDeleteManga(manga.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Manga</p>
                      <p className="text-2xl font-bold">{mangaList.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Chapters</p>
                      <p className="text-2xl font-bold">
                        {mangaList.reduce((sum, manga) => sum + manga.chapters.length, 0)}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg Rating</p>
                      <p className="text-2xl font-bold">
                        {mangaList.length > 0 
                          ? (mangaList.reduce((sum, manga) => sum + manga.rating, 0) / mangaList.length).toFixed(1)
                          : '0.0'
                        }
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-white" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;