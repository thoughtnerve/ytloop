import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import VideoUrlForm from '../components/VideoUrlForm';
import WelcomeMessage from '../components/WelcomeMessage';
import SavedClipsView from '../components/SavedClipsView';
import Header from '../components/Header';
import { SavedClip } from '../utils/types';
import { getSavedClips, updateLastPlayed } from '../utils/storage';

export default function Home() {
  const [videoId, setVideoId] = useState<string>('');
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(Date.now());

  // Load saved clips on initial render
  useEffect(() => {
    const clips = getSavedClips();
    setSavedClips(clips);
  }, [refreshTrigger]);

  // Handle selecting a clip
  const handleSelectClip = (clip: SavedClip) => {
    setVideoId(clip.videoId);
    updateLastPlayed(clip.videoId);
  };

  // Handle clip save/delete to refresh the view
  const handleClipsChange = () => {
    setRefreshTrigger(Date.now());
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-dark">
      <div className="max-w-4xl mx-auto">
        <Header />
        <VideoUrlForm onVideoIdChange={setVideoId} />
        
        {videoId && (
          <VideoPlayer 
            videoId={videoId} 
            onVideoChange={setVideoId} 
            onClipSaved={handleClipsChange}
          />
        )}
        
        {!videoId && (
          <>
            <WelcomeMessage />
            <SavedClipsView 
              onSelectClip={handleSelectClip} 
              refreshTrigger={refreshTrigger}
            />
          </>
        )}
      </div>
    </main>
  );
} 