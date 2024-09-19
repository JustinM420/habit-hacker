'use client';

import { useTheme } from "next-themes";
import { BeatLoader } from "react-spinners";

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export interface ChatMessageProps {
    role: "system" | "user";
    content?: string;
    isLoading?: boolean;
    src?: string;
}

export const ChatMessage = ({
    role,
    content,
    isLoading,
}: ChatMessageProps) => {
    const { toast } = useToast();
    const { theme } = useTheme();

    const onCopy = () => {
        if (!content) {
            return;
        }

        navigator.clipboard.writeText(content);
        toast({
            description: "Message copied to clipboard",
        });
    };

    return (
        <div
            className={cn(
                "group flex items-start py-4 w-full",
                role === "user" ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "px-4 py-2 max-w-sm text-sm",
                    "rounded-[25px]",
                    role === "user"
                        ? "bg-[#4169E1] text-white"
                        : "bg-primary/10"
                )}
            >
                {isLoading ? (
                    <BeatLoader
                        size={5}
                        color={theme === "light" ? "black" : "white"}
                    />
                ) : (
                    content
                )}
            </div>
            {role !== "user" && !isLoading && (
                <Button
                    onClick={onCopy}
                    className="opacity-0 group-hover:opacity-100 transition ml-2"
                    size="icon"
                    variant="ghost"
                >
                    <Copy className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
};
