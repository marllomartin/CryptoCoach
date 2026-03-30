// Advanced Video Player Component
// Features: Speed control, Picture-in-Picture, Chapters, Preview mode

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  SkipForward,
  SkipBack,
  Lock,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function AdvancedVideoPlayer({
  src,
  poster,
  title,
  chapters = [],
  trialStatus,
  onUpgradeClick,
  className = ""
}) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [previewLimitReached, setPreviewLimitReached] = useState(false);
  
  const isPreviewMode = trialStatus?.is_preview_only;
  const previewSeconds = trialStatus?.preview_seconds || 30;
  
  // Auto-hide controls
  useEffect(() => {
    let timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);
  
  // Preview limit check
  useEffect(() => {
    if (isPreviewMode && currentTime >= previewSeconds) {
      setPreviewLimitReached(true);
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [currentTime, isPreviewMode, previewSeconds]);
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const togglePlay = () => {
    if (previewLimitReached) return;
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };
  
  const handleSeek = (e) => {
    if (isPreviewMode) return; // Disable seeking in preview mode
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };
  
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };
  
  const togglePiP = async () => {
    if (!videoRef.current) return;
    
    try {
      if (!isPiP) {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      } else {
        await document.exitPictureInPicture();
        setIsPiP(false);
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };
  
  const skipTime = (seconds) => {
    if (isPreviewMode) return;
    
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        Math.max(0, videoRef.current.currentTime + seconds),
        duration
      );
    }
  };
  
  const jumpToChapter = (timestamp) => {
    if (isPreviewMode) return;
    
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setShowChapters(false);
    }
  };
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Preview overlay
  if (previewLimitReached) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8 max-w-md"
          >
            <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t('videoPlayer.previewEnded')}</h3>
            <p className="text-slate-400 mb-6">
              {t('videoPlayer.previewMessage', { seconds: previewSeconds })}
            </p>
            <Button
              size="lg"
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t('videoPlayer.unlockAccess')}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`relative group rounded-xl overflow-hidden bg-black ${className}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Preview mode indicator */}
      {isPreviewMode && !previewLimitReached && (
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-500/90 rounded-full flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Aperçu: {formatTime(previewSeconds - currentTime)} restants
          </span>
        </div>
      )}
      
      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4">
              <h3 className="text-lg font-medium truncate">{title}</h3>
            </div>
            
            {/* Center play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white ml-1" />
                )}
              </motion.button>
            </div>
            
            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress bar */}
              <div 
                className={`h-1.5 bg-white/30 rounded-full overflow-hidden ${isPreviewMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                {/* Preview limit marker */}
                {isPreviewMode && (
                  <div 
                    className="absolute h-1.5 w-0.5 bg-amber-500"
                    style={{ left: `${(previewSeconds / duration) * 100}%` }}
                  />
                )}
              </div>
              
              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button 
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  {/* Skip buttons */}
                  <button 
                    onClick={() => skipTime(-10)}
                    className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${isPreviewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isPreviewMode}
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => skipTime(10)}
                    className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${isPreviewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isPreviewMode}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  
                  {/* Volume */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 accent-primary"
                    />
                  </div>
                  
                  {/* Time display */}
                  <span className="text-sm ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Chapters */}
                  {chapters.length > 0 && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowChapters(!showChapters)}
                        className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${isPreviewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isPreviewMode}
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      
                      {showChapters && !isPreviewMode && (
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 p-2 max-h-48 overflow-y-auto">
                          {chapters.map((chapter, idx) => (
                            <button
                              key={idx}
                              onClick={() => jumpToChapter(chapter.timestamp)}
                              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg text-sm"
                            >
                              <span className="text-primary mr-2">{formatTime(chapter.timestamp)}</span>
                              {chapter.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Speed control */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2 py-1 text-sm hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {playbackSpeed}x
                    </button>
                    
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 p-1">
                        {PLAYBACK_SPEEDS.map(speed => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`block w-full px-4 py-1.5 text-sm hover:bg-white/10 rounded ${playbackSpeed === speed ? 'text-primary' : ''}`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* PiP */}
                  {document.pictureInPictureEnabled && (
                    <button 
                      onClick={togglePiP}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Picture-in-Picture"
                    >
                      <PictureInPicture2 className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* Fullscreen */}
                  <button 
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdvancedVideoPlayer;
