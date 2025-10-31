export interface Post {
  _id: string;
  content: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
  };
  likesCount: number;
  commentsCount: number;
  isDeleted: boolean;
  media?: string[];
  mediaType?: ('image' | 'video')[];
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean; // For frontend state
}

export interface Comment {
  _id: string;
  content: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
  };
  postId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreatePostRequest {
  content: string;
  media?: string[];
  mediaType?: ('image' | 'video')[];
}

export interface UpdatePostRequest {
  content: string;
  media?: string[];
  mediaType?: ('image' | 'video')[];
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface PostResponse {
  success: boolean;
  message: string;
  data: Post;
}

export interface PostsResponse {
  success: boolean;
  message: string;
  data: Post[];
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: Comment;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: Comment[];
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    isLiked: boolean;
    likesCount: number;
  };
}

export interface UploadMediaResponse {
  success: boolean;
  message: string;
  data: {
    files: Array<{
      url: string;
      type: 'image' | 'video';
      filename: string;
    }>;
    urls: string[];
    types: ('image' | 'video')[];
  };
}
