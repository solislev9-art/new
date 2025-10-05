import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Edit, 
  Trash2, 
  Send, 
  User,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Alert, AlertDescription } from './ui/alert';
import { 
  getComments, 
  getReplies, 
  addComment, 
  updateComment, 
  deleteComment, 
  toggleCommentLike,
  Comment as CommentType 
} from '@/lib/comments';
import { getCurrentRegularUser, isUserAuthenticated } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface CommentSectionProps {
  mangaId: string;
  chapterId?: string;
  className?: string;
}

interface CommentItemProps {
  comment: CommentType;
  onReply: (parentId: string) => void;
  onUpdate: () => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  onUpdate, 
  level = 0 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = getCurrentRegularUser();
  const isOwner = currentUser?.id === comment.userId;
  const hasLiked = currentUser ? comment.likedBy.includes(currentUser.id) : false;

  useEffect(() => {
    if (showReplies) {
      setReplies(getReplies(comment.id));
    }
  }, [showReplies, comment.id]);

  const handleLike = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    const result = toggleCommentLike(comment.id);
    if (result.success) {
      onUpdate();
    }
    setIsLoading(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setIsLoading(true);
    const result = updateComment(comment.id, editContent);
    if (result.success) {
      setIsEditing(false);
      onUpdate();
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setIsLoading(true);
    const result = deleteComment(comment.id);
    if (result.success) {
      onUpdate();
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className="mb-4 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-100 text-gray-600">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{comment.username}</span>
                  <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                  {comment.updatedAt && (
                    <Badge variant="secondary" className="text-xs">edited</Badge>
                  )}
                </div>
                
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Edit your comment..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEdit} disabled={isLoading}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
              )}
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={!currentUser || isLoading}
                  className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                  {comment.likes > 0 && <span>{comment.likes}</span>}
                </Button>
                
                {level < 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(comment.id)}
                    disabled={!currentUser}
                    className="flex items-center gap-1 text-gray-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Reply
                  </Button>
                )}
                
                {replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-gray-500"
                  >
                    {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showReplies && replies.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onUpdate={() => {
            setReplies(getReplies(comment.id));
            onUpdate();
          }}
          level={level + 1}
        />
      ))}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ 
  mangaId, 
  chapterId, 
  className = '' 
}) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const currentUser = getCurrentRegularUser();
  const navigate = useNavigate();

  const loadComments = () => {
    setComments(getComments(mangaId, chapterId));
  };

  useEffect(() => {
    loadComments();
  }, [mangaId, chapterId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    const result = addComment(mangaId, newComment, chapterId);
    
    if (result.success) {
      setNewComment('');
      loadComments();
    } else {
      setError(result.error || 'Failed to add comment');
    }
    
    setIsLoading(false);
  };

  const handleAddReply = async () => {
    if (!replyContent.trim() || !replyingTo) return;
    
    setIsLoading(true);
    setError('');
    
    const result = addComment(mangaId, replyContent, chapterId, replyingTo);
    
    if (result.success) {
      setReplyContent('');
      setReplyingTo(null);
      loadComments();
    } else {
      setError(result.error || 'Failed to add reply');
    }
    
    setIsLoading(false);
  };

  if (!isUserAuthenticated()) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Comments</h3>
        <Alert>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Please log in to view and post comments.</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        Comments ({comments.length})
      </h3>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Add new comment */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-100 text-gray-600">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this manga..."
              className="min-h-[100px] mb-2"
            />
            <Button 
              onClick={handleAddComment}
              disabled={!newComment.trim() || isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Post Comment
            </Button>
          </div>
        </div>
      </div>
      
      {/* Reply form */}
      {replyingTo && (
        <div className="mb-6 ml-11 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Replying to comment</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setReplyingTo(null);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </div>
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            className="min-h-[80px] mb-2"
          />
          <Button 
            onClick={handleAddReply}
            disabled={!replyContent.trim() || isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Post Reply
          </Button>
        </div>
      )}
      
      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyingTo}
              onUpdate={loadComments}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;