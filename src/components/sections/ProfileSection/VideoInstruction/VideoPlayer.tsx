"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./VideoPlayer.module.css";
import { CloseButtonIcon } from "@/components/Icons/Icons";

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  overlayPlayButton?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  onlyPlayPause?: boolean; // custom minimal control: only play/pause button overlay
  noBlur?: boolean; // Remove backdrop-filter blur from play button (for Hero)
}

export default function VideoPlayer({
  videoUrl,
  className = "",
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  poster,
  overlayPlayButton = true,
  showCloseButton = false,
  onClose,
  onlyPlayPause = false,
  noBlur = false,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(!!autoPlay);
  const [showPreview, setShowPreview] = useState<boolean>(
    overlayPlayButton && !autoPlay
  );
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.log("[VideoPlayer] No video element yet, waiting...", {
        hasUrl: !!videoUrl,
        videoUrl: videoUrl?.substring(0, 100),
      });
      return;
    }

    if (!videoUrl || videoUrl.trim() === "") {
      console.log("[VideoPlayer] No video URL provided:", {
        videoUrl,
        hasVideo: !!video,
      });
      return;
    }

    console.log("[VideoPlayer] Loading video:", {
      url: videoUrl.substring(0, 150),
      autoPlay,
      controls,
      poster,
      videoElementReady: !!video,
    });

    setIsLoading(true);
    setError(null);
    
    // Встановлюємо src перед load()
    video.src = videoUrl;
    video.load();

    const handleLoadStart = () => {
      console.log("[VideoPlayer] Load started:", videoUrl);
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedData = () => {
      console.log("[VideoPlayer] Video loaded successfully:", {
        url: videoUrl,
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      const errorMsg = video.error?.message || "Не вдалося завантажити відео";
      setError(errorMsg);

      console.error("[VideoPlayer] Error loading video:", {
        url: videoUrl,
        error: video.error,
        code: video.error?.code,
        message: video.error?.message,
        MEDIA_ERR_ABORTED: video.error?.code === 1,
        MEDIA_ERR_NETWORK: video.error?.code === 2,
        MEDIA_ERR_DECODE: video.error?.code === 3,
        MEDIA_ERR_SRC_NOT_SUPPORTED: video.error?.code === 4,
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoUrl]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setShowOverlay(true);
    } else {
      video.play();
      setShowOverlay(false);
    }
  };

  const handleStartFromPreview = () => {
    setShowPreview(false);
    setShowOverlay(false);
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  };

  if (error) {
    return (
      <div className={className}>
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">URL: {videoUrl}</p>
        </div>
      </div>
    );
  }

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !showOverlay) {
      video.pause();
      setShowOverlay(true);
    }
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      onClick={handleVideoClick}
    >
      {showCloseButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className={styles.closeButton}
        >
          <CloseButtonIcon className={styles.closeIcon} />
          <span className={styles.closeButtonText}>Приховати</span>
        </button>
      )}

      {showPreview && (
        <button
          type="button"
          onClick={handleStartFromPreview}
          className={styles.previewButton}
          aria-label="Play preview"
        >
          {poster ? (
            <Image
              src={poster}
              alt="Video preview"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.previewImage}
            />
          ) : null}
          <span className={styles.playButton}>
            <Image
              src="/images/Vector5.svg"
              width={36}
              height={40}
              alt="Play"
              className={styles.playIcon}
            />
          </span>
        </button>
      )}
      {isLoading && !showPreview && (
        <div className={styles.videoLoader}>
          <div className={styles.spinner}></div>
        </div>
      )}

      <video
        ref={videoRef}
        className={styles.video}
        controls={showPreview ? false : onlyPlayPause ? false : controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        poster={poster}
        preload="none"
        src={videoUrl}
        style={{
          opacity: isLoading && !showPreview ? 0 : 1,
        }}
      >
        Ваш браузер не підтримує відео тег.
      </video>

      {(!controls || onlyPlayPause) && !showPreview && showOverlay && (
        <div
          className={`${styles.overlay} ${noBlur ? styles.overlayNoBlur : ""}`}
        >
          <button
            type="button"
            className={`${styles.playPauseButton} ${
              noBlur ? styles.noBlur : ""
            }`}
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <span className={styles.pauseIcon} />
            ) : (
              <Image
                src="/images/Vector5.svg"
                width={27}
                height={30}
                alt="Play"
                className={styles.playTriangle}
              />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
