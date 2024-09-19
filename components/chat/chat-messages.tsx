'use client';

import { Coach } from "@prisma/client"; 
import { ChatMessage, ChatMessageProps } from "@/components/chat/chat-message";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface ChatMessagesProps {
    messages: ChatMessageProps[];
    isLoading: boolean;
    coach: Coach; 
    streamingCompletion?: string;
}

export const ChatMessages = ({
    messages = [],
    isLoading,
    streamingCompletion,
    coach
}: ChatMessagesProps) => {
    const scrollRef = useRef<ElementRef<"div">>(null);
    const { user } = useUser(); 

    const [fakeLoading, setFakeLoading] = useState(messages.length === 0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFakeLoading(false);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    useEffect(() => {
        scrollRef?.current?.scrollIntoView({ behavior: "smooth"});
    }, [messages.length, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto pr-4">
            {/* Initial greeting message */}
            {messages.length === 0 && !fakeLoading && (
                <ChatMessage 
                    role="system"
                    content={`Hi, ${user?.firstName || 'there'}. Ready to set some goals?`}
                />
            )}
            {/* Display messages */}
            {messages.map((message, index) => (
                <ChatMessage 
                    role={message.role}
                    key={index}
                    content={message.content}
                />
            ))}
            {/* Display streaming assistant message */}
            {isLoading && streamingCompletion && (
                <ChatMessage 
                    role="system"
                    content={streamingCompletion}
                />
            )}
            {/* Loading indicator for the initial greeting */}
            {fakeLoading && (
                <ChatMessage 
                    isLoading={true}
                    role="system"
                />
            )}
            <div ref={scrollRef}/>
        </div>
    );
}
