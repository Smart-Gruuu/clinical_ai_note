/**
 * Frontend-only mock clinical processing (SOAP, insights, suggestions, summary).
 * Mirrors backend logic so MVP works without a server.
 */

import type { VisitRecord } from './mockData';

export type SOAPNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type Insight = {
  type: string;
  title: string;
  message: string;
  priority: string;
};

export type Suggestion = {
  text: string;
  category: string;
};

export type PatientSummary = {
  title: string;
  intro: string;
  bullets: string[];
};

export function generateSOAPFromTranscript(transcript: string): SOAPNote {
  const raw = transcript || '';
  const text = raw.toLowerCase();
  const lines = raw.split(/\n/).filter(Boolean);

  const subjective = extractSubjective(text, lines);
  const objective = extractObjective(text, lines);
  const assessment = extractAssessment(text, lines);
  const plan = extractPlan(text, lines);

  return {
    subjective: subjective || 'Patient narrative to be documented.',
    objective: objective || 'Clinical findings from conversation.',
    assessment: assessment || 'Assessment to be completed.',
    plan: plan || 'Plan and follow-up to be documented.',
  };
}

function extractSubjective(text: string, _lines: string[]): string {
  const symptoms: string[] = [];
  const painWords = ['pain', 'hurt', 'ache', 'sore', 'discomfort', 'headache', 'knee', 'back'];
  painWords.forEach((w) => {
    if (text.includes(w)) symptoms.push(w);
  });
  const meds = text.match(/(?:taking|on|uses?|prescribed)\s+([a-z0-9\s,]+?)(?:\.|,|$)/gi);
  const duration = text.match(/(?:for|since)\s+(\d+\s*(?:days?|weeks?|months?|years?))/gi);
  let out = '';
  if (symptoms.length) out += `Chief complaint / symptoms: ${[...new Set(symptoms)].join(', ')}. `;
  if (duration?.length) out += `Duration: ${duration[0]}. `;
  if (meds?.length) out += `Current medications mentioned: ${meds[0]}. `;
  return out.trim() || '';
}

function extractObjective(text: string, _lines: string[]): string {
  const vitals: string[] = [];
  const bp = text.match(/(?:bp|blood pressure)\s*[:\s]*(\d+\s*\/\s*\d+)/i);
  if (bp) vitals.push(`BP ${bp[1]}`);
  const hr = text.match(/(?:heart rate|pulse|hr)\s*[:\s]*(\d+)/i);
  if (hr) vitals.push(`HR ${hr[1]}`);
  const weight = text.match(/(?:weight)\s*[:\s]*([\d.]+)\s*(?:lb|kg)/i);
  if (weight) vitals.push(`Weight ${weight[1]} lb`);
  if (vitals.length) return `Vitals: ${vitals.join(', ')}.`;
  return '';
}

function extractAssessment(text: string, _lines: string[]): string {
  const dx: string[] = [];
  if (text.includes('hypertension') || text.includes('blood pressure')) dx.push('Hypertension');
  if (text.includes('diabetes') || text.includes('blood sugar')) dx.push('Diabetes');
  if (text.includes('migraine') || text.includes('headache')) dx.push('Headache/Migraine');
  if (text.includes('knee') && text.includes('pain')) dx.push('Knee pain / osteoarthritis');
  if (text.includes('osteoarthritis')) dx.push('Osteoarthritis');
  if (text.includes('anxiety') || text.includes('stress')) dx.push('Anxiety/Stress');
  if (text.includes('smoking') || text.includes('quit')) dx.push('Smoking cessation');
  if (dx.length) return dx.join('; ');
  return '';
}

function extractPlan(text: string, lines: string[]): string {
  // Explicit "Plan:" line (common in sample transcript)
  const planLine = lines.find((l) => /^plan\s*:/i.test(l.trim()));
  if (planLine) {
    const afterPlan = planLine.replace(/^plan\s*:\s*/i, '').trim();
    if (afterPlan) return afterPlan;
  }
  const plans: string[] = [];
  const rx = text.match(/(?:prescrib|start|give|ibuprofen|medication)\s+([a-z]+(?:\s+[a-z]+)?)/gi);
  if (rx?.length) plans.push(`Medication: ${rx[0]}`);
  const labs = text.match(/(?:lab|labs|blood test|draw)\s+([^.]*)/gi);
  if (labs?.length) plans.push(`Labs: ${labs[0].trim()}`);
  const fu = text.match(/(?:follow[- ]?up|return|recheck)\s+([^.]*)/gi);
  if (fu?.length) plans.push(`Follow-up: ${fu[0].trim()}`);
  return plans.length ? plans.join(' ') : '';
}

