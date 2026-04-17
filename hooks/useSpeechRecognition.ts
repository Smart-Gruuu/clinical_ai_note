'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type SpeechRecognitionStatus = 'idle' | 'listening' | 'paused' | 'error';

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  status: SpeechRecognitionStatus;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  pauseListening: () => void;
  resumeListening: () => void;
  resetTranscript: () => void;
  elapsedTime: number;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldRestartRef = useRef(false);
  const isPausedRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  // Timer for elapsed time
  useEffect(() => {
    if (status === 'listening') {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  const initRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          const separator = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
          return prev + separator + finalTranscript;
        });
      }
      
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        // This is normal, just restart if we should be listening
        return;
      }
      
      if (event.error === 'aborted') {
        // User intentionally stopped
        return;
      }

      setError(`Error: ${event.error}`);
      setStatus('error');
    };

    recognition.onend = () => {
      setInterimTranscript('');
      
      // Auto-restart if we should still be listening (not paused or stopped)
      if (shouldRestartRef.current && !isPausedRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Already started or other error
          console.log('Could not restart recognition:', e);
        }
      } else if (!isPausedRef.current) {
        setStatus('idle');
      }
    };

    return recognition;
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError(null);
    shouldRestartRef.current = true;
    isPausedRef.current = false;
    setElapsedTime(0);

    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Might already be started
      console.log('Start error:', e);
    }
  }, [isSupported, initRecognition]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    isPausedRef.current = false;
    recognitionRef.current?.stop();
    setStatus('idle');
    setInterimTranscript('');
  }, []);

  const pauseListening = useCallback(() => {
    isPausedRef.current = true;
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    setStatus('paused');
    setInterimTranscript('');
  }, []);

  const resumeListening = useCallback(() => {
    isPausedRef.current = false;
    shouldRestartRef.current = true;
    
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log('Resume error:', e);
    }
  }, [initRecognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setElapsedTime(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    status,
    isSupported,
    error,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    resetTranscript,
    elapsedTime,
  };
}
