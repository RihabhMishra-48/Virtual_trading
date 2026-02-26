import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size={48} className="text-blue-500" />
                <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading Tradexa...</p>
            </div>
        </div>
    )
}
