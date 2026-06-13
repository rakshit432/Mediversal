import React, { useState, useRef, useEffect, useContext } from "react";
import "tailwind-scrollbar-hide";
import chatbot from "../assets/bot.svg";
import { AppContext } from "../context/AppContext";

const TriageBot = () => {
  const { backendUrl, token } = useContext(AppContext);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! Please describe the symptoms you are experiencing.",
    },
  ]);

  const [userInput, setUserInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  /* ================= SEND MESSAGE ================= */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput;
    setUserInput("");

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "🔑 Please log in to your patient account to analyze symptoms with the Mediversal AI Triage Assistant.",
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${backendUrl}/api/triage/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify({ symptoms: userMessage }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
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
              disclaimer: data.disclaimer
            }
          },
        ]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn’t analyze your symptoms right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-85 bg-white border border-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
          {/* HEADER */}
          <div className="bg-teal-700 text-white px-4 py-4 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-sm tracking-wide">AI Triage Assistant</h3>
              <p className="text-[10px] text-teal-100">
                Describe symptoms for instant guidance
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-teal-200 hover:text-white transition duration-150 cursor-pointer text-xs font-bold w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
          </div>

          {/* CHAT BODY */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 h-96 overflow-y-auto scrollbar-hide text-xs bg-slate-50 space-y-3"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.triageDetails ? (
                  <div className="flex flex-col bg-white border border-slate-150 rounded-2xl p-4 shadow-sm max-w-[95%] text-slate-800 space-y-3">
                    {/* Severity Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        msg.triageDetails.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                        msg.triageDetails.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {msg.triageDetails.severity} Severity
                      </span>
                      <span className="text-[9px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full truncate">
                        {msg.triageDetails.recommendation}
                      </span>
                    </div>
                    
                    <p className="text-xs font-bold text-slate-800">
                      🩺 Recommend: <span className="text-teal-700 font-extrabold">{msg.triageDetails.recommendation}</span>
                    </p>
                    
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                      "{msg.triageDetails.reason}"
                    </p>

                    {msg.triageDetails.possibleConditions && msg.triageDetails.possibleConditions.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-700 block mb-1">Possible areas:</span>
                        <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                          {msg.triageDetails.possibleConditions.map((cond, idx) => (
                            <li key={idx} className="font-semibold">{cond}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.triageDetails.suggestedAction && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-slate-700 block mb-0.5">Suggested Action:</span>
                        <span className="text-[10px] text-slate-600 font-semibold leading-normal">{msg.triageDetails.suggestedAction}</span>
                      </div>
                    )}

                    {msg.triageDetails.emergencyWarning && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-rose-800 animate-pulse">
                        <span className="text-[10px] font-bold block text-rose-700 mb-0.5">⚠️ Emergency Warning:</span>
                        <span className="text-[10px] font-semibold">{msg.triageDetails.emergencyWarning}</span>
                      </div>
                    )}

                    <p className="text-[9px] text-slate-400 border-t border-slate-100 pt-2 leading-normal italic">
                      ℹ️ {msg.triageDetails.disclaimer}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] whitespace-pre-line text-xs leading-normal shadow-sm ${
                      msg.sender === "user"
                        ? "bg-teal-600 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2 text-xs shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-100 flex gap-2 bg-white"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Describe symptoms..."
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-xs font-semibold text-slate-700 transition duration-150"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-md shadow-teal-600/10 hover:shadow-teal-600/20"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* FLOATING BOT BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition duration-300 active:scale-95 hover:scale-105 cursor-pointer relative group"
        aria-label="Toggle symptom checker"
      >
        <img src={chatbot} alt="chatbot" className="w-9 h-9 group-hover:rotate-12 transition duration-300" />
      </button>
    </div>
  );
};

export default TriageBot;
