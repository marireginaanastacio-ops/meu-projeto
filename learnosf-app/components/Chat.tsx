"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_SUGGESTIONS = [
  "Preciso criar uma oficina de 4 horas sobre liderança para gestores de nível médio.",
  "Tenho uma turma de jovens aprendizes desmotivados. Como engajo eles?",
  "Quero adaptar meu treinamento presencial para formato híbrido.",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: Message = { role: "user", content: content.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages([...updatedMessages, assistantMessage]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });

          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
            return newMessages;
          });
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content:
              "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
          };
          return newMessages;
        });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "#FAFAF9" }}>
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-stone-900 leading-tight">LearnOS</h1>
            <p className="text-xs text-stone-500">Método Mari Anastacio</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={sendMessage} />
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))
          )}

          {isStreaming &&
            messages.length > 0 &&
            messages[messages.length - 1].content === "" && (
              <TypingIndicator />
            )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-white border-t border-stone-200 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Descreva seu contexto de aprendizagem..."
                rows={1}
                disabled={isStreaming}
                className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-4 text-stone-800 placeholder-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 text-sm leading-relaxed"
                style={{ minHeight: "48px", maxHeight: "160px" }}
              />
            </div>

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="flex-shrink-0 w-11 h-11 bg-stone-200 hover:bg-stone-300 rounded-xl flex items-center justify-center transition-colors"
                title="Parar geração"
              >
                <svg
                  className="w-4 h-4 text-stone-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex-shrink-0 w-11 h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 rounded-xl flex items-center justify-center transition-colors"
                title="Enviar mensagem"
              >
                <svg
                  className="w-4 h-4 text-white disabled:text-stone-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            )}
          </form>

          <p className="text-xs text-stone-400 mt-2 text-center">
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({
  onSuggestionClick,
}: {
  onSuggestionClick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-stone-900 mb-2">
        Olá! Sou o LearnOS
      </h2>
      <p className="text-stone-500 max-w-md mb-8 leading-relaxed">
        Seu parceiro especializado em design de experiências de aprendizagem,
        baseado no método de <strong>Mari Anastacio</strong>. Vamos co-criar
        juntos?
      </p>

      <div className="w-full max-w-md space-y-2">
        <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">
          Comece com uma dessas situações
        </p>
        {WELCOME_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 text-sm transition-colors leading-snug"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-emerald-100 text-emerald-900 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        {message.content ? (
          <div className="prose-learnosf text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <TypingIndicator inline />
        )}
      </div>
    </div>
  );
}

function TypingIndicator({ inline }: { inline?: boolean }) {
  const dots = (
    <div className="flex items-center gap-1 h-5">
      <span
        className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );

  if (inline) return dots;

  return (
    <div className="flex justify-start">
      <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        {dots}
      </div>
    </div>
  );
}
