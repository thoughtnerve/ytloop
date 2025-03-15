import { SavedClip } from './types';

const STORAGE_KEY = 'ytloop_saved_clips';
const LAST_PLAYED_KEY = 'ytloop_last_played';

// Get all saved clips from local storage
export const getSavedClips = (): SavedClip[] => {
  if (typeof window === 'undefined') return [];
  
  const savedClipsJson = localStorage.getItem(STORAGE_KEY);
  if (!savedClipsJson) return [];
  
  try {
    return JSON.parse(savedClipsJson);
  } catch (error) {
    console.error('Error parsing saved clips:', error);
    return [];
  }
};

// Save a clip to local storage
export const saveClip = (clip: SavedClip): void => {
  if (typeof window === 'undefined') return;
  
  const savedClips = getSavedClips();
  
  // Check if clip with same ID already exists
  const existingClipIndex = savedClips.findIndex(c => c.id === clip.id);
  
  if (existingClipIndex !== -1) {
    // Update existing clip
    savedClips[existingClipIndex] = clip;
  } else {
    // Add new clip
    savedClips.unshift(clip);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedClips));
};

// Remove a clip from local storage
export const removeClip = (clipId: string): void => {
  if (typeof window === 'undefined') return;
  
  const savedClips = getSavedClips();
  const updatedClips = savedClips.filter(clip => clip.id !== clipId);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClips));
};

// Generate a unique ID for a clip
export const generateClipId = (videoId: string, startTime: number, endTime: number): string => {
  return `${videoId}_${startTime}_${endTime}`;
};

// Update the last played timestamp for a video
export const updateLastPlayed = (videoId: string): void => {
  if (typeof window === 'undefined') return;
  
  const lastPlayedJson = localStorage.getItem(LAST_PLAYED_KEY);
  let lastPlayed: Record<string, number> = {};
  
  if (lastPlayedJson) {
    try {
      lastPlayed = JSON.parse(lastPlayedJson);
    } catch (error) {
      console.error('Error parsing last played data:', error);
    }
  }
  
  // Update timestamp for this video
  lastPlayed[videoId] = Date.now();
  
  localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(lastPlayed));
};

// Get the last played timestamp for a video
export const getLastPlayed = (videoId: string): number => {
  if (typeof window === 'undefined') return 0;
  
  const lastPlayedJson = localStorage.getItem(LAST_PLAYED_KEY);
  if (!lastPlayedJson) return 0;
  
  try {
    const lastPlayed = JSON.parse(lastPlayedJson);
    return lastPlayed[videoId] || 0;
  } catch (error) {
    console.error('Error parsing last played data:', error);
    return 0;
  }
};

// Get all last played timestamps
export const getAllLastPlayed = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};
  
  const lastPlayedJson = localStorage.getItem(LAST_PLAYED_KEY);
  if (!lastPlayedJson) return {};
  
  try {
    return JSON.parse(lastPlayedJson);
  } catch (error) {
    console.error('Error parsing last played data:', error);
    return {};
  }
}; 