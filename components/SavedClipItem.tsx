import React from 'react';
import { SavedClip } from '../utils/types';
import { formatTime } from '../utils/youtube';
import { FaTrash } from 'react-icons/fa';

interface SavedClipItemProps {
  clip: SavedClip;
  onSelect: (clip: SavedClip) => void;
  onDelete: (clipId: string) => void;
}

const SavedClipItem: React.FC<SavedClipItemProps> = ({ clip, onSelect, onDelete }) => {
  const handleClick = () => {
    onSelect(clip);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    onDelete(clip.id);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
      title={clip.title}
    >
      <div className="relative">
        <img 
          src={clip.thumbnailUrl} 
          alt={clip.title} 
          className="w-full h-auto object-cover"
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1">
          <div className="flex justify-between items-center">
            <span>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
            <button 
              onClick={handleDelete}
              className="text-red-500 hover:text-red-300 transition-colors ml-2"
              title="Delete clip"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedClipItem; 