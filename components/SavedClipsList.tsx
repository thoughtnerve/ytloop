import React, { useState, useEffect } from 'react';
import { SavedClip } from '../utils/types';
import { getSavedClips, removeClip, getAllLastPlayed } from '../utils/storage';
import SavedClipItem from './SavedClipItem';

interface SavedClipsListProps {
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

const SavedClipsList: React.FC<SavedClipsListProps> = ({ onSelectClip, refreshTrigger }) => {
  const [videoClips, setVideoClips] = useState<VideoClips[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Count total clips
  const totalClips = videoClips.reduce((total, video) => total + video.clips.length, 0);

  if (totalClips === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <div 
        className="flex justify-between items-center mb-3 cursor-pointer"
        onClick={toggleExpanded}
      >
        <h3 className="font-bold">Saved Clips ({totalClips})</h3>
        <span className="text-sm text-blue-500">
          {isExpanded ? 'Hide' : 'Show All'}
        </span>
      </div>
      
      <div className={`${isExpanded ? '' : 'max-h-96 overflow-y-auto'}`}>
        {videoClips.map(videoClip => (
          <div key={videoClip.videoId} className="mb-6">
            <h4 className="font-medium mb-2">{videoClip.title}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
    </div>
  );
};

export default SavedClipsList; 