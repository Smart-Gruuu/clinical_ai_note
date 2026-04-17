'use client';

import type { Insight, Suggestion } from '@/lib/mockClinical';
import Badge from '../ui/Badge';

interface InsightsPanelProps {
  insights: Insight[];
  suggestions: Suggestion[];
}

export default function InsightsPanel({ insights, suggestions }: InsightsPanelProps) {
  if (insights.length === 0 && suggestions.length === 0) {
    return (
      <p className="empty-state">
        Nothing specific to flag for this visit. Looking good!
      </p>
    );
  }

  return (
    <div className="insights-panel">
      {insights.length > 0 && (
        <div className="insights-block">
          <h3>Things we noticed</h3>
          {insights.map((insight, idx) => (
            <div key={idx} className={`insight-item ${insight.type}`}>
              <Badge variant={insight.priority as 'high' | 'medium' | 'low'}>
                {insight.priority}
              </Badge>
              <strong>{insight.title}</strong>
              <p>{insight.message}</p>
            </div>
          ))}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="suggestions-block">
          <h3>You might want to consider</h3>
          {suggestions.map((suggestion, idx) => (
            <div key={idx} className="suggestion-item">
              {suggestion.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
