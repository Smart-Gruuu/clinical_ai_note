'use client';

import Button from '../ui/Button';

type RecordingStatus = 'idle' | 'listening' | 'paused' | 'error';

interface RecordingControlsProps {
  status: RecordingStatus;
  elapsedTime: number;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  onTogglePause: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function RecordingControls({
  status,
  elapsedTime,
  isSupported,
  onStart,
  onStop,
  onTogglePause,
}: RecordingControlsProps) {
  return (
    <div className="recording-controls" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
      {status === 'idle' && (
        <button
          className="record-btn idle"
          onClick={onStart}
          disabled={!isSupported}
          title={isSupported ? 'Start recording' : 'Speech recognition not supported'}
        >
          🎙️
        </button>
      )}
      {status === 'listening' && (
        <button
          className="record-btn recording"
          onClick={onStop}
          title="Stop recording"
        >
          ⏹️
        </button>
      )}
      {status === 'paused' && (
        <button
          className="record-btn paused"
          onClick={onTogglePause}
          title="Resume recording"
        >
          ▶️
        </button>
      )}

      <div className="recording-status">
        <div className="recording-label">
          {status === 'idle' && 'Ready to record'}
          {status === 'listening' && 'Listening...'}
          {status === 'paused' && 'Paused'}
          {status === 'error' && 'Error'}
        </div>
        <div className="recording-time">
          {status !== 'idle' && formatTime(elapsedTime)}
          {status === 'idle' && 'Click to start'}
        </div>
      </div>

      {(status === 'listening' || status === 'paused') && (
        <Button variant="secondary" className="pause-btn" onClick={onTogglePause}>
          {status === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
        </Button>
      )}
    </div>
  );
}
