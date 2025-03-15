import React, { useState, useEffect } from 'react';
import { SavedClip } from '../utils/types';
import { getSavedClips, removeClip, getAllLastPlayed } from '../utils/storage';
import SavedClipItem from './SavedClipItem';

interface SavedClipsViewProps {
  onSelectClip: (clip: SavedClip) => void;
  refreshTrigger?: number; // Timestamp to trigger refresh
}

// Helper type for organizing clips by video
interface VideoClips {
  videoId: string;
  title: string; // Video title (using the first clip's title)
  thumbnailUrl: string; // Video thumbnail (using the first clip's thumbnail)
  clips: SavedClip[];
  lastPlayed: number; // Timestamp when the video was last played
}

const SavedClipsView: React.FC<SavedClipsViewProps> = ({ onSelectClip, refreshTrigger }) => {
  const [videoClips, setVideoClips] = useState<VideoClips[]>([]);

  // Load saved clips from local storage and organize by video
  useEffect(() => {
    const allClips = getSavedClips();
    const lastPlayedData = getAllLastPlayed();
    
    // Group clips by videoId
    const clipsByVideo: Record<string, SavedClip[]> = {};
    
    allClips.forEach(clip => {
      if (!clipsByVideo[clip.videoId]) {
        clipsByVideo[clip.videoId] = [];
      }
      clipsByVideo[clip.videoId].push(clip);
    });
    
    // Convert to array and sort clips within each video by start time
    const organizedClips: VideoClips[] = Object.keys(clipsByVideo).map(videoId => {
      const clips = clipsByVideo[videoId].sort((a, b) => a.startTime - b.startTime);
      return {
        videoId,
        title: clips[0].title,
        thumbnailUrl: clips[0].thumbnailUrl,
        clips,
        lastPlayed: lastPlayedData[videoId] || 0 // Get last played timestamp or default to 0
      };
    });
    
    // Sort videos by last played timestamp (most recent first)
    organizedClips.sort((a, b) => b.lastPlayed - a.lastPlayed);
    
    setVideoClips(organizedClips);
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  // Handle clip deletion
  const handleDeleteClip = (clipId: string) => {
    removeClip(clipId);
    
    // Update the state after deletion
    const allClips = getSavedClips();
    const lastPlayedData = getAllLastPlayed();
    
    // Group clips by videoId
    const clipsByVideo: Record<string, SavedClip[]> = {};
    
    allClips.forEach(clip => {
      if (!clipsByVideo[clip.videoId]) {
        clipsByVideo[clip.videoId] = [];
      }
      clipsByVideo[clip.videoId].push(clip);
    });
    
    // Convert to array and sort clips within each video by start time
    const organizedClips: VideoClips[] = Object.keys(clipsByVideo).map(videoId => {
      const clips = clipsByVideo[videoId].sort((a, b) => a.startTime - b.startTime);
      return {
        videoId,
        title: clips[0].title,
        thumbnailUrl: clips[0].thumbnailUrl,
        clips,
        lastPlayed: lastPlayedData[videoId] || 0 // Get last played timestamp or default to 0
      };
    });
    
    // Sort videos by last played timestamp (most recent first)
    organizedClips.sort((a, b) => b.lastPlayed - a.lastPlayed);
    
    setVideoClips(organizedClips);
  };

  // Count total clips
  const totalClips = videoClips.reduce((total, video) => total + video.clips.length, 0);

  if (totalClips === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Your Saved Clips</h2>
      
      {videoClips.map(videoClip => (
        <div key={videoClip.videoId} className="mb-8">
          <h3 className="font-medium mb-3 text-lg">{videoClip.title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {videoClip.clips.map(clip => (
              <SavedClipItem
                key={clip.id}
                clip={clip}
                onSelect={onSelectClip}
                onDelete={handleDeleteClip}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedClipsView; 