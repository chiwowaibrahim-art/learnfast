import React from 'react';
import { BookOpen, HelpCircle, FileText, ChevronRight, GraduationCap, LayoutGrid } from 'lucide-react';

interface LandingPageProps {
  onStartLearning: () => void;
  onGoToAuth: () => void;
}

export default function LandingPage({ onStartLearning, onGoToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="h-5 w-5" id="header-logo-icon" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-indigo-950" id="app-brand-name">LearnFast</span>
          </div>
          <div>
            <button
              onClick={onGoToAuth}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors text-slate-700 hover:text-indigo-900 cursor-pointer"
              id="nav-login-btn"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-indigo-700">
            <span>Malawi National Curriculum Aligned (JCE & MSCE)</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight font-extrabold text-slate-900 leading-tight">
            Curriculum Aligned <span className="text-indigo-600">AI Learning Assistant</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Personalized, interactive education for Form 1 to Form 4 students across Malawi. Boost your understanding of Mathematics, Physical Sciences, Biology, Agriculture, Geography, and History.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-750 transition-all flex items-center justify-center space-x-2 shadow-sm shadow-indigo-100 cursor-pointer hover:translate-y-[-1px]"
              id="hero-start-btn"
            >
              <span>Get Started Now</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onGoToAuth}
              className="w-full sm:w-auto px-8 py-3.5 border border-slate-300 bg-white/80 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              id="hero-signin-btn"
            >
              Access Account
            </button>
          </div>
        </div>

        {/* Feature Grid with Glass Icons and Rounded Borders */}
        <section className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Tutor Agent Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-colors group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/60 shadow-sm">
                <BookOpen className="h-6 w-6" id="glass-tutor-icon" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-950">Curriculum Tutor</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Primary tutor covering MSCE and JCE subjects. Explains physics, chemistry, biology, history, agriculture and math in grade-appropriate, clear language with Malawian context and local practice examples.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-50 mt-4 text-xs font-mono font-bold text-indigo-600">
              JCE & MSCE Syllabus Expert
            </div>
          </div>

          {/* Homework Helper Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-colors group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/60 shadow-sm">
                <HelpCircle className="h-6 w-6" id="glass-homework-icon" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-950">Homework Helper</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Patient guide for solving tough math questions step-by-step. Never shares the raw answer instantly; prompts you SOCRATICALLY with helpful leading questions and step feedback to help you solve it yourself.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-50 mt-4 text-xs font-mono font-bold text-amber-600">
              Socratic Coach (Math & Science)
            </div>
          </div>

          {/* Parent Report Agent Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-colors group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/60 shadow-sm">
                <FileText className="h-6 w-6" id="glass-report-icon" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-950">Parent Report Agent</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Takes student study records to generate clean, encouraging, totally bias-aware progress notes for parents. Highlights strengths, identifies core knowledge gaps, and provides simple offline home support tasks.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-50 mt-4 text-xs font-mono font-bold text-emerald-600">
              Transparent Evaluation
            </div>
          </div>
        </section>

        {/* Localized Malawi Curriculum details */}
        <section className="mt-16 text-center border-t border-slate-200 py-12 w-full max-w-4xl space-y-6">
          <div className="flex items-center justify-center space-x-2 text-slate-500">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">Guaranteed National Syllabus Alignment</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
              <div className="font-mono text-xs font-bold text-slate-400">JCE CERTIFICATION</div>
              <div className="font-bold text-indigo-900 mt-1">Form 1 & 2</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
              <div className="font-mono text-xs font-bold text-slate-400">MSCE DIPLOMA</div>
              <div className="font-bold text-indigo-900 mt-1">Form 3 & 4</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
              <div className="font-mono text-xs font-bold text-slate-400">SUBJECT MATRIX</div>
              <div className="font-bold text-indigo-900 mt-1">Science & Arts</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
              <div className="font-mono text-xs font-bold text-slate-400">LOCAL EXAMPLES</div>
              <div className="font-bold text-indigo-900 mt-1">Mpemba, Shire, MK</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-500 text-sm">
            <span className="font-semibold text-slate-700">LearnFast Malawi</span>
            <span>&bull;</span>
            <span>Supporting secondary academic excellence</span>
          </div>
          <div className="text-xs text-slate-400">
            Powered by Gemini AI / Designed for low bandwidth fast execution
          </div>
        </div>
      </footer>
    </div>
  );
}
