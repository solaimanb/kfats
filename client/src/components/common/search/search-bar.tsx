
import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length < 2) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full max-w-md border border-input rounded-full bg-background shadow-sm focus-within:ring-0 focus-within:ring-ring/30 transition-all px-2 py-1 gap-1"
      role="search"
    >
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoComplete="off"
        aria-label="Search"
        className="border-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:outline-none text-base px-2 py-1"
      />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        aria-label="Submit search"
        className="p-2 h-8 w-8 rounded-md text-muted-foreground hover:text-primary"
        disabled={query.trim().length < 2}
      >
        <Search />
      </Button>
    </form>
  )
}
