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
  onVideoChange: (videoId: string) => void;
  onClipSaved?: () => void; // Optional callback when a clip is saved
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onVideoChange, onClipSaved }) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 0, end: 0 });
  const [startTimeInput, setStartTimeInput] = useState<string>("00:00");
  const [endTimeInput, setEndTimeInput] = useState<string>("00:00");
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [refreshClipsList, setRefreshClipsList] = useState<number>(Date.now());
  const [overwriteMode, setOverwriteMode] = useState<boolean>(false);
  const [currentClipId, setCurrentClipId] = useState<string | null>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const saveMessageTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update input fields when timeRange changes
  useEffect(() => {
    setStartTimeInput(formatTime(timeRange.start));
    setEndTimeInput(formatTime(timeRange.end));
  }, [timeRange.start, timeRange.end]);

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

  // Parse time string to seconds
  const parseTimeString = (timeString: string): number | null => {
    try {
      // Handle MM:SS format (e.g., "04:34")
      if (/^\d{1,2}:\d{2}$/.test(timeString)) {
        const [minutes, seconds] = timeString.split(':').map(part => parseInt(part, 10));
        return minutes * 60 + seconds;
      }
      // Handle HH:MM:SS format (e.g., "01:04:34")
      else if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes, seconds] = timeString.split(':').map(part => parseInt(part, 10));
        return hours * 3600 + minutes * 60 + seconds;
      }
      return null;
    } catch (error) {
      console.error('Error parsing time:', error);
      return null;
    }
  };

  // Handle start time input change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setStartTimeInput(newValue);
    
    // Only update the actual time range if the input is a valid time format
    const seconds = parseTimeString(newValue);
    if (seconds !== null && seconds >= 0 && seconds < timeRange.end) {
      setTimeRange(prev => ({
        ...prev,
        start: seconds
      }));
    }
  };

  // Handle end time input change
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEndTimeInput(newValue);
    
    // Only update the actual time range if the input is a valid time format
    const seconds = parseTimeString(newValue);
    if (seconds !== null && seconds > timeRange.start && seconds <= duration) {
      setTimeRange(prev => ({
        ...prev,
        end: seconds
      }));
    }
  };

  // Handle input blur to format time correctly
  const handleTimeInputBlur = (inputType: 'start' | 'end') => {
    if (inputType === 'start') {
      setStartTimeInput(formatTime(timeRange.start));
    } else {
      setEndTimeInput(formatTime(timeRange.end));
    }
  };

  // Handle arrow key presses in time inputs
  const handleTimeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, inputType: 'start' | 'end') => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      const increment = e.key === 'ArrowUp' ? 1 : -1;
      
      if (inputType === 'start') {
        const newTime = Math.max(0, Math.min(timeRange.start + increment, timeRange.end - 1));
        setTimeRange(prev => ({
          ...prev,
          start: newTime
        }));
      } else {
        const newTime = Math.max(timeRange.start + 1, Math.min(timeRange.end + increment, duration));
        setTimeRange(prev => ({
          ...prev,
          end: newTime
        }));
      }
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
  const handleSaveClip = async () => {
    // Generate a clip ID or use the current one if in overwrite mode
    const clipId = overwriteMode && currentClipId 
      ? currentClipId 
      : generateClipId(videoId, timeRange.start, timeRange.end);
    
    // Get the actual video title
    const title = await getVideoTitle(videoId);
    
    const clip: SavedClip = {
      id: clipId,
      videoId,
      title,
      startTime: timeRange.start,
      endTime: timeRange.end,
      thumbnailUrl: getThumbnailUrl(videoId),
      createdAt: Date.now()
    };
    
    saveClip(clip);
    
    // If we're saving a new clip, set it as the current clip
    if (!overwriteMode || !currentClipId) {
      setCurrentClipId(clipId);
    }
    
    // Trigger refresh of the clips list
    setRefreshClipsList(Date.now());
    
    // Call the onClipSaved callback if provided
    if (onClipSaved) {
      onClipSaved();
    }
    
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
    // Store the clip ID for potential overwriting
    setCurrentClipId(clip.id);
    
    if (clip.videoId === videoId) {
      // Same video, just update time range
      setTimeRange({
        start: clip.startTime,
        end: clip.endTime
      });
      
      // Explicitly update the input fields
      setStartTimeInput(formatTime(clip.startTime));
      setEndTimeInput(formatTime(clip.endTime));
      
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
          id: clip.id,
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
        case 'ArrowLeft': // Ctrl + Left arrow
          if (e.ctrlKey) {
            e.preventDefault();
            player.seekTo(Math.max(0, player.getCurrentTime() - 5));
          }
          break;
        case 'ArrowRight': // Ctrl + Right arrow
          if (e.ctrlKey) {
            e.preventDefault();
            player.seekTo(Math.min(duration, player.getCurrentTime() + 5));
          }
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
        
        // Explicitly update the input fields
        setStartTimeInput(formatTime(pendingClip.startTime));
        setEndTimeInput(formatTime(pendingClip.endTime));
        
        // Store the clip ID if available
        if (pendingClip.id) {
          setCurrentClipId(pendingClip.id);
        }
        
        player.seekTo(pendingClip.startTime);
        // Clear the pending clip
        sessionStorage.removeItem('pendingClip');
      } catch (error) {
        console.error('Error applying pending clip:', error);
      }
    }
  }, [player]);

  // Reset current clip ID when video changes
  useEffect(() => {
    // Only reset if we're not loading a pending clip
    if (!sessionStorage.getItem('pendingClip')) {
      setCurrentClipId(null);
    }
  }, [videoId]);

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
                    // Keep updating currentTime for display purposes
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
              value={startTimeInput}
              onChange={handleStartTimeChange}
              onBlur={() => handleTimeInputBlur('start')}
              onKeyDown={(e) => handleTimeInputKeyDown(e, 'start')}
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
                    // Keep updating currentTime for display purposes
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
              value={endTimeInput}
              onChange={handleEndTimeChange}
              onBlur={() => handleTimeInputBlur('end')}
              onKeyDown={(e) => handleTimeInputKeyDown(e, 'end')}
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
            }}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider-thumb dark:bg-gray-700"
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveClip}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              disabled={!currentClipId && overwriteMode}
            >
              <FaBookmark /> Save Clip
            </button>
            
            <div className="flex items-center gap-1">
              <input
                type="checkbox"
                id="overwrite-toggle"
                checked={overwriteMode}
                onChange={() => setOverwriteMode(!overwriteMode)}
                className="w-4 h-4"
                disabled={!currentClipId}
              />
              <label 
                htmlFor="overwrite-toggle" 
                className={`text-sm ${!currentClipId ? 'text-gray-400' : ''}`}
                title={!currentClipId ? 'Load a saved clip first to enable overwrite mode' : 'Overwrite the currently loaded clip'}
              >
                Overwrite
              </label>
            </div>
          </div>
          
          {saveSuccess && (
            <span className="text-green-600 dark:text-green-400 animate-pulse">
              Clip {overwriteMode ? 'updated' : 'saved'} successfully!
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