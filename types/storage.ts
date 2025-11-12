import { Post } from "./post";
import { Comment } from "./comment";

export interface PostsData {
  posts: Post[];
  metadata: {
    lastId: number;
    totalCount: number;
    lastUpdated: string;
  };
}

export interface CommentsData {
  comments: Comment[];
  metadata: {
    lastId: number;
    totalCount: number;
    lastUpdated: string;
  };
}
