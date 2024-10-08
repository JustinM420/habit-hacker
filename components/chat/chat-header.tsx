"use client";

import axios from "axios";
import { ChevronLeft, Edit, MessagesSquare, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Coach, Message } from "@prisma/client";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { BotAvatar } from "@/components/bot-avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface ChatHeaderProps {
  coach: Coach & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
};

export const ChatHeader = ({
  coach,
}: ChatHeaderProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      await axios.delete(`/api/coach/${coach.id}`); // Update the API route if necessary
      toast({
        description: "Success.",
      });
      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong.",
      });
    }
  };

  return (
    <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
      <div className="flex gap-x-2 items-center">
        <Button onClick={() => router.back()} size="icon" variant="ghost">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <p className="font-bold">{coach.name}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MessagesSquare className="w-3 h-3 mr-1" />
              {coach._count.messages}
            </div>
          </div>
        </div>
      </div>
      {user?.id === coach.userId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/settings`)}> {/* Update route */}
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
