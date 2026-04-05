export interface ReviewDocument {
  _id: string;              // e.g. "review_abc123"
  _rev?: string;
  type: 'review';
  movie_id: string;         // reference → MovieDocument._id
  user_id: string;          // reference → UserDocument._id
  username: string;         // denormalized — avoids extra DB call on display
  rating: number;           // 1-10
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
}