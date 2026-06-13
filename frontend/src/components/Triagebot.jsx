import React, { useState, useRef, useEffect, useContext } from "react";
import chatbot from "../assets/bot.svg";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const QUICK_CHIPS = [
  "Headache & fever",
  "Chest pain",
  "Stomach ache",
  "Skin rash",
  "Back pain",
  "Sore throat",
  "Anxiety & stress",
  "Child fever",
];

const TriageBot = () => {
  const { backendUrl, token, doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm your **AI Triage Assistant**.\n\nDescribe your symptoms and I'll suggest the right specialist. You can also tap a quick chip below!",
    },
  ]);

  const [userInput, setUserInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  /* ================= SEND MESSAGE ================= */
  const handleSend = async (e, overrideText) => {
    if (e) e.preventDefault();
    const text = overrideText || userInput;
    if (!text.trim()) return;

    setUserInput("");
    setIsMinimized(false); // Restore if minimized

    // Append user message
    setMessages(prev => [...prev, { sender: "user", text }]);

    if (!token) {
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "🔑 Please **log in** to your patient account to use the AI Triage Assistant.",
          loginPrompt: true,
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      // Build conversation history for the AI context
      const history = messages
        .filter(msg => !msg.loginPrompt)
        .map(msg => {
          let textVal = msg.text || "";
          if (msg.triageDetails) {
            textVal = `Recommendation: ${msg.triageDetails.recommendation}. Reason: ${msg.triageDetails.reason}. Severity: ${msg.triageDetails.severity}. Suggested Action: ${msg.triageDetails.suggestedAction}.`;
          }
          return {
            role: msg.sender === "user" ? "user" : "model",
            text: textVal,
          };
        });

      const response = await fetch(`${backendUrl}/api/triage/analyze`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          token 
        },
        body: JSON.stringify({ symptoms: text, history }),
      });

      const data = await response.json();

      if (data.success) {
        // Find matching doctors for the recommended speciality
        const matched = doctors?.filter(d =>
          d.speciality?.toLowerCase() === data.recommendation?.toLowerCase() && d.available
        ) || [];

        setMessages(prev => [
          ...prev,
          {
            sender: "bot",
            triageDetails: {
              recommendation: data.recommendation,
              reason: data.reason,
              severity: data.severity,
              possibleConditions: data.possibleConditions,
              suggestedAction: data.suggestedAction,
              emergencyWarning: data.emergencyWarning,
              suggestedFollowups: data.suggestedFollowups || [],
              disclaimer: data.disclaimer,
              matchedDoctors: matched.slice(0, 2),
            },
          },
        ]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Sorry, I couldn't analyze your symptoms right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { sender: "bot", text: "🔄 Chat cleared. How can I help you today? Describe your symptoms!" },
    ]);
    setIsMinimized(false);
  };

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading, isMinimized]);

  /* ================= FOCUS INPUT ON OPEN ================= */
  useEffect(() => {
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, isMinimized]);

  /* ================= SEVERITY COLORS ================= */
  const severityColor = (s) => {
    if (s === 'High') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (s === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  /* ================= SAFE MARKDOWN PARSER ================= */
  const parseBotText = (text) => {
    if (!text) return null;
    
    // Split by newlines to handle paragraphs and list items
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check if line is a bullet point
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const displayLine = isBullet ? line.trim().substring(2) : line;
      
      // Parse **bold** tags
      const parts = displayLine.split(/(\*\*.*?\*\*)/g);
      const content = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-extrabold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      
      if (isBullet) {
        return (
          <ul key={lineIndex} className="list-disc list-inside ml-2 my-0.5 text-xs text-slate-700 font-medium">
            <li>{content}</li>
          </ul>
        );
      }
      
      return (
        <p key={lineIndex} className={lineIndex > 0 ? "mt-1.5" : ""}>
          {content}
        </p>
      );
    });
  };

  return (
    <div className={`fixed z-50 ${isFullscreen && isOpen ? 'inset-0' : 'bottom-6 right-4 sm:right-6'}`}>
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className={`
          bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden
          transition-all duration-300
          ${isFullscreen
            ? 'fixed inset-0 rounded-none'
            : 'absolute bottom-20 right-0 w-[340px] sm:w-[380px] h-[70vh] min-h-[320px] max-h-[540px] md:max-h-[580px] max-h-[calc(100vh-110px)]'
          }
          ${isMinimized && !isFullscreen ? 'h-fit max-h-[52px]' : ''}
        `}>
          {/* HEADER */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <img src={chatbot} alt="bot" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">AI Triage Assistant</h3>
                <p className="text-[10px] text-teal-100">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Clear */}
              <button
                onClick={clearChat}
                title="Clear chat"
                className="text-teal-200 hover:text-white text-xs font-bold w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                🗑
              </button>
              {/* Minimize toggle */}
              <button
                onClick={() => setIsMinimized(m => !m)}
                title={isMinimized ? "Restore" : "Minimize"}
                className="text-teal-200 hover:text-white text-xs font-bold w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                {isMinimized ? '＋' : '－'}
              </button>
              {/* Fullscreen toggle (only if not minimized) */}
              {!isMinimized && (
                <button
                  onClick={() => setIsFullscreen(f => !f)}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  className="text-teal-200 hover:text-white text-xs font-bold w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition cursor-pointer"
                >
                  {isFullscreen ? '⊡' : '⊞'}
                </button>
              )}
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-teal-200 hover:text-white text-xs font-bold w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {!isMinimized && (
            <>
              {/* CHAT BODY */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-3 overflow-y-auto bg-slate-50/70 space-y-3"
              >
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "bot" && !msg.triageDetails && (
                      <div className="flex items-start gap-2 max-w-[88%]">
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <img src={chatbot} alt="bot" className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs leading-relaxed shadow-sm">
                            {parseBotText(msg.text)}
                          </div>
                          {msg.loginPrompt && (
                            <button
                              onClick={() => { navigate('/login'); setIsOpen(false); }}
                              className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-2 rounded-xl hover:bg-teal-600 hover:text-white transition w-fit cursor-pointer"
                            >
                              → Log In
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {msg.sender === "user" && (
                      <div className="bg-teal-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%] text-xs leading-relaxed shadow-sm font-medium">
                        {msg.text}
                      </div>
                    )}

                    {msg.triageDetails && (
                      <div className="flex items-start gap-2 w-full max-w-[95%]">
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <img src={chatbot} alt="bot" className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3.5 shadow-sm space-y-2.5 text-slate-800">

                            {/* Severity + Specialist header */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${severityColor(msg.triageDetails.severity)}`}>
                                {msg.triageDetails.severity} Severity
                              </span>
                              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">
                                🩺 See {msg.triageDetails.recommendation}
                              </span>
                            </div>

                            {/* Emergency Warning */}
                            {msg.triageDetails.emergencyWarning && (
                              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 animate-pulse">
                                <p className="text-[10px] font-bold text-rose-700">⚠️ Emergency Warning</p>
                                <p className="text-[10px] text-rose-700 font-semibold mt-0.5">{msg.triageDetails.emergencyWarning}</p>
                              </div>
                            )}

                            {/* Reason */}
                            <div className="text-[11px] text-slate-600 italic leading-relaxed">
                              {parseBotText(msg.triageDetails.reason)}
                            </div>

                            {/* Possible Conditions */}
                            {msg.triageDetails.possibleConditions?.length > 0 && (
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                <p className="text-[10px] font-bold text-slate-700 mb-1">Possible causes:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {msg.triageDetails.possibleConditions.map((c, i) => (
                                    <li key={i} className="text-[10px] text-slate-600 font-semibold">{c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Suggested Action */}
                            {msg.triageDetails.suggestedAction && (
                              <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5">
                                <p className="text-[10px] font-bold text-blue-700 mb-0.5">💡 Suggested Action</p>
                                <div className="text-[10px] text-blue-700 font-semibold leading-relaxed">
                                  {parseBotText(msg.triageDetails.suggestedAction)}
                                </div>
                              </div>
                            )}

                            {/* Matched Doctors CTA */}
                            {msg.triageDetails.matchedDoctors?.length > 0 && (
                              <div className="border-t border-slate-100 pt-2.5">
                                <p className="text-[10px] font-bold text-slate-700 mb-1.5">Available Specialists:</p>
                                <div className="space-y-1.5">
                                  {msg.triageDetails.matchedDoctors.map((doc) => (
                                    <button
                                      key={doc._id}
                                      onClick={() => { navigate(`/appointment/${doc._id}`); setIsOpen(false); window.scrollTo(0, 0); }}
                                      className="w-full flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl p-2 hover:bg-teal-600 hover:text-white hover:border-teal-500 transition group cursor-pointer"
                                    >
                                      <img src={doc.image} alt={doc.name} className="w-7 h-7 rounded-full object-cover border border-teal-200 group-hover:border-white shrink-0" />
                                      <div className="text-left flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-slate-800 group-hover:text-white truncate">{doc.name}</p>
                                        <p className="text-[9px] text-teal-600 group-hover:text-teal-100 font-semibold">{doc.experience} Yrs • {doc.degree}</p>
                                      </div>
                                      <span className="text-[9px] font-bold text-teal-600 group-hover:text-white shrink-0">Book →</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No doctors found CTA */}
                            {msg.triageDetails.matchedDoctors?.length === 0 && (
                              <button
                                onClick={() => { navigate('/doctors'); setIsOpen(false); window.scrollTo(0, 0); }}
                                className="w-full text-center text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 py-2 rounded-xl hover:bg-teal-600 hover:text-white transition cursor-pointer"
                              >
                                Browse All {msg.triageDetails.recommendation}s →
                              </button>
                            )}

                            {/* Disclaimer */}
                            <p className="text-[9px] text-slate-400 italic border-t border-slate-100 pt-2 leading-relaxed">
                              ℹ️ {msg.triageDetails.disclaimer}
                            </p>
                          </div>

                          {/* Render Clickable Suggested Followup Chips */}
                          {msg.triageDetails.suggestedFollowups?.length > 0 && (
                            <div className="flex flex-col gap-1 mt-1 max-w-[95%]">
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">Suggested Follow-ups:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.triageDetails.suggestedFollowups.map((q, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSend(null, q)}
                                    disabled={loading}
                                    className="text-[10px] text-left font-bold text-teal-700 bg-white border border-teal-100/70 shadow-sm px-2.5 py-1.5 rounded-xl hover:bg-teal-600 hover:text-white hover:border-teal-500 transition cursor-pointer disabled:opacity-50"
                                  >
                                    {q}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                        <img src={chatbot} alt="" className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-slate-400 ml-1">Analyzing symptoms…</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK CHIPS */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0">
                {QUICK_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSend(null, chip)}
                    disabled={loading}
                    className="shrink-0 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full hover:bg-teal-600 hover:text-white transition disabled:opacity-40 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* INPUT */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 bg-white flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="Describe your symptoms..."
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-xs font-semibold text-slate-700 transition placeholder-slate-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !userInput.trim()}
                  className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-teal-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* FLOATING BUTTON (only if chatbot is closed, or minimized but fullscreen is inactive) */}
      {(!isOpen || (isMinimized && !isFullscreen)) && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition duration-300 active:scale-95 hover:scale-105 cursor-pointer relative"
          aria-label="Toggle symptom checker"
        >
          <img src={chatbot} alt="chatbot" className={`w-7 h-7 sm:w-9 sm:h-9 transition duration-300 ${isOpen ? 'rotate-12' : ''}`} />
          {/* Unread dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[8px] text-white font-black">AI</span>
          </span>
        </button>
      )}
    </div>
  );
};

export default TriageBot;
