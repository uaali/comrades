import React, { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiRotateCcw,
} from "react-icons/fi";
import { User } from "firebase/auth";
import toast from "react-hot-toast";
import MarkdownRenderer from "../ui/MarkdownRenderer";
import { encodingForModel } from "js-tiktoken";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
}

interface QuestionDetails {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  reason: string;
}

interface IDontAgreeProps {
  question: QuestionDetails;
  onClose: () => void;
  user: User;
  ai_tokens: number;
  setBuyTokensModalOpen: (open: boolean) => void;
}

const IDontAgree = ({
  question,
  onClose,
  user,
  ai_tokens,
  setBuyTokensModalOpen,
}: IDontAgreeProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      content: `Hi! Let's discuss why you think '${question.question}' isn't '${question.correctAnswer}' or what you'd like to understand. I'm here to help!`,
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [isQuestionDetailsVisible, setIsQuestionDetailsVisible] =
    useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string, upToMessageId?: string) => {
    if (!content.trim()) return;

    const messageId = crypto.randomUUID();
    const userMessage: Message = {
      id: messageId,
      content,
      role: "user",
      timestamp: new Date(),
    };

    let messagesToSend = messages;
    if (upToMessageId) {
      const messageIndex = messages.findIndex((m) => m.id === upToMessageId);
      messagesToSend = messages.slice(0, messageIndex + 1);
    }

    //check tokens

    // Load the encoder for the model
    const encoder = encodingForModel("gpt-4o-mini");

    // Count tokens in all messages
    const tokenCounts = [...messagesToSend, userMessage].map(
      (msg) => encoder.encode(msg.content).length
    );
    const inputTokens = tokenCounts.reduce((sum, count) => sum + count, 0);
    if (inputTokens > 110000) {
      toast.error("Conversation too long, close and start again");
      return;
    }

    const estimateTokens = inputTokens + 740;
    if (ai_tokens < estimateTokens) {
      toast.error(`You need atleast ${estimateTokens} tokens`);
      toast.error("Please buy more tokens");
      return;
    }

    setMessages((prev) => [
      ...(upToMessageId ? messagesToSend : prev),
      userMessage,
      {
        id: crypto.randomUUID(),
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    setIsSending(true);
    setNewMessage("");
    setIsEditing(null);

    try {
      const firebaseToken = await user.getIdToken();
      const response = await fetch("/api/quizes/discuss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          messages: [...messagesToSend, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("Internal Server Error");
      }

      const data = await response.json();
      setMessages((prev) => {
        const newMessages = upToMessageId
          ? [...messagesToSend, userMessage]
          : prev.slice(0, -1); // Remove loading message

        return [
          ...newMessages,
          {
            id: crypto.randomUUID(),
            content: data.message,
            role: "assistant",
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -1)); // Remove loading message
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setNewMessage(message.content);
      setIsEditing(messageId);
    }
  };

  const handleRetry = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      sendMessage(message.content, messageId);
    }
  };

  const MessageActions = ({ message }: { message: Message }) => {
    if (message.role !== "user") return null;

    return (
      <div className="flex justify-end gap-2 mt-1 pr-2">
        <button
          onClick={() => handleEdit(message.id)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-accent-200 transition-colors"
        >
          <FiEdit2 size={12} />
          Edit
        </button>
        <button
          onClick={() => handleRetry(message.id)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-accent-200 transition-colors"
        >
          <FiRotateCcw size={12} />
          Retry
        </button>
      </div>
    );
  };

  const LoadingMessage = () => (
    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
      <div className="flex gap-1">
        <div
          className="w-2 h-2 bg-accent-200 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="w-2 h-2 bg-accent-200 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="w-2 h-2 bg-accent-200 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      <span className="text-sm text-gray-600">Thinking...</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white h-full w-full md:w-1/2 flex flex-col transform transition-transform duration-300 ease-in-out"
        style={{ boxShadow: "-4px 0 15px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="bg-accent-200 text-white p-4 flex justify-between items-center shrink-0">
          <h3 className="font-bold">Discussion</h3>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">{ai_tokens} tokens</p>
            <button
              onClick={() => setBuyTokensModalOpen(true)}
              className="text-sm underline underline-offset-1 text-white"
            >
              Buy More
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent-300 rounded-full transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="bg-gray-50 border-b shrink-0">
          <button
            onClick={() =>
              setIsQuestionDetailsVisible(!isQuestionDetailsVisible)
            }
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Question Details</span>
            {isQuestionDetailsVisible ? (
              <FiChevronUp className="text-gray-600" />
            ) : (
              <FiChevronDown className="text-gray-600" />
            )}
          </button>

          {isQuestionDetailsVisible && (
            <div className="p-4 pt-0">
              <p className="text-gray-700 mb-2">{question.question}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-red-600">Your Answer:</p>
                  <p>{question.userAnswer}</p>
                </div>
                <div>
                  <p className="font-medium text-green-600">Correct Answer:</p>
                  <p>{question.correctAnswer}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-medium">Explanation:</p>
                <p className="text-gray-600 text-sm">{question.reason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ height: "0px" }}>
          <div className="flex flex-col">
            {messages.map((message) => (
              <div className="my-2" key={message.id}>
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-accent-200 text-white"
                        : "bg-gray-100 text-gray-800"
                    } rounded-lg`}
                  >
                    {message.isLoading ? (
                      <LoadingMessage />
                    ) : (
                      <div className="p-2">
                        <MarkdownRenderer content={message.content} />
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <MessageActions message={message} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t p-4 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isSending && sendMessage(newMessage)
              }
              placeholder={
                isEditing ? "Edit your message..." : "Type your message..."
              }
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-accent-200"
            />
            <button
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || isSending}
              className="bg-accent-200 text-white p-2 rounded-lg hover:bg-accent-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <IoMdSend size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDontAgree;
