// =============================================================================
// MaxiMile Admin Dashboard — App Shell
// =============================================================================
// Root component with branded header, gold-accent navigation, and tab views.
// Design aligned with MaxiMile mobile app (brand gold, glassmorphism, charcoal).
// =============================================================================

import { useState, useCallback } from 'react';
import SubmissionList, { type Submission } from './components/SubmissionList';
import SubmissionDetail from './components/SubmissionDetail';
import DetectionList, { type Detection } from './components/DetectionList';
import DetectionDetail from './components/DetectionDetail';
import PipelineHealth from './components/PipelineHealth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'community' | 'detections' | 'pipeline';
type View = 'list' | 'detail';

const TAB_CONFIG: { key: Tab; label: string; icon: string }[] = [
  { key: 'community', label: 'Community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { key: 'detections', label: 'AI Detections', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'pipeline', label: 'Pipeline Health', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('community');
  const [view, setView] = useState<View>('list');

  // Community submissions state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionListKey, setSubmissionListKey] = useState(0);

  // AI detections state
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [detectionListKey, setDetectionListKey] = useState(0);

  // -------------------------------------------------------------------------
  // Community handlers
  // -------------------------------------------------------------------------
  const handleSelectSubmission = useCallback((submission: Submission) => {
    setSelectedSubmission(submission);
    setView('detail');
  }, []);

  const handleBackToSubmissions = useCallback(() => {
    setView('list');
    setSelectedSubmission(null);
  }, []);

  const handleSubmissionActionComplete = useCallback(() => {
    setSubmissionListKey((k) => k + 1);
    setView('list');
    setSelectedSubmission(null);
  }, []);

  // -------------------------------------------------------------------------
  // Detection handlers
  // -------------------------------------------------------------------------
  const handleSelectDetection = useCallback((detection: Detection) => {
    setSelectedDetection(detection);
    setView('detail');
  }, []);

  const handleBackToDetections = useCallback(() => {
    setView('list');
    setSelectedDetection(null);
  }, []);

  const handleDetectionActionComplete = useCallback(() => {
    setDetectionListKey((k) => k + 1);
    setView('list');
    setSelectedDetection(null);
  }, []);

  // -------------------------------------------------------------------------
  // Tab switch handler — reset to list view
  // -------------------------------------------------------------------------
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setView('list');
    setSelectedSubmission(null);
    setSelectedDetection(null);
  }, []);

  // -------------------------------------------------------------------------
  // Breadcrumb text
  // -------------------------------------------------------------------------
  const breadcrumbDetail =
    activeTab === 'community' && view === 'detail' && selectedSubmission
      ? `Submission #${selectedSubmission.id.slice(0, 8)}`
      : activeTab === 'detections' && view === 'detail' && selectedDetection
        ? `Detection #${selectedDetection.id.slice(0, 8)}`
        : null;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Header */}
      <header className="bg-brand-charcoal px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/Logo.png"
            alt="MaxiMile"
            className="h-8 w-8 rounded-lg"
          />
          <div className="flex items-center gap-2">
            <img
              src="/Name.png"
              alt="MaxiMile"
              className="h-5 brightness-0 invert"
            />
            <span className="text-brand-gold text-sm font-semibold tracking-wide">
              Admin
            </span>
          </div>
          {breadcrumbDetail && (
            <>
              <span className="text-gray-500 text-sm">/</span>
              <span className="text-sm text-gray-400">{breadcrumbDetail}</span>
            </>
          )}
        </div>
      </header>

      {/* Gold gradient line */}
      <div className="h-[2px] gold-gradient-line" />

      {/* Tab Navigation */}
      {view === 'list' && (
        <nav className="glass border-b border-gold-tint px-6">
          <div className="flex gap-0">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'text-brand-charcoal border-brand-gold'
                    : 'text-text-tertiary border-transparent hover:text-text-secondary hover:border-brand-gold/30'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={activeTab === tab.key ? 2.5 : 1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={tab.icon}
                  />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Content */}
      {/* --- Community Submissions --- */}
      {activeTab === 'community' && view === 'list' && (
        <SubmissionList
          key={submissionListKey}
          onSelectSubmission={handleSelectSubmission}
        />
      )}
      {activeTab === 'community' && view === 'detail' && selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onBack={handleBackToSubmissions}
          onActionComplete={handleSubmissionActionComplete}
        />
      )}

      {/* --- AI Detections --- */}
      {activeTab === 'detections' && view === 'list' && (
        <DetectionList
          key={detectionListKey}
          onSelectDetection={handleSelectDetection}
        />
      )}
      {activeTab === 'detections' && view === 'detail' && selectedDetection && (
        <DetectionDetail
          detection={selectedDetection}
          onBack={handleBackToDetections}
          onActionComplete={handleDetectionActionComplete}
        />
      )}

      {/* --- Pipeline Health --- */}
      {activeTab === 'pipeline' && (
        <PipelineHealth />
      )}
    </div>
  );
}
