/**
 * Extracts the video ID from a YouTube URL
 * @param url YouTube URL
 * @returns Video ID or null if not found
 */
export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Formats seconds to MM:SS format with proper padding
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Gets the thumbnail URL for a YouTube video
 * @param videoId YouTube video ID
 * @returns Thumbnail URL
 */
export const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

/**
 * Gets the video title from YouTube using our API
 * @param videoId YouTube video ID
 * @returns Promise that resolves to the video title
 */
export const getVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(`/api/video-info?videoId=${videoId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch video info: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.title || `YouTube Video (${videoId})`;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return `YouTube Video (${videoId})`;
  }
}; 