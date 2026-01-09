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
    if (!userInput.trim() || !token) return;

    const userMessage = userInput;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

    setUserInput("");
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
            text: `🩺 Based on your symptoms, you may consider consulting a ${data.recommendation}.\n\nReason: ${data.reason}\n\n⚠️ This is not a medical diagnosis.`,
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
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-xl shadow-2xl border flex flex-col">
          {/* HEADER */}
          <div className="bg-teal-700 text-white px-4 py-3 rounded-t-xl">
            <h3 className="font-semibold text-base">Triage Bot</h3>
            <p className="text-xs text-teal-100">
              AI-based doctor speciality guidance
            </p>
          </div>

          {/* CHAT BODY */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 h-80 overflow-y-auto scrollbar-hide text-sm"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-3 ${
                  msg.sender === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-line ${
                    msg.sender === "bot"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-teal-600 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 rounded-lg px-3 py-2">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t flex gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 rounded-md hover:bg-teal-700 transition text-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* FLOATING BOT BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center shadow-xl hover:bg-teal-700 transition"
        aria-label="Toggle symptom checker"
      >
        <img src={chatbot} alt="chatbot" className="w-9 h-9" />
      </button>
    </div>
  );
};

export default TriageBot;
