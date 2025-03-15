import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubePlayer, YouTubeEvent } from 'react-youtube';
import { FaPlay, FaPause, FaRedo, FaBookmark } from 'react-icons/fa';
import KeyboardShortcuts from './KeyboardShortcuts';
import SavedClipsList from './SavedClipsList';
import { formatTime, getThumbnailUrl, getVideoTitle } from '../utils/youtube';
import { SavedClip } from '../utils/types';
import { saveClip, generateClipId, updateLastPlayed } from '../utils/storage';

interface TimeRange {
  start: number;
  end: number;
}

interface VideoPlayerProps {
  videoId: string;
  onVideoChange?: (videoId: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onVideoChange }) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 0 });
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [refreshClipsList, setRefreshClipsList] = useState<number>(Date.now());
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const saveMessageTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle player ready event
  const handleReady = (event: YouTubeEvent) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    setTimeRange({ start: 0, end: event.target.getDuration() });
  };

  // Handle player state change
  const handleStateChange = (event: YouTubeEvent) => {
    // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    setIsPlaying(event.data === 1);
    
    // Update last played timestamp when video starts playing
    if (event.data === 1) {
      updateLastPlayed(videoId);
    }
    
    if (event.data === 0 && isLooping) {
      // Video ended, restart from start point
      event.target.seekTo(timeRange.start);
      event.target.playVideo();
    }
  };

  // Update current time
  useEffect(() => {
    if (player && isPlaying) {
      checkInterval.current = setInterval(() => {
        const currentTime = player.getCurrentTime();
        setCurrentTime(currentTime);
        
        // Check if we need to loop back to start point
        if (currentTime >= timeRange.end && isLooping) {
          player.seekTo(timeRange.start);
        }
      }, 100);
    }

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [player, isPlaying, timeRange, isLooping]);

  // Handle play/pause
  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  // Handle restart
  const restartVideo = () => {
    if (player) {
      player.seekTo(timeRange.start);
      player.playVideo();
    }
  };

  // Save current clip
  const handleSaveClip = () => {
    const clipId = generateClipId(videoId, timeRange.start, timeRange.end);
    const clip: SavedClip = {
      id: clipId,
      videoId,
      title: getVideoTitle(videoId),
      startTime: timeRange.start,
      endTime: timeRange.end,
      thumbnailUrl: getThumbnailUrl(videoId),
      createdAt: Date.now()
    };
    
    saveClip(clip);
    
    // Trigger refresh of the clips list
    setRefreshClipsList(Date.now());
    
    // Show success message briefly
    setSaveSuccess(true);
    
    if (saveMessageTimeout.current) {
      clearTimeout(saveMessageTimeout.current);
    }
    
    saveMessageTimeout.current = setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  // Load a saved clip
  const handleSelectClip = (clip: SavedClip) => {
    if (clip.videoId === videoId) {
      // Same video, just update time range
      setTimeRange({
        start: clip.startTime,
        end: clip.endTime
      });
      
      if (player) {
        player.seekTo(clip.startTime);
        player.playVideo();
      }
    } else {
      // Different video, use the callback to change the video
      if (onVideoChange) {
        onVideoChange(clip.videoId);
        // The time range will be set when the new video loads
        // We'll store the clip info to apply after loading
        sessionStorage.setItem('pendingClip', JSON.stringify({
          startTime: clip.startTime,
          endTime: clip.endTime
        }));
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!player) return;

      switch (e.key) {
        case ' ': // Space bar
          e.preventDefault();
          togglePlay();
          break;
        case 'r': // R key
          e.preventDefault();
          restartVideo();
          break;
        case 'ArrowLeft': // Left arrow
          e.preventDefault();
          player.seekTo(Math.max(0, player.getCurrentTime() - 5));
          break;
        case 'ArrowRight': // Right arrow
          e.preventDefault();
          player.seekTo(Math.min(duration, player.getCurrentTime() + 5));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [player, duration]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveMessageTimeout.current) {
        clearTimeout(saveMessageTimeout.current);
      }
    };
  }, []);

  // Apply pending clip time range if it exists
  useEffect(() => {
    const pendingClipJson = sessionStorage.getItem('pendingClip');
    if (pendingClipJson && player) {
      try {
        const pendingClip = JSON.parse(pendingClipJson);
        setTimeRange({
          start: pendingClip.startTime,
          end: pendingClip.endTime
        });
        player.seekTo(pendingClip.startTime);
        // Clear the pending clip
        sessionStorage.removeItem('pendingClip');
      } catch (error) {
        console.error('Error applying pending clip:', error);
      }
    }
  }, [player]);

  return (
    <div className="mb-8">
      <div className="aspect-w-16 aspect-h-9 mb-4 bg-black rounded-lg overflow-hidden">
        <YouTube
          videoId={videoId}
          onReady={handleReady}
          onStateChange={handleStateChange}
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              controls: 1,
              rel: 0,
            },
          }}
          className="w-full h-full"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-4 justify-center">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {isPlaying ? <FaPause /> : <FaPlay />} {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={restartVideo}
          className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <FaRedo /> Restart
        </button>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="loop-toggle"
            checked={isLooping}
            onChange={() => setIsLooping(!isLooping)}
            className="w-4 h-4"
          />
          <label htmlFor="loop-toggle">Loop Video</label>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <div className="flex items-center">
            <button
              onClick={() => {
                if (player) {
                  const currentPos = player.getCurrentTime();
                  // Only update if the current position is valid for start time
                  if (currentPos < timeRange.end) {
                    setTimeRange(prev => ({
                      ...prev,
                      start: currentPos
                    }));
                    setCurrentTime(currentPos);
                  }
                }
              }}
              className="mr-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
              disabled={!player}
              title="Set current position as start time"
            >
              Start:
            </button>
            <input
              type="text"
              value={formatTime(timeRange.start)}
              onChange={(e) => {
                const timeString = e.target.value;
                // Parse time string (MM:SS or HH:MM:SS format)
                const timeParts = timeString.split(':').map(part => parseInt(part, 10));
                let seconds = 0;
                
                if (timeParts.length === 2) {
                  // MM:SS format
                  seconds = timeParts[0] * 60 + timeParts[1];
                } else if (timeParts.length === 3) {
                  // HH:MM:SS format
                  seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
                }
                
                if (!isNaN(seconds) && seconds >= 0 && seconds < timeRange.end) {
                  setTimeRange(prev => ({
                    ...prev,
                    start: seconds
                  }));
                  
                  if (player && currentTime < seconds) {
                    player.seekTo(seconds);
                  }
                }
              }}
              className="w-20 px-2 py-1 border rounded text-center"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                if (player) {
                  const currentPos = player.getCurrentTime();
                  // Only update if the current position is valid for end time
                  if (currentPos > timeRange.start) {
                    setTimeRange(prev => ({
                      ...prev,
                      end: currentPos
                    }));
                    setCurrentTime(currentPos);
                  }
                }
              }}
              className="mr-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
              disabled={!player}
              title="Set current position as end time"
            >
              End:
            </button>
            <input
              type="text"
              value={formatTime(timeRange.end)}
              onChange={(e) => {
                const timeString = e.target.value;
                // Parse time string (MM:SS or HH:MM:SS format)
                const timeParts = timeString.split(':').map(part => parseInt(part, 10));
                let seconds = 0;
                
                if (timeParts.length === 2) {
                  // MM:SS format
                  seconds = timeParts[0] * 60 + timeParts[1];
                } else if (timeParts.length === 3) {
                  // HH:MM:SS format
                  seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
                }
                
                if (!isNaN(seconds) && seconds > timeRange.start && seconds <= duration) {
                  setTimeRange(prev => ({
                    ...prev,
                    end: seconds
                  }));
                }
              }}
              className="w-20 px-2 py-1 border rounded text-center"
            />
          </div>
        </div>
        
        {/* Current playback position indicator */}
        <div className="text-center mb-2 text-sm">
          Current: {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        
        <div className="relative mb-4">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={timeRange.start}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = parseFloat(e.target.value);
              const newStart = Math.min(value, timeRange.end - 1);
              
              setTimeRange((prev: TimeRange) => ({
                ...prev,
                start: newStart,
              }));
              
              // Seek the video to the new start position
              if (player) {
                player.seekTo(newStart);
                // If the video is not playing, update the current time display
                if (!isPlaying) {
                  setCurrentTime(newStart);
                }
              }
            }}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider-thumb dark:bg-gray-700"
          />
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={timeRange.end}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = parseFloat(e.target.value);
              const newEnd = Math.max(value, timeRange.start + 1);
              
              setTimeRange((prev: TimeRange) => ({
                ...prev,
                end: newEnd,
              }));
              
              // If current playback position is beyond the new end,
              // seek to the new end position
              if (player && currentTime > newEnd) {
                player.seekTo(newEnd);
                // If the video is not playing, update the current time display
                if (!isPlaying) {
                  setCurrentTime(newEnd);
                }
              }
            }}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider-thumb dark:bg-gray-700"
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleSaveClip}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <FaBookmark /> Save Clip
          </button>
          
          {saveSuccess && (
            <span className="text-green-600 dark:text-green-400 animate-pulse">
              Clip saved successfully!
            </span>
          )}
        </div>
      </div>

      <SavedClipsList onSelectClip={handleSelectClip} refreshTrigger={refreshClipsList} />
      
      <KeyboardShortcuts />
    </div>
  );
};

export default VideoPlayer; 