import React from 'react';

const WelcomeMessage: React.FC = () => {
  return (
    <div className="text-center p-8 bg-gray-200 dark:bg-gray-800 rounded-lg">
      <p className="text-lg mb-4">Enter a YouTube URL to get started</p>
      <p className="text-gray-600 dark:text-gray-400">
        Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
      </p>
    </div>
  );
};

export default WelcomeMessage; 