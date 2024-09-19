"use client";

import { FormEvent, useState } from "react";
import { Coach, Message } from "@prisma/client";
import { useRouter } from "next/navigation";

import { ChatForm } from "@/components/chat/chat-form";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatMessageProps } from "@/components/chat/chat-message";

interface ChatClientProps {
  coach: Coach & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatClient = ({ coach }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(coach.messages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userInput = input.trim();
    if (!userInput) return;

    const userMessage: ChatMessageProps = {
      role: "user",
      content: userInput,
    };

    setMessages((current) => [...current, userMessage]);
    setInput(""); // Clear the input field immediately
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const assistantMessage: ChatMessageProps = {
        role: "system",
        content: data.response,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("Error fetching assistant response:", error);
      // Optionally handle the error (e.g., show a notification)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader coach={coach} />
      <ChatMessages coach={coach} isLoading={isLoading} messages={messages} />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
