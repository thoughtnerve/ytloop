import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">YTLoop</h1>
      <p className="text-center text-gray-600 dark:text-gray-300">
        Loop YouTube videos with precise start and end points
      </p>
    </header>
  );
};

export default Header; 