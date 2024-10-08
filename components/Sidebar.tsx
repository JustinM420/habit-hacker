// components/Sidebar.tsx

'use client';

import { cn } from "@/lib/utils";
import { CalendarCheck, Home, MessageCircleMore, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
    onOptionSelect?: () => void; // Make it optional
}

export const Sidebar = ({ onOptionSelect = () => {} }: SidebarProps) => { // Provide default no-op function
    const pathname = usePathname();
    const router = useRouter();

    const routes = [
        {
            icon: Home,
            href: "/",
            label: "Home",
            pro: false,
        },
        {
            icon: MessageCircleMore,
            href: "/chat",
            label: "Chat",
            pro: false,
        },
        {
            icon: CalendarCheck,
            href: "/list",
            label: "TaskList",
            pro: false,
        },
        {
            icon: Settings,
            href: "/settings",
            label: "Settings",
            pro: false,
        }
    ];

    const onNavigate = (url: string, pro: boolean) => {
        // TODO: Check if Pro

        router.push(url);
        onOptionSelect(); // Close the sidebar after navigation
    };

    return (
        <div className="space-y-4 flex flex-col h-full text-primary bg-secondary">
            <div className="p-3 flex flex-1 justify-center">
                <div className="space-y-2">
                    {routes.map((route) => (
                        <div
                            onClick={() => onNavigate(route.href, route.pro)}
                            key={route.href}
                            className={cn(
                                "text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                                pathname === route.href && "text-primary bg-primary/10"
                            )}
                            role="button" // Accessibility enhancement
                            tabIndex={0} // Make it focusable
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onNavigate(route.href, route.pro);
                                }
                            }}
                        >
                            <div className="flex flex-col gap-y-2 items-center flex-1">
                                <route.icon className="h-5 w-5" />
                                {route.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
