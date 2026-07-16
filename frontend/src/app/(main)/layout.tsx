import { SearchProvider } from "@/app/context/SearchContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SearchProvider>
            <div style={{ display: "flex", height: "100vh", backgroundColor: "#0B1120" }}>
                <Sidebar />
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
                </div>
            </div>
        </SearchProvider>
    );
}