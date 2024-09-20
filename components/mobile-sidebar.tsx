// components/mobile-sidebar.tsx

'use client';

import { Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";

export const MobileSidebar = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden pr-4" onClick={handleOpen}>
                <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-secondary pt-10 w-32">
                <Sidebar onOptionSelect={handleClose} />
            </SheetContent>
        </Sheet>
    );
};
