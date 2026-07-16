"use client";
import { createContext, useContext, useState } from "react";

const SearchContext = createContext({
    globalSearch: "",
    setGlobalSearch: (val: string) => {}
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const [globalSearch, setGlobalSearch] = useState("");
    return (
        <SearchContext.Provider value={{ globalSearch, setGlobalSearch }}>
            {children}
        </SearchContext.Provider>
    );
}

export const useSearch = () => useContext(SearchContext);