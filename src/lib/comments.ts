import { getCurrentRegularUser } from './auth';

export interface Comment {
  id: string;
  mangaId: string;
  chapterId?: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
  parentId?: string;
}

const COMMENTS_KEY = 'manga_comments';

// Get all comments
const getAllComments = (): Comment[] => {
  const stored = localStorage.getItem(COMMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save all comments
const saveAllComments = (comments: Comment[]) => {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

// Get comments for a specific manga/chapter
export const getComments = (mangaId: string, chapterId?: string): Comment[] => {
  const allComments = getAllComments();
  return allComments
    .filter(comment => 
      comment.mangaId === mangaId && 
      (!chapterId || comment.chapterId === chapterId) &&
      !comment.parentId // Only get top-level comments
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get replies for a comment
export const getReplies = (parentId: string): Comment[] => {
  const allComments = getAllComments();
  return allComments
    .filter(comment => comment.parentId === parentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

// Add a new comment
export const addComment = (
  mangaId: string,
  content: string,
  chapterId?: string,
  parentId?: string
): { success: boolean; comment?: Comment; error?: string } => {
  const user = getCurrentRegularUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in to comment' };
  }
  
  if (!content.trim()) {
    return { success: false, error: 'Comment cannot be empty' };
  }
  
  const comment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    mangaId,
    chapterId,
    userId: user.id,
    username: user.username,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    parentId
  };
  
  const allComments = getAllComments();
  allComments.push(comment);
  saveAllComments(allComments);
  
  return { success: true, comment };
};

// Update a comment
export const updateComment = (
  commentId: string,
  content: string
): { success: boolean; error?: string } => {
  const user = getCurrentRegularUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in to edit comments' };
  }
  
  if (!content.trim()) {
    return { success: false, error: 'Comment cannot be empty' };
  }
  
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, error: 'Comment not found' };
  }
  
  const comment = allComments[commentIndex];
  
  if (comment.userId !== user.id) {
    return { success: false, error: 'You can only edit your own comments' };
  }
  
  allComments[commentIndex] = {
    ...comment,
    content: content.trim(),
    updatedAt: new Date().toISOString()
  };
  
  saveAllComments(allComments);
  
  return { success: true };
};

// Delete a comment
export const deleteComment = (commentId: string): { success: boolean; error?: string } => {
  const user = getCurrentRegularUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in to delete comments' };
  }
  
  const allComments = getAllComments();
  const comment = allComments.find(c => c.id === commentId);
  
  if (!comment) {
    return { success: false, error: 'Comment not found' };
  }
  
  if (comment.userId !== user.id) {
    return { success: false, error: 'You can only delete your own comments' };
  }
  
  // Remove the comment and all its replies
  const filteredComments = allComments.filter(c => 
    c.id !== commentId && c.parentId !== commentId
  );
  
  saveAllComments(filteredComments);
  
  return { success: true };
};

// Like/unlike a comment
export const toggleCommentLike = (commentId: string): { success: boolean; error?: string } => {
  const user = getCurrentRegularUser();
  
  if (!user) {
    return { success: false, error: 'You must be logged in to like comments' };
  }
  
  const allComments = getAllComments();
  const commentIndex = allComments.findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, error: 'Comment not found' };
  }
  
  const comment = allComments[commentIndex];
  const hasLiked = comment.likedBy.includes(user.id);
  
  if (hasLiked) {
    // Unlike
    allComments[commentIndex] = {
      ...comment,
      likes: comment.likes - 1,
      likedBy: comment.likedBy.filter(id => id !== user.id)
    };
  } else {
    // Like
    allComments[commentIndex] = {
      ...comment,
      likes: comment.likes + 1,
      likedBy: [...comment.likedBy, user.id]
    };
  }
  
  saveAllComments(allComments);
  
  return { success: true };
};

// Get comment count for a manga/chapter
export const getCommentCount = (mangaId: string, chapterId?: string): number => {
  const allComments = getAllComments();
  return allComments.filter(comment => 
    comment.mangaId === mangaId && 
    (!chapterId || comment.chapterId === chapterId)
  ).length;
};