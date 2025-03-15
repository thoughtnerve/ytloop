# YTLoop - YouTube Video Looper

YTLoop is a web application that allows you to loop YouTube videos with precise start and end points, similar to [LoopTube.io](https://looptube.io/).

## Features

- Load any YouTube video by URL
- Set custom start and end points for looping
- Keyboard shortcuts for easy control
- Responsive design that works on desktop and mobile
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ytloop.git
cd ytloop
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a YouTube URL in the input field and click "Load Video"
2. Use the sliders to set the start and end points for looping
3. The video will automatically loop between these points
4. Use keyboard shortcuts for quick control:
   - Space: Play/Pause
   - R: Restart from start point
   - Left Arrow: -5 seconds
   - Right Arrow: +5 seconds

## How It Works

YTLoop uses the YouTube IFrame API through the react-youtube package to control video playback. It monitors the current playback time and automatically jumps back to the start point when the end point is reached.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- YouTube IFrame API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [LoopTube.io](https://looptube.io/)
- Built with Next.js and React 