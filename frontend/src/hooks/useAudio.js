// src/hooks/useAudio.js
import { useState, useMemo, useRef, useEffect } from 'react';

/**
 * A hook for playing audio that supports an on-ended callback.
 * @param {string} url - The URL of the audio file.
 * @returns {[boolean, function(function): void]} - A tuple containing the playing state and a play function.
 */
const useAudio = (url) => {
  // useMemo ensures the Audio object is created only once.
  const audio = useMemo(() => new Audio(url), [url]);
  const [playing, setPlaying] = useState(false);
  
  // A ref to hold the on-ended callback function for the current playback instance.
  const onEndedCallback = useRef(null);

  /**
   * Plays the audio.
   * @param {function} [onPlaybackFinished] - An optional callback to run when the audio finishes.
   */
  const play = (onPlaybackFinished) => {
    // Store the callback function that should be run when this specific playback ends.
    onEndedCallback.current = onPlaybackFinished;

    audio.play().catch(error => {
      console.error("Audio play failed:", error);
      setPlaying(false);
    });
    setPlaying(true);
  };

  // This effect sets up a SINGLE, persistent event listener for the 'ended' event.
  useEffect(() => {
    const handleAudioEnd = () => {
      setPlaying(false);
      // When the audio ends, check if a callback was provided for this playback.
      if (onEndedCallback.current && typeof onEndedCallback.current === 'function') {
        // Execute the callback.
        onEndedCallback.current();
        // Clear the ref so it doesn't accidentally run again.
        onEndedCallback.current = null;
      }
    };

    audio.addEventListener('ended', handleAudioEnd);

    // Cleanup function to remove the listener when the component unmounts.
    return () => {
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [audio]); // This effect only runs if the audio object itself changes.

  return [playing, play];
};

export default useAudio;