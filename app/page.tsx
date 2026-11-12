import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Meu Negócio de QR Codes
        </h1>
        <p className="text-lg text-slate-500">
          A base está pronta. O visual está funcionando.
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          Ir para o Painel
        </Button>
      </div>
    </main>
  )
}