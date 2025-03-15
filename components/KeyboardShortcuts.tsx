import React from 'react';

const KeyboardShortcuts: React.FC = () => {
  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="font-bold mb-2">Keyboard Shortcuts:</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <li>Space: Play/Pause</li>
        <li>R: Restart from start point</li>
        <li>Left Arrow: -5 seconds</li>
        <li>Right Arrow: +5 seconds</li>
      </ul>
    </div>
  );
};

export default KeyboardShortcuts; 