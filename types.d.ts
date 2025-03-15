// This file contains custom type declarations to fix TypeScript errors

// Fix for JSX elements
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Fix for NodeJS namespace
declare namespace NodeJS {
  interface Timeout {}
}

// Fix for missing module declarations
declare module 'react-youtube' {
  import { Component } from 'react';
  
  export interface YouTubeProps {
    videoId: string;
    id?: string;
    className?: string;
    containerClassName?: string;
    opts?: {
      height?: string | number;
      width?: string | number;
      playerVars?: {
        autoplay?: 0 | 1;
        cc_load_policy?: 1;
        color?: 'red' | 'white';
        controls?: 0 | 1 | 2;
        disablekb?: 0 | 1;
        enablejsapi?: 0 | 1;
        end?: number;
        fs?: 0 | 1;
        hl?: string;
        iv_load_policy?: 1 | 3;
        list?: string;
        listType?: 'playlist' | 'search' | 'user_uploads';
        loop?: 0 | 1;
        modestbranding?: 1;
        origin?: string;
        playlist?: string;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
        showinfo?: 0 | 1;
        start?: number;
        mute?: 0 | 1;
      };
    };
    onReady?: (event: YouTubeEvent) => void;
    onPlay?: (event: YouTubeEvent) => void;
    onPause?: (event: YouTubeEvent) => void;
    onEnd?: (event: YouTubeEvent) => void;
    onError?: (event: YouTubeEvent) => void;
    onStateChange?: (event: YouTubeEvent) => void;
    onPlaybackRateChange?: (event: YouTubeEvent) => void;
    onPlaybackQualityChange?: (event: YouTubeEvent) => void;
  }

  export interface YouTubeEvent {
    target: YouTubePlayer;
    data: number;
  }

  export interface YouTubePlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    stopVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    getVideoLoadedFraction: () => number;
    cueVideoById: (videoId: string, startSeconds?: number, suggestedQuality?: string) => void;
    loadVideoById: (videoId: string, startSeconds?: number, suggestedQuality?: string) => void;
    cueVideoByUrl: (mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string) => void;
    loadVideoByUrl: (mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string) => void;
    getVideoUrl: () => string;
    getVideoEmbedCode: () => string;
    getOptions: (module: string) => string[];
    getOption: (module: string, option: string) => any;
    setOption: (module: string, option: string, value: any) => void;
    mute: () => void;
    unMute: () => void;
    isMuted: () => boolean;
    setVolume: (volume: number) => void;
    getVolume: () => number;
    setSize: (width: number, height: number) => void;
    getPlaybackRate: () => number;
    setPlaybackRate: (suggestedRate: number) => void;
    getAvailablePlaybackRates: () => number[];
    setLoop: (loopPlaylists: boolean) => void;
    setShuffle: (shufflePlaylist: boolean) => void;
    getVideoData: () => any;
    getPlaylist: () => string[];
    getPlaylistIndex: () => number;
    getPlayerState: () => number;
    getCurrentTime: () => number;
    getDuration: () => number;
    getVideoStartBytes: () => number;
    getVideoBytesLoaded: () => number;
    getVideoBytesTotal: () => number;
    getVideoQuality: () => string;
    getAvailableQualityLevels: () => string[];
    setVideoQuality: (suggestedQuality: string) => void;
    getPlaybackQuality: () => string;
    setPlaybackQuality: (suggestedQuality: string) => void;
    destroy: () => void;
  }

  export default class YouTube extends Component<YouTubeProps> {}
}

// Type declarations for react-icons
declare module 'react-icons/fa' {
  import { ComponentType, SVGAttributes } from 'react';
  
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = ComponentType<IconBaseProps>;
  
  export const FaPlay: IconType;
  export const FaPause: IconType;
  export const FaRedo: IconType;
  export const FaTrash: IconType;
  export const FaSave: IconType;
  export const FaBookmark: IconType;
} 