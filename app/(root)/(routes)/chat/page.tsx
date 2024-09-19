import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChatClient } from "@/components/chat/chat-client";

const ChatPage = async () => {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const coach = await prismadb.coach.findFirst({
        where: {
            userId,
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: 'asc',
                },
                where: {
                    userId,
                },
            },
            _count: {
                select: {
                    messages: true
                }
            }
        }
    });

    if (!coach) {
        return redirect("/settings");
    }

    return ( 
        <ChatClient coach={coach}/>
    );
}

export default ChatPage;