export function getInsights(soapNote: SOAPNote, patientHistory: VisitRecord[] = []): Insight[] {
  const insights: Insight[] = [];
  const text = [
    soapNote?.subjective,
    soapNote?.objective,
    soapNote?.assessment,
    soapNote?.plan,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (text.includes('quit') || text.includes('quitting')) {
    const lastSmoking = patientHistory.find((v) =>
      (v.subjective + v.plan).toLowerCase().includes('smok')
    );
    if (lastSmoking?.subjective?.toLowerCase().includes('cutting down')) {
      insights.push({
        type: 'inconsistency',
        title: 'Smoking status change',
        message:
          "Patient reports quitting smoking today, but last visit noted 'cutting down'—consider clarifying.",
        priority: 'medium',
      });
    }
  }

  const bpInNote = text.match(/(?:bp|blood pressure)\s*[:\s]*(\d+)/i);
  if (bpInNote) {
    const currentBP = parseInt(bpInNote[1], 10);
    const pastBPs = patientHistory
      .map((v) => (v.objective || '').match(/(?:bp|blood pressure)\s*[:\s]*(\d+)/i)?.[1])
      .filter(Boolean) as string[];
    const pastBPNums = pastBPs.map(Number);
    if (pastBPNums.length >= 2 && currentBP > Math.max(...pastBPNums)) {
      insights.push({
        type: 'trend',
        title: 'Blood pressure trending up',
        message: `Blood pressure trending upward over last ${pastBPNums.length + 1} visits. Consider recheck and lifestyle/medication review.`,
        priority: 'high',
      });
    }
  }

  if (text.includes('medication') || text.includes('prescribed') || text.includes('ibuprofen')) {
    insights.push({
      type: 'reminder',
      title: 'Medication adherence',
      message:
        'Consider asking if patient has been able to fill and take prescribed medications.',
      priority: 'low',
    });
  }

  return insights;
}

export function getSuggestions(
  soapNote: SOAPNote,
  patientContext: { age?: number } = {}
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const text = [soapNote?.subjective, soapNote?.assessment, soapNote?.plan]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const age = patientContext.age ?? 50;

  if ((text.includes('headache') || text.includes('migraine')) && !text.includes('diary')) {
    suggestions.push({
      text: 'Based on recurrent headaches and family history, consider migraine diary if not already.',
      category: 'follow_up',
    });
  }

  if ((text.includes('fatigue') || text.includes('tired')) && age >= 50) {
    suggestions.push({
      text: `Patient is ${age} with new fatigue—ANA test last done 4 years ago. Consider repeat if clinically indicated.`,
      category: 'lab',
    });
  }

  if (text.includes('knee') && text.includes('pain')) {
    suggestions.push({
      text: 'Consider X-ray if not done in last 12 months for persistent knee pain.',
      category: 'imaging',
    });
  }

  if (text.includes('diabetes') || text.includes('blood sugar')) {
    suggestions.push({
      text: 'If A1c not checked in 3 months, consider ordering.',
      category: 'lab',
    });
  }

  if (text.includes('blood pressure') || text.includes('hypertension')) {
    suggestions.push({
      text: 'Consider home BP log if not already recommended.',
      category: 'follow_up',
    });
  }

  return suggestions.slice(0, 5);
}

function shorten(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen).trim() + '…';
}

export function getPatientSummary(
  soapNote: SOAPNote,
  doctorName: string = 'Dr. Smith'
): PatientSummary {
  const bullets: string[] = [];

  if (soapNote?.subjective) {
    bullets.push(`What you reported: ${shorten(soapNote.subjective, 120)}`);
  }
  if (soapNote?.assessment) {
    bullets.push(`Discussion: ${shorten(soapNote.assessment, 100)}`);
  }
  if (soapNote?.plan) {
    const planParts = soapNote.plan.split(/[.;]/).filter(Boolean).slice(0, 4);
    planParts.forEach((p) => {
      const t = p.trim();
      if (t) bullets.push(t);
    });
  }

  return {
    title: `Visit summary with ${doctorName}`,
    intro: `You and ${doctorName} discussed:`,
    bullets:
      bullets.length > 0 ? bullets : ['Summary will appear after your visit is documented.'],
  };
}
