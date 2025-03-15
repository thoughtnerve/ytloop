import React, { useState } from 'react';
import { extractVideoId } from '../utils/youtube';

interface VideoUrlFormProps {
  onVideoIdChange: (videoId: string) => void;
}

const VideoUrlForm: React.FC<VideoUrlFormProps> = ({ onVideoIdChange }) => {
  const [inputUrl, setInputUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(inputUrl);
    if (id) {
      onVideoIdChange(id);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          value={inputUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="flex-grow p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          required
        />
        <button
          type="submit"
          className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Load Video
        </button>
      </div>
    </form>
  );
};

export default VideoUrlForm; 