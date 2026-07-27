export default function PageSkeleton() {
  return (
    <div className="p-4 animate-pulse space-y-3">
      <div className="h-6 bg-border w-48" />
      <div className="h-4 bg-border w-64" />
      <div className="h-4 bg-border w-32" />
    </div>
  )
}
