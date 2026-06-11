import React, { useState, useRef, useEffect } from 'react';
import { Agent, ChatMessage, UserProfile, SubjectModule, ActivityLog } from '../types';
import { MALAWI_SUBJECTS } from '../data';
import { ChevronLeft, Send, Sparkles, BookOpen, GraduationCap, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface AgentChatProps {
  agent: Agent;
  userProfile: UserProfile;
  onBack: () => void;
  onNewLog: (log: ActivityLog) => void;
}

export default function AgentChat({ agent, userProfile, onBack, onNewLog }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Track the active selected subject & topic for curriculum logging
  const [selectedSubject, setSelectedSubject] = useState<SubjectModule>(MALAWI_SUBJECTS[0]);
  const [selectedTopic, setSelectedTopic] = useState(MALAWI_SUBJECTS[0].topics[0].title);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chats
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle grade verification (JCE vs MSCE)
  const isMSCE = userProfile.grade === 'Form 3' || userProfile.grade === 'Form 4';
  const gradeLevelToken = isMSCE ? 'MSCE' : 'JCE';

  // Load initial welcome message based on agent
  useEffect(() => {
    const welcomeText = agent.id === 'tutor'
      ? `Hello ${userProfile.name}! I am your LearnFast Curriculum Tutor. I can help explain concepts in Mathematics, Physical Science, Biology, Geography, History, and Agriculture aligned exactly with the Malawi ${gradeLevelToken} syllabus. What topic are we learning today?`
      : `Welcome ${userProfile.name}! I am your Homework Helper Socratic Coach. Share any Math or Science equation or concept problem with me. I will not just give you the answer, but I can help you solve it step-by-step together! What calculation are we working on?`;
    
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [agent, userProfile]);

  // Handle subject change
  const handleSubjectSelect = (subj: SubjectModule) => {
    setSelectedSubject(subj);
    // Auto-select first topic matching student's curriculum level
    const matchingTopics = subj.topics.filter(t => t.gradeLevel === gradeLevelToken);
    if (matchingTopics.length > 0) {
      setSelectedTopic(matchingTopics[0].title);
    } else if (subj.topics.length > 0) {
      setSelectedTopic(subj.topics[0].title);
    }
  };

  // Pre-fill prompt when clicking a syllabus topic
  const handleTopicClick = (topicTitle: string, topicDesc: string) => {
    setSelectedTopic(topicTitle);
    
    let starterPrompt = "";
    if (agent.id === 'tutor') {
      starterPrompt = `Teach me about "${topicTitle}" under the Malawi ${gradeLevelToken} ${selectedSubject.name} syllabus. Please explain the core principles, give localized Malawian examples, and write a practice question.`;
    } else {
      starterPrompt = `I need help working out a problems step-by-step regarding the topic "${topicTitle}" (${topicDesc}). Let's start.`;
    }
    setInputValue(starterPrompt);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue;
    setInputValue('');
    setErrorText('');

    // Append user message
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // API call to Express full-stack proxy route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          message: userMessageText,
          history: updatedMessages.map(msg => ({
            sender: msg.sender,
            text: msg.text
          })),
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error. Please verify your GEMINI_API_KEY environment variable.');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const agentReplyText = data.text || "I was unable to formulate a response at this moment. Please try again.";

      // Append Agent reply
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: agentReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // Create new activity log for study records
      const newLog: ActivityLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        subject: selectedSubject.name,
        topic: selectedTopic,
        agentId: agent.id,
        question: userMessageText,
        responsePreview: agentReplyText.substring(0, 120) + "...",
        status: agent.id === 'homework' ? 'Making Progress' : 'Understood'
      };

      onNewLog(newLog);

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Network connection failed. Let’s try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Accent styling declarations based on tutor vs homework helper
  const isTutor = agent.id === 'tutor';
  const themeColor = isTutor ? 'indigo' : 'amber';
  const chatBubbleBg = isTutor ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100';
  const brandIconUrlBg = isTutor ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar: Subject & Topic Syllabus Navigation */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold cursor-pointer"
            id="chat-back-btn"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Study Dashboard</span>
          </button>

          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Class Room</h2>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-800">{userProfile.name}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">{userProfile.grade}</span>
            </div>
            <div className="text-xs text-slate-500 truncate">{userProfile.school}</div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Malawi Syllabus</h3>
              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold font-mono tracking-wide">{gradeLevelToken} LEVEL</span>
            </div>

            {/* Subject scrolling keys list */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0 scrollbar-none">
              {MALAWI_SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => handleSubjectSelect(subj)}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-xl border text-left shrink-0 md:shrink transition-all cursor-pointer flex items-center justify-between w-full ${
                    selectedSubject.id === subj.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                  }`}
                  id={`subject-tab-${subj.id}`}
                >
                  <span>{subj.name}</span>
                  <span className={`text-[10px] ml-2 ${selectedSubject.id === subj.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    ({subj.topics.filter(t => t.gradeLevel === gradeLevelToken).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Topic Prompt Suggestions */}
        <div className="border-t border-slate-100 pt-4 mt-6">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tap a Topic to Study:</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {selectedSubject.topics
              .filter(t => t.gradeLevel === gradeLevelToken)
              .map((tp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTopicClick(tp.title, tp.description)}
                  className="w-full p-2.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-400 rounded-lg text-left text-xs transition-colors flex flex-col space-y-0.5 cursor-pointer"
                  id={`topic-hint-${idx}`}
                >
                  <span className="font-bold text-slate-900 truncate">{tp.title}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{tp.description}</span>
                </button>
              ))}
            {selectedSubject.topics.filter(t => t.gradeLevel === gradeLevelToken).length === 0 && (
              <div className="text-xs text-slate-400 italic">No direct topics for {gradeLevelToken} in {selectedSubject.name}.</div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Conversation Canvas */}
      <main className="flex-grow flex flex-col justify-between bg-slate-50/50 overflow-hidden h-[calc(100vh-200px)] md:h-screen">
        {/* Chat Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-xl ${brandIconUrlBg}`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-md font-bold tracking-tight text-slate-800" id="chat-agent-name">{agent.name}</h1>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Active</span>
              </div>
              <p className="text-xs text-slate-500 font-bold">{agent.role}</p>
            </div>
          </div>
          <div className="text-xs border border-slate-200 bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-serif font-semibold">
            Active Study: {selectedSubject.name} &bull; {selectedTopic}
          </div>
        </header>

        {/* Message Thread */}
        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' ? (
                /* Sleek Agent Message layout with dedicated visual badge elements */
                <div className="flex gap-4 max-w-[85%] md:max-w-xl">
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${brandIconUrlBg}`}>
                    {isTutor ? <BookOpen className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                  </div>
                  <div className={`${chatBubbleBg} rounded-2xl rounded-tl-none p-4 text-sm text-slate-800 border shadow-xs`}>
                    <div className="text-[9px] font-mono tracking-widest font-bold text-slate-400 mb-1">
                      {isTutor ? 'CURRICULUM TUTOR' : 'SOCRATIC COACH'} &bull; {msg.timestamp}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>
                  </div>
                </div>
              ) : (
                /* Student Message */
                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none p-4 text-sm max-w-[80%] md:max-w-xl shadow-xs">
                  <div className="text-[9px] font-mono tracking-widest font-bold text-indigo-200 mb-1">
                    STUDENT &bull; {msg.timestamp}
                  </div>
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${brandIconUrlBg}`}>
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-xs flex items-center space-x-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono tracking-wide">Solving equation...</span>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-start space-x-2 max-w-lg mx-auto">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Generation Error</p>
                <p>{errorText}</p>
                <p className="text-[10px] font-mono opacity-80">Check API key and secret settings.</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center space-x-3">
            <input
              type="text"
              placeholder={agent.id === 'tutor' ? 'Type in any biology, science, agriculture, or math curriculum question...' : 'Write down your equation prompt (e.g. 3x + 12 = 27)...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              disabled={isLoading}
              id="message-input-field"
            />
            <button
              type="submit"
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                isLoading || !inputValue.trim() 
                  ? 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 border border-indigo-600'
              }`}
              disabled={isLoading || !inputValue.trim()}
              id="message-send-btn"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="max-w-4xl mx-auto mt-2 text-[10px] text-slate-400 font-mono text-center">
            Active Study Subjects will automatically record into your Parent Progress Logs.
          </div>
        </div>
      </main>

    </div>
  );
}
