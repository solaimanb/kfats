"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SearchAPI, SearchResult } from "@/lib/api/search"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchResultsFallback />}>
      <SearchResultsContent />
    </Suspense>
  )
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    SearchAPI.globalSearch(query)
      .then(setResults)
      .catch((e) => setError(e.message || "Search failed"))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Search Results for <span className="font-black underline"> {query} </span></h1>
      <Card>
        <CardContent className="p-0">
          {loading && (
            <div className="p-4 flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          )}
          {!loading && error && (
            <div className="p-4 text-destructive text-sm">{error}</div>
          )}
          {!loading && !error && results.length === 0 && query.trim().length >= 2 && (
            <div className="p-4 text-muted-foreground text-sm">No results found.</div>
          )}
          {!loading && !error && results.length > 0 && (
            <ul className="divide-y">
              {results.map((item) => (
                <li key={`${item.type}-${item.id}`} className="hover:bg-accent/40 transition-colors">
                  <a
                    href={getResultUrl(item)}
                    className="block px-4 py-3"
                  >
                    <div className="font-medium flex items-center gap-2">
                      <span className="capitalize text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {item.type}
                      </span>
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.snippet}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SearchResultsFallback() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Loading search results...</h1>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getResultUrl(item: SearchResult): string {
  switch (item.type) {
    case "article":
      return `/articles/${item.id}`
    case "course":
      return `/courses/${item.id}`
    case "product":
      return `/products/${item.id}`
    default:
      return "/"
  }
}
