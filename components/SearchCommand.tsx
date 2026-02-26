"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Loader2, Search, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchCommandProps {
  renderAs?: 'button' | 'text';
  label?: string;
  initialStocks: StockWithWatchlistStatus[];
}

export default function SearchCommand({ renderAs = 'button', label = 'Add stock', initialStocks }: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true)
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setStocks(initialStocks);
    }
  }

  return (
    <>
      {renderAs === 'text' ? (
        <span onClick={() => setOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="bg-[#2962FF] hover:bg-[#1E4BD1] text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
          <Search className="h-4 w-4" />
          {label}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 border-border bg-background text-foreground overflow-hidden shadow-2xl">
          <DialogTitle className="sr-only">Search Stocks</DialogTitle>

          {/* Header / Input Area */}
          <div className="flex items-center border-b border-border p-4 sticky top-0 bg-background z-10 shrink-0">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/60 text-foreground h-9"
              placeholder="Search for symbols or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 ml-3" />
            ) : searchTerm ? (
              <button onClick={() => setSearchTerm('')} className="ml-3">
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            ) : null}
          </div>

          {/* Results List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
            {isSearchMode && stocks.length === 0 && !loading ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <ul className="space-y-1">
                {!isSearchMode && (
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Popular Stocks
                  </div>
                )}

                {displayStocks?.map((stock) => (
                  <li key={stock.symbol}>
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground truncate">{stock.symbol}</span>
                          <span className="text-xs text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted border border-border">
                            {stock.exchange}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {stock.name}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!isSearchMode && stocks.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Start typing to search...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex justify-end px-4">
            <span>Press <kbd className="font-mono bg-muted px-1 rounded text-muted-foreground">ESC</kbd> to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
