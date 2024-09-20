// app/(root)/layout.tsx

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

const RootLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    // Define a no-op function for onOptionSelect
    const handleOptionSelect = () => {
        // No action needed for the desktop sidebar
    };

    return (
        <div className="h-full">
            <Navbar />
            <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0">
                {/* Pass the no-op function as onOptionSelect */}
                <Sidebar onOptionSelect={handleOptionSelect} />
            </div>
            <main className="md:pl-20 pt-16 h-full">
                {children}
            </main>
        </div>
    );
};

export default RootLayout;
