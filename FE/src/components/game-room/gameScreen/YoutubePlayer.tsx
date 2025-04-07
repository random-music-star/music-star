import { useEffect, useRef, useState } from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

// YouTube Player States for better type safety and readability
enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

// Type definitions for YouTube Player API
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  cueVideoById: (options: { videoId: string; startSeconds: number }) => void;
  loadVideoById: (options: { videoId: string; startSeconds: number }) => void;
  destroy: () => void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
}

interface YouTubeStateChangeEvent extends YouTubePlayerEvent {
  data: number;
}

// Add YouTube API to window object type
declare global {
  interface Window {
    YT: {
      Player: new (
        element: string | HTMLElement,
        options: {
          videoId: string;
          playerVars: Record<string, string | number>;
          events: {
            onReady?: (event: YouTubePlayerEvent) => void;
            onStateChange?: (event: YouTubeStateChangeEvent) => void;
            onError?: (event: YouTubePlayerEvent) => void;
          };
        },
      ) => YouTubePlayer;
      PlayerState: typeof YouTubePlayerState;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

const YoutubePlayer = () => {
  const url = useGameRoundInfoStore(state => state.roundInfo.songUrl);
  const url2 = useGameRoundInfoStore(state => state.roundInfo.songUrl2);
  const roundState = useGameStateStore(state => state.gameState);

  // Refs for player containers
  const player1ContainerRef = useRef<HTMLDivElement>(null);
  const player2ContainerRef = useRef<HTMLDivElement>(null);

  // Refs for player instances
  const player1Ref = useRef<YouTubePlayer | null>(null);
  const player2Ref = useRef<YouTubePlayer | null>(null);

  // State for tracking video IDs and player status
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [currentVideoId2, setCurrentVideoId2] = useState<string>('');
  const [isYTApiReady, setIsYTApiReady] = useState<boolean>(false);
  const [player1Buffered, setPlayer1Buffered] = useState<boolean>(false);
  const [player2Buffered, setPlayer2Buffered] = useState<boolean>(false);
  const [player1Playing, setPlayer1Playing] = useState<boolean>(false);
  const [player2Playing, setPlayer2Playing] = useState<boolean>(false);
  const apiInitializedRef = useRef<boolean>(false);

  // Extract YouTube video ID from URL
  const getYoutubeId = (youtubeUrl: string): string => {
    if (!youtubeUrl) return '';

    const regex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = youtubeUrl.match(regex);
    return match ? match[1] : '';
  };

  // Initialize YouTube API
  useEffect(() => {
    if (typeof window === 'undefined' || apiInitializedRef.current) return;

    apiInitializedRef.current = true;

    // Setup silent audio to keep audio context active
    const setupSilentAudio = () => {
      if (navigator?.mediaSession) {
        navigator.mediaSession.metadata = new MediaMetadata({});
      }

      const blindSound = '/audio/noneSound.wav';
      const aud = new Audio(blindSound);
      aud.volume = 0;
      aud.loop = true;
      aud.play().catch(error => {
        console.log('Silent audio play failed:', error);
      });

      return aud;
    };

    const aud = setupSilentAudio();

    // Load YouTube API
    const loadYouTubeApi = () => {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Set callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        setIsYTApiReady(true);
      };
    };

    loadYouTubeApi();

    return () => {
      // Cleanup
      aud.pause();
      aud.src = '';
    };
  }, []);

  // Create/update player 1 when video ID changes or API becomes ready
  useEffect(() => {
    if (!isYTApiReady || !player1ContainerRef.current || !currentVideoId)
      return;

    console.log('Initializing player 1 with video ID:', currentVideoId);

    // Clean up existing player if any
    if (player1Ref.current) {
      player1Ref.current.destroy();
      player1Ref.current = null;
    }

    // Determine start time based on whether we have a second video
    const startTime = currentVideoId2 ? 30 : 0;

    // Initialize new player
    try {
      player1Ref.current = new window.YT.Player(player1ContainerRef.current, {
        videoId: currentVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
          start: startTime,
        } as Record<string, string | number>,
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            event.target.cueVideoById({
              videoId: currentVideoId,
              startSeconds: startTime,
            });

            // Initially mute to prevent any sound leakage during preloading
            event.target.mute();
          },
          onStateChange: (event: YouTubeStateChangeEvent) => {
            handlePlayer1StateChange(event);
          },
          onError: (event: YouTubePlayerEvent) => {
            console.error('Player 1 error:', event);
          },
        },
      });

      setPlayer1Buffered(false);
      setPlayer1Playing(false);
    } catch (error) {
      console.error('Error initializing player 1:', error);
    }
  }, [currentVideoId, currentVideoId2, isYTApiReady]);

  // Create/update player 2 when video ID changes or API becomes ready
  useEffect(() => {
    if (!isYTApiReady || !player2ContainerRef.current || !currentVideoId2)
      return;

    console.log('Initializing player 2 with video ID:', currentVideoId2);

    // Clean up existing player if any
    if (player2Ref.current) {
      player2Ref.current.destroy();
      player2Ref.current = null;
    }

    // Initialize new player - second video always starts at 30s
    try {
      player2Ref.current = new window.YT.Player(player2ContainerRef.current, {
        videoId: currentVideoId2,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
          start: 30,
        } as Record<string, string | number>,
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            console.log('Player 2 ready');
            // Start preloading the video without playing
            event.target.cueVideoById({
              videoId: currentVideoId2,
              startSeconds: 30,
            });

            // Initially mute to prevent any sound leakage during preloading
            event.target.mute();
          },
          onStateChange: (event: YouTubeStateChangeEvent) => {
            handlePlayer2StateChange(event);
          },
          onError: (event: YouTubePlayerEvent) => {
            console.error('Player 2 error:', event);
          },
        },
      });

      setPlayer2Buffered(false);
      setPlayer2Playing(false);
    } catch (error) {
      console.error('Error initializing player 2:', error);
    }
  }, [currentVideoId2, isYTApiReady]);

  // Monitor first URL for changes
  useEffect(() => {
    if (!url) return;

    const videoId = getYoutubeId(url);
    if (videoId && videoId !== currentVideoId) {
      console.log('Video URL changed, updating to ID:', videoId);
      setCurrentVideoId(videoId);
    }
  }, [url]);

  // Monitor second URL for changes
  useEffect(() => {
    if (!url2) {
      if (currentVideoId2) {
        console.log('Video URL 2 removed');
        setCurrentVideoId2('');
      }
      return;
    }

    const videoId2 = getYoutubeId(url2);
    if (videoId2 && videoId2 !== currentVideoId2) {
      console.log('Video URL 2 changed, updating to ID:', videoId2);
      setCurrentVideoId2(videoId2);
    }
  }, [url2, currentVideoId2]);

  // Handle player 1 state changes to track buffering and playback
  const handlePlayer1StateChange = (event: YouTubeStateChangeEvent) => {
    const state = event.data;
    console.log('Player 1 state changed:', getPlayerStateText(state));

    switch (state) {
      case YouTubePlayerState.CUED:
        // Video is loaded and ready to play
        console.log('Player 1 video is preloaded and ready');
        setPlayer1Buffered(true);

        // Auto-play if we're in a playing state
        if (roundState !== 'ROUND_INFO' && roundState !== 'ROUND_OPEN') {
          startPlayer1Playback();
        }
        break;

      case YouTubePlayerState.PLAYING:
        console.log('Player 1 is now playing');
        setPlayer1Playing(true);
        break;

      case YouTubePlayerState.PAUSED:
        console.log('Player 1 is now paused');
        setPlayer1Playing(false);
        break;

      case YouTubePlayerState.BUFFERING:
        // Reset buffered state during rebuffering
        console.log('Player 1 is buffering');
        setPlayer1Buffered(false);
        break;

      case YouTubePlayerState.ENDED:
        console.log('Player 1 playback ended');
        setPlayer1Playing(false);
        break;
    }
  };

  // Handle player 2 state changes to track buffering and playback
  const handlePlayer2StateChange = (event: YouTubeStateChangeEvent) => {
    const state = event.data;
    console.log('Player 2 state changed:', getPlayerStateText(state));

    switch (state) {
      case YouTubePlayerState.CUED:
        // Video is loaded and ready to play
        console.log('Player 2 video is preloaded and ready');
        setPlayer2Buffered(true);

        // Auto-play if we're in a playing state
        if (roundState !== 'ROUND_INFO' && roundState !== 'ROUND_OPEN') {
          startPlayer2Playback();
        }
        break;

      case YouTubePlayerState.PLAYING:
        console.log('Player 2 is now playing');
        setPlayer2Playing(true);
        break;

      case YouTubePlayerState.PAUSED:
        console.log('Player 2 is now paused');
        setPlayer2Playing(false);
        break;

      case YouTubePlayerState.BUFFERING:
        // Reset buffered state during rebuffering
        console.log('Player 2 is buffering');
        setPlayer2Buffered(false);
        break;

      case YouTubePlayerState.ENDED:
        console.log('Player 2 playback ended');
        setPlayer2Playing(false);
        break;
    }
  };

  // Utility function to convert player state to text
  const getPlayerStateText = (state: number): string => {
    switch (state) {
      case YouTubePlayerState.UNSTARTED:
        return 'UNSTARTED';
      case YouTubePlayerState.ENDED:
        return 'ENDED';
      case YouTubePlayerState.PLAYING:
        return 'PLAYING';
      case YouTubePlayerState.PAUSED:
        return 'PAUSED';
      case YouTubePlayerState.BUFFERING:
        return 'BUFFERING';
      case YouTubePlayerState.CUED:
        return 'CUED';
      default:
        return `UNKNOWN(${state})`;
    }
  };

  // Start player 1 playback with reliability enhancements
  const startPlayer1Playback = () => {
    if (!player1Ref.current) return;

    try {
      console.log('Starting player 1 playback');
      player1Ref.current.unMute();
      player1Ref.current.setVolume(100);
      player1Ref.current.playVideo();

      // Double-check playback after a delay
      setTimeout(() => {
        if (player1Ref.current && !player1Playing) {
          console.log('Retry player 1 playback');
          player1Ref.current.playVideo();
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting player 1:', error);
    }
  };

  // Start player 2 playback with reliability enhancements
  const startPlayer2Playback = () => {
    if (!player2Ref.current) return;

    try {
      console.log('Starting player 2 playback');
      player2Ref.current.unMute();
      player2Ref.current.setVolume(100);
      player2Ref.current.playVideo();

      // Double-check playback after a delay
      setTimeout(() => {
        if (player2Ref.current && !player2Playing) {
          console.log('Retry player 2 playback');
          player2Ref.current.playVideo();
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting player 2:', error);
    }
  };

  // Pause both players
  const pauseBothPlayers = () => {
    try {
      if (player1Ref.current) {
        console.log('Pausing player 1');
        player1Ref.current.pauseVideo();
      }

      if (player2Ref.current) {
        console.log('Pausing player 2');
        player2Ref.current.pauseVideo();
      }
    } catch (error) {
      console.error('Error pausing players:', error);
    }
  };

  // Control playback based on round state
  useEffect(() => {
    console.log('Round state changed:', roundState);

    if (roundState === 'ROUND_INFO' || roundState === 'ROUND_OPEN') {
      // In info or open state, ensure videos are paused but still preloaded
      pauseBothPlayers();
    } else {
      // In other states (e.g., gameplay), start playing if buffered
      if (player1Buffered) {
        startPlayer1Playback();
      }

      if (currentVideoId2 && player2Buffered) {
        startPlayer2Playback();
      }
    }
  }, [roundState, player1Buffered, player2Buffered, currentVideoId2]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (player1Ref.current) {
          player1Ref.current.destroy();
        }

        if (player2Ref.current) {
          player2Ref.current.destroy();
        }
      } catch (error) {
        console.error('Error cleaning up players:', error);
      }
    };
  }, []);

  // Don't render anything if we don't have a video ID
  if (!currentVideoId) {
    return null;
  }

  return (
    <div className='pointer-events-none invisible fixed top-[-9999px] left-[-9999px] h-1 w-1 overflow-hidden opacity-0'>
      {/* Container for player 1 */}
      <div
        id='youtube-player-1'
        ref={player1ContainerRef}
        style={{
          width: '320px', // Increased from 1px for better loading
          height: '240px', // Increased from 1px for better loading
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
          zIndex: -9999,
        }}
      />

      {/* Container for player 2 (if needed) */}
      {currentVideoId2 && (
        <div
          id='youtube-player-2'
          ref={player2ContainerRef}
          style={{
            width: '320px', // Increased from 1px for better loading
            height: '240px', // Increased from 1px for better loading
            position: 'fixed',
            top: '-9999px',
            left: '-9999px',
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
            zIndex: -9999,
          }}
        />
      )}

      {/* Debug overlay (visible only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          <div>Video 1: {currentVideoId}</div>
          <div>Buffered: {player1Buffered ? 'Yes' : 'No'}</div>
          <div>Playing: {player1Playing ? 'Yes' : 'No'}</div>
          {currentVideoId2 && (
            <>
              <div>Video 2: {currentVideoId2}</div>
              <div>Buffered: {player2Buffered ? 'Yes' : 'No'}</div>
              <div>Playing: {player2Playing ? 'Yes' : 'No'}</div>
            </>
          )}
          <div>Round State: {roundState}</div>
        </div>
      )}
    </div>
  );
};

export default YoutubePlayer;
