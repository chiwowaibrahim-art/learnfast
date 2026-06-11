import React, { useState } from 'react';
import { UserProfile, ActivityLog } from '../types';
import { FileText, Sparkles, Trash2, Calendar, ClipboardCheck, ArrowLeft, RefreshCw, BookMarked, UserCheck } from 'lucide-react';

interface ParentDashboardProps {
  userProfile: UserProfile;
  activityLogs: ActivityLog[];
  onBack: () => void;
  onUpdateLogs: (newLogs: ActivityLog[]) => void;
  onAddManualLog: (log: ActivityLog) => void;
}

export default function ParentDashboard({ userProfile, activityLogs, onBack, onUpdateLogs, onAddManualLog }: ParentDashboardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [parentReport, setParentReport] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [copied, setCopied] = useState(false);

  // Status cycling helper to easily change progress levels
  const cycleStatus = (logId: string) => {
    const updated = activityLogs.map(log => {
      if (log.id === logId) {
        let nextStatus: 'Needs Help' | 'Making Progress' | 'Understood' = 'Understood';
        if (log.status === 'Needs Help') nextStatus = 'Making Progress';
        else if (log.status === 'Making Progress') nextStatus = 'Understood';
        else if (log.status === 'Understood') nextStatus = 'Needs Help';
        return { ...log, status: nextStatus };
      }
      return log;
    });
    onUpdateLogs(updated);
  };

  const deleteLog = (logId: string) => {
    const filtered = activityLogs.filter(log => log.id !== logId);
    onUpdateLogs(filtered);
  };

  const handleAddSampleLog = () => {
    const samples: ActivityLog[] = [
      {
        id: 'sample-1',
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        subject: 'Mathematics',
        topic: 'Quadratic Equations',
        agentId: 'homework',
        question: 'Solve x^2 - 5x + 6 = 0',
        responsePreview: 'We noticed factorization could split -5x into -2x and -3x...',
        status: 'Making Progress'
      },
      {
        id: 'sample-2',
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        subject: 'Physical Science',
        topic: 'Atomic Structure & Periodic Table',
        agentId: 'tutor',
        question: 'What is the atomic number of Chlorine?',
        responsePreview: 'Chlorine is a halogen located in Group 7 with a proton count of 17...',
        status: 'Understood'
      },
      {
        id: 'sample-3',
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        subject: 'Agriculture',
        topic: 'Soil Fertility & Management',
        agentId: 'tutor',
        question: 'Explain crop rotation for maize in Lilongwe',
        responsePreview: 'Crop rotation rotates maize with nitrogen-fixing legumes like groundnuts...',
        status: 'Needs Help'
      }
    ];

    // Pick one at random
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    randomSample.id = 'sample-' + Date.now().toString().substring(8);
    onAddManualLog(randomSample);
  };

  const handleGenerateReport = async () => {
    if (activityLogs.length === 0) {
      setErrorText('Please create study logs first (or tap the button below to add sample logs) before generating a report.');
      return;
    }

    setIsGenerating(true);
    setErrorText('');
    setParentReport(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: 'parent',
          message: 'Generate a progress report based on my current study logs.',
          history: [],
          userProfile,
          activityLogs
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report. Make sure GEMINI_API_KEY environment variable is configured.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setParentReport(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting to Gemini API failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (parentReport) {
      navigator.clipboard.writeText(parentReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold cursor-pointer"
            id="parent-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Study Dashboard</span>
          </button>
          
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Guardian Access Mode</span>
            <div className="font-bold text-slate-800 text-sm">{userProfile.school}</div>
          </div>
        </header>

        {/* Intro Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">Parent Monitoring Center</h1>
              <p className="text-xs text-slate-500">Student Name: {userProfile.name} ({userProfile.grade}) &bull; Malawi Syllabus Tracker</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            As a parent or guardian, you can inspect the topic logging index constructed during class-directed study. When you are ready, call the parent evaluator agent. LearnFast parses active activities to prepare progress reports, flag curriculum gaps, and suggest collaborative academic tasks for the home.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className={`px-5 py-2.5 text-xs font-semibold bg-indigo-600 border border-indigo-605 text-white rounded-xl flex items-center space-x-2 cursor-pointer ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-750 transition-all shadow-sm'
              }`}
              id="generate-report-btn"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing Syllabus Performance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate AI Progress Report</span>
                </>
              )}
            </button>
            <button
              onClick={handleAddSampleLog}
              className="px-4 py-2.5 text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 cursor-pointer"
              id="add-sample-log-btn"
            >
              Add Mock Curriculum Activity Log (+1)
            </button>
          </div>
        </div>

        {/* Report Output Zone */}
        {errorText && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {errorText}
          </div>
        )}

        {parentReport && (
          <div className="bg-white border-2 border-indigo-600 rounded-2xl p-6 md:p-8 space-y-5 animate-in fade-in duration-300 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-indigo-955">
                <FileText className="h-5 w-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Malawi Secondary Progress Statement</h3>
              </div>
              <button
                onClick={handleCopyToClipboard}
                className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-450 bg-slate-50 text-slate-750 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                id="copy-report-btn"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
            </div>
            
            {/* Formatted body */}
            <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans" id="report-text-container">
              {parentReport}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              Report synthesized using unbiased LearnFast assessment logs. Strictly neutral and academic.
            </div>
          </div>
        )}

        {/* Local Logs Index */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookMarked className="h-4.5 w-4.5 text-indigo-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Detailed Student Activity Logs Index</h2>
            </div>
            <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded font-bold">
              {activityLogs.length} LOGS RECORDED
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 italic">
                No learning records found. Ask questions in &quot;Curriculum Tutor&quot; or &quot;Homework Helper&quot; to fill this database log.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/80">
                        {log.subject}
                      </span>
                      <span className="text-xs text-slate-600 font-medium font-mono">
                        {log.topic}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 italic">
                      &quot;{log.question}&quot;
                    </div>
                    <div className="text-xs text-slate-550 font-sans truncate pr-4">
                      {log.responsePreview}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-450 font-mono">
                      <span className="capitalize">Agent: {log.agentId}</span>
                      <span>&bull;</span>
                      <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {log.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-mono text-slate-400 tracking-wider font-semibold">Assessment Level:</div>
                      <button
                        onClick={() => cycleStatus(log.id)}
                        className={`mt-1 px-3 py-1 text-[10px] font-bold rounded-full transition-colors cursor-pointer border ${
                          log.status === 'Understood' 
                            ? 'bg-indigo-650 border-indigo-650 text-white bg-indigo-600 border-indigo-600'
                            : log.status === 'Making Progress'
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-red-50 border-red-250 text-red-700'
                        }`}
                        id={`cycle-status-btn-${log.id}`}
                      >
                        {log.status === 'Understood' ? 'Understood' : log.status === 'Making Progress' ? 'Making Progress' : 'Needs Help'}
                      </button>
                    </div>

                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-2 border border-slate-200 hover:border-red-400 text-slate-400 hover:text-red-650 rounded-lg transition-colors cursor-pointer"
                      title="Delete activity record"
                      id={`delete-log-btn-${log.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
