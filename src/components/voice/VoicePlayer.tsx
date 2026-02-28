import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VoicePlayerProps {
  audioUrl?: string;
  audioBlob?: Blob;
  autoPlay?: boolean;
  onPlayComplete?: () => void;
  className?: string;
}

interface PlaybackState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  isLoading: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  audioBlob,
  autoPlay = false,
  onPlayComplete,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    isLoading: false
  });

  const [effectiveAudioUrl, setEffectiveAudioUrl] = useState<string | null>(null);

  // Create URL from blob if provided
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setEffectiveAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (audioUrl) {
      setEffectiveAudioUrl(audioUrl);
    }
  }, [audioBlob, audioUrl]);

  // Setup audio element
  useEffect(() => {
    if (!effectiveAudioUrl) return;

    const audio = new Audio(effectiveAudioUrl);
    audioRef.current = audio;

    setPlaybackState(prev => ({ ...prev, isLoading: true }));

    const handleLoadedMetadata = () => {
      setPlaybackState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false
      }));
    };

    const handleTimeUpdate = () => {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: audio.currentTime
      }));
    };

    const handleEnded = () => {
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0
      }));
      onPlayComplete?.();
    };

    const handlePlay = () => {
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Auto play if requested
    if (autoPlay) {
      audio.play().catch(console.error);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, [effectiveAudioUrl, autoPlay, onPlayComplete]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (playbackState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }, [playbackState.isPlaying]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = playbackState.duration > 0 
    ? (playbackState.currentTime / playbackState.duration) * 100 
    : 0;

  if (!effectiveAudioUrl) {
    return null;
  }

  return (
    <div className={`voice-player bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayback}
          disabled={playbackState.isLoading}
          className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
        >
          {playbackState.isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : playbackState.isPlaying ? (
            <VolumeX size={16} />
          ) : (
            <Volume2 size={16} />
          )}
        </button>

        {/* Progress and Time */}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>{formatTime(playbackState.currentTime)}</span>
            <span>{formatTime(playbackState.duration)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayer;
