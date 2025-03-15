export interface SavedClip {
  id: string;
  videoId: string;
  title: string;
  startTime: number;
  endTime: number;
  thumbnailUrl: string;
  createdAt: number; // timestamp for sorting by most recent
} 