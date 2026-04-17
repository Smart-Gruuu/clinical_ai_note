'use client';

import { useRef, useEffect } from 'react';

export type CaptionSegment = {
  id: number;
  text: string;
  timestamp: string;
  isFinal: boolean;
};

type RecordingStatus = 'idle' | 'listening' | 'paused' | 'error';

interface LiveCaptionsProps {
  segments: CaptionSegment[];
  interimText: string;
  currentTime: string;
  status: RecordingStatus;
}

export default function LiveCaptions({
  segments,
  interimText,
  currentTime,
  status,
}: LiveCaptionsProps) {
  const captionAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (captionAreaRef.current) {
      captionAreaRef.current.scrollTop = captionAreaRef.current.scrollHeight;
    }
  }, [segments, interimText]);

  return (
    <div className="transcript-container">
      {/* Header */}
      <div className="transcript-header">
        <div className="transcript-header-title">
          <span>💬</span>
          Live Captions
        </div>
        {status === 'listening' && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            LIVE
          </div>
        )}
        {status === 'paused' && (
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            PAUSED
          </span>
        )}
      </div>

      {/* Caption Area */}
      <div className="caption-area" ref={captionAreaRef}>
        {segments.length === 0 && !interimText && (
          <div className="caption-empty">
            <div className="caption-empty-icon">🎤</div>
            <div className="caption-empty-text">
              {status === 'idle' && (
                <>
                  Start recording to see live captions
                  <br />
                  <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    Speak naturally - your words will appear here in real-time
                  </span>
                </>
              )}
              {status === 'listening' && 'Listening for speech...'}
              {status === 'paused' && 'Recording paused'}
            </div>
          </div>
        )}

        {/* Rendered caption segments */}
        {segments.map((segment) => (
          <div key={segment.id} className="caption-line">
            <span className="caption-timestamp">{segment.timestamp}</span>
            <div className="caption-content">
              <span className="caption-text">{segment.text}</span>
            </div>
          </div>
        ))}

        {/* Interim (currently being spoken) */}
        {interimText && (
          <div className="caption-line">
            <span className="caption-timestamp">{currentTime}</span>
            <div className="caption-content">
              <span className="caption-text interim">{interimText}</span>
            </div>
          </div>
        )}

        {/* Listening indicator when no captions yet */}
        {status === 'listening' && segments.length === 0 && !interimText && (
          <div className="caption-listening">
            <div className="listening-waves">
              <div className="listening-wave"></div>
              <div className="listening-wave"></div>
              <div className="listening-wave"></div>
              <div className="listening-wave"></div>
              <div className="listening-wave"></div>
            </div>
            <span>Listening...</span>
          </div>
        )}
      </div>
    </div>
  );
}
