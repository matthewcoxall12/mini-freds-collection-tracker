"use client";
import { useState } from "react";

export function SearchBar({ placeholder = "Search items...", onSearch }: { placeholder?: string, onSearch?: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form onSubmit={e => { e.preventDefault(); onSearch?.(value.trim()); }} className="w-full">
      <input type="search" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
    </form>
  );
}
