export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-slate-300 border-2 max-w-md">
      {children}
    </div>
  )
} 