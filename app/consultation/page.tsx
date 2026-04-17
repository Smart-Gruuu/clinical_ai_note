'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell, PageHeader } from '@/components/layout';
import { Card, Button, FormGroup } from '@/components/ui';
import {
  RecordingControls,
  LiveCaptions,
  SOAPEditor,
  InsightsPanel,
  PatientSummaryPanel,
  type CaptionSegment,
} from '@/components/consultation';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  generateSOAPFromTranscript,
  getInsights,
  getSuggestions,
  getPatientSummary,
  type SOAPNote,
  type Insight,
  type Suggestion,
  type PatientSummary,
} from '@/lib/mockClinical';
import { getPatientById, getVisitHistory, listPatients } from '@/lib/mockData';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function ConsultationContent() {
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get('patient') || 'P001';

  const [patientId, setPatientId] = useState(initialPatientId);
  const [doctorName, setDoctorName] = useState('Dr. Smith');
  const [manualTranscript, setManualTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [soap, setSoap] = useState<SOAPNote | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'note' | 'insights' | 'summary'>('note');
  const [useManualInput, setUseManualInput] = useState(false);

  // Caption segments for conversation view
  const [captionSegments, setCaptionSegments] = useState<CaptionSegment[]>([]);
  const [segmentIdCounter, setSegmentIdCounter] = useState(0);
  const lastTranscriptRef = useRef('');

  const {
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
  } = useSpeechRecognition();

  const patients = listPatients();
  const currentPatient = getPatientById(patientId);

  // Track transcript changes and create caption segments
  useEffect(() => {
    if (transcript !== lastTranscriptRef.current) {
      const newText = transcript.slice(lastTranscriptRef.current.length).trim();

      if (newText) {
        const sentences = newText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [newText];

        sentences.forEach((sentence) => {
          const trimmed = sentence.trim();
          if (trimmed) {
            setCaptionSegments((prev) => [
              ...prev,
              {
                id: segmentIdCounter + prev.length,
                text: trimmed,
                timestamp: formatTime(elapsedTime),
                isFinal: true,
              },
            ]);
          }
        });

        setSegmentIdCounter((prev) => prev + sentences.length);
      }

      lastTranscriptRef.current = transcript;
    }
  }, [transcript, elapsedTime, segmentIdCounter]);

  const fullTranscript = useManualInput ? manualTranscript : transcript;

  async function processTranscript() {
    if (!fullTranscript.trim()) return;

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const patient = getPatientById(patientId);
      const history = getVisitHistory(patientId);

      const generatedSoap = generateSOAPFromTranscript(fullTranscript);
      setSoap(generatedSoap);
      setInsights(getInsights(generatedSoap, history));
      setSuggestions(getSuggestions(generatedSoap, { age: patient?.age }));
      setSummary(getPatientSummary(generatedSoap, doctorName || 'Your doctor'));
      setActiveTab('note');
    } finally {
      setLoading(false);
    }
  }

  function updateSoap(field: keyof SOAPNote, value: string) {
    if (!soap) return;
    setSoap({ ...soap, [field]: value });
  }

  function handleStartRecording() {
    setUseManualInput(false);
    resetTranscript();
    setCaptionSegments([]);
    lastTranscriptRef.current = '';
    setSegmentIdCounter(0);
    startListening();
  }

  function handleStopRecording() {
    stopListening();
  }

  function handleTogglePause() {
    if (status === 'paused') {
      resumeListening();
    } else {
      pauseListening();
    }
  }

  function switchToManualInput() {
    stopListening();
    setManualTranscript(transcript);
    setUseManualInput(true);
  }

  function clearAndReset() {
    stopListening();
    resetTranscript();
    setCaptionSegments([]);
    lastTranscriptRef.current = '';
    setManualTranscript('');
    setSoap(null);
    setInsights([]);
    setSuggestions([]);
    setSummary(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Consultation Room"
        subtitle={
          currentPatient
            ? `Recording session for ${currentPatient.name}`
            : 'Select a patient to begin'
        }
        actions={
          <Button
            variant="secondary"
            onClick={clearAndReset}
            disabled={status === 'listening'}
          >
            Clear & Reset
          </Button>
        }
      />

      <div className="page-body">
        <div className="consultation-layout">
          {/* Left: Results */}
          <div>
            {/* Patient Selection */}
            <Card style={{ marginBottom: '1.5rem' }}>
              <div className="form-row">
                <FormGroup label="Patient" htmlFor="patient-select" style={{ marginBottom: 0 }}>
                  <select
                    id="patient-select"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="form-control"
                    disabled={status === 'listening'}
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                </FormGroup>
                <FormGroup label="Provider Name" htmlFor="doctor-name" style={{ marginBottom: 0 }}>
                  <input
                    id="doctor-name"
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. Smith"
                    className="form-control"
                  />
                </FormGroup>
              </div>
            </Card>

            {/* Results Section */}
            {soap ? (
              <Card>
                <div className="tabs">
                  <button
                    type="button"
                    className={`tab ${activeTab === 'note' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('note')}
                  >
                    Draft Note
                  </button>
                  <button
                    type="button"
                    className={`tab ${activeTab === 'insights' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('insights')}
                  >
                    Insights {insights.length > 0 && `(${insights.length})`}
                  </button>
                  <button
                    type="button"
                    className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                  >
                    Patient Summary
                  </button>
                </div>

                {activeTab === 'note' && (
                  <SOAPEditor soap={soap} onChange={updateSoap} />
                )}

                {activeTab === 'insights' && (
                  <InsightsPanel insights={insights} suggestions={suggestions} />
                )}

                {activeTab === 'summary' && summary && (
                  <PatientSummaryPanel summary={summary} />
                )}
              </Card>
            ) : (
              <Card>
                <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎙️</div>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>
                    Ready to capture
                  </h3>
                  <p>
                    Click the microphone button to start recording your consultation.
                    <br />
                    The AI will generate notes, insights, and a patient summary.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Live Captions Panel */}
          <div className="transcript-card">
            {/* Recording Controls */}
            <Card style={{ marginBottom: '1rem' }}>
              <RecordingControls
                status={status}
                elapsedTime={elapsedTime}
                isSupported={isSupported}
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onTogglePause={handleTogglePause}
              />

              {error && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--danger-soft)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    marginTop: '1rem',
                  }}
                >
                  {error}
                </div>
              )}

              {!isSupported && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--warning-soft)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--warning)',
                    fontSize: '0.85rem',
                    marginTop: '1rem',
                  }}
                >
                  Your browser doesn&apos;t support speech recognition. Please use Chrome, Edge, or
                  Safari, or use manual input below.
                </div>
              )}
            </Card>

            {/* Caption-style Transcript Display */}
            {useManualInput ? (
              <Card>
                <div className="card-header">
                  <h3 className="card-title">Manual Input</h3>
                </div>
                <textarea
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  placeholder="Type or paste your consultation transcript here..."
                  className="form-control"
                  style={{ minHeight: '250px' }}
                />
              </Card>
            ) : (
              <LiveCaptions
                segments={captionSegments}
                interimText={interimTranscript}
                currentTime={formatTime(elapsedTime)}
                status={status}
              />
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                onClick={processTranscript}
                disabled={loading || !fullTranscript.trim()}
                style={{ flex: 1 }}
              >
                {loading ? 'Processing...' : 'Generate Note'}
              </Button>

              {!useManualInput && (
                <Button
                  variant="secondary"
                  onClick={switchToManualInput}
                  disabled={status === 'listening'}
                >
                  ✏️ Edit
                </Button>
              )}

              {useManualInput && (
                <Button variant="secondary" onClick={() => setUseManualInput(false)}>
                  🎙️ Voice
                </Button>
              )}
            </div>

            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              All processing happens locally in your browser
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConsultationContent />
    </Suspense>
  );
}
