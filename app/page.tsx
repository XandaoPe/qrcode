import Link from 'next/link';
import {
  QrCode,
  PackagePlus,
  Settings,
  Activity,
  Layers,
  ArrowRight,
  ScanLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR (Menu Lateral) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <QrCode className="w-6 h-6 text-blue-500 mr-3" />
          <span className="text-white font-bold text-lg tracking-wide">QR Manager</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-lg transition-colors">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Visão Geral</span>
          </Link>
          <Link href="/admin/gerar-lote" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Layers className="w-5 h-5" />
            <span className="font-medium">Gerar Lotes</span>
          </Link>
          <Link href="/admin/ativar" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Ativar Display</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm text-white font-medium">Admin</p>
              <p className="text-xs text-slate-400">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        {/* Header Mobile e Título */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Visão Geral do Sistema</h1>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">

          {/* Cartões de Estatísticas (Mockup visual) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total de Displays</CardTitle>
                <ScanLine className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">---</div>
                <p className="text-xs text-slate-500 mt-1">Seriais cadastrados no banco</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Ativos</CardTitle>
                <Activity className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">---</div>
                <p className="text-xs text-slate-500 mt-1">Redirecionando clientes</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Disponíveis</CardTitle>
                <PackagePlus className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">---</div>
                <p className="text-xs text-slate-500 mt-1">Prontos para venda</p>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card: Gerar Lote */}
              <Card className="group hover:border-blue-300 hover:shadow-md transition-all duration-200 border-slate-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-slate-800">Gerar Lote de QR Codes</CardTitle>
                  <CardDescription className="text-slate-500 text-base">
                    Crie dezenas de códigos sequenciais de uma vez. Salve no banco e baixe a folha de impressão para a gráfica.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/gerar-lote">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                      Acessar Gerador <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Card: Ativar Display */}
              <Card className="group hover:border-emerald-300 hover:shadow-md transition-all duration-200 border-slate-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl text-slate-800">Ativar Display</CardTitle>
                  <CardDescription className="text-slate-500 text-base">
                    Vendeu um display? Insira o serial, defina a URL de destino do cliente e copie o link para gravar no NFC.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/ativar">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Ir para Ativação <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}