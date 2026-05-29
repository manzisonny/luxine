export type MediaType = 'photo' | 'video';

export interface MediaComment {
  id: string;
  mediaId: string;
  authorName: string;
  content: string;
  likesCount: number;
  createdAt: string;
}

export interface Media {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  caption: string;
  tags: string[];
  isFavourite: boolean;
  durationSeconds?: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  authorName: string;
  content: string;
  isSpecial: boolean;
  isPinned: boolean;
  likesCount: number;
  createdAt: string;
}

export type EventType = 'appointment' | 'special' | 'goal' | 'dream' | 'birthday' | 'personal';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  type: EventType;
  color?: string;
  completed: boolean;
}

export interface MoodLog {
  id: string;
  emoji: string;
  label: string;
  date: string; // YYYY-MM-DD
}

export interface WatchListItem {
  id: string;
  title: string;
  platform: string;
  type: 'movie' | 'show' | 'documentary';
  status: 'want_to_watch' | 'watching' | 'watched';
  rating: number; // 1 to 5
  notes?: string;
}

export interface AppState {
  granted: boolean;
  isAdmin: boolean;
  visitorId: string;
}
