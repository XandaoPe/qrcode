import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { PackagePlus, Settings, Activity, Layers, ArrowRight, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import clientPromise from '@/lib/mongodb';

// 1. A busca de dados isolada no componente
async function DashboardStats() {
  // Resolve o erro de prerender do Next.js 16, forçando a renderização no momento da requisição
  await connection();

  let stats = { total: 0, ativos: 0, disponiveis: 0 };

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('displays');

    // O <number> resolve o erro do TypeScript no Promise.all
    const [total, ativos, disponiveis] = await Promise.all<number>([
      collection.countDocuments(),
      collection.countDocuments({ status: 'ativo' }),
      collection.countDocuments({ status: 'disponivel' }),
    ]);

    stats = { total, ativos, disponiveis };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Total de Displays</CardTitle>
          <ScanLine className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-slate-800">{stats.total}</div>
          <p className="text-xs text-slate-500 mt-1">Seriais cadastrados no banco</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Ativos</CardTitle>
          <Activity className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">{stats.ativos}</div>
          <p className="text-xs text-slate-500 mt-1">Redirecionando clientes</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Disponíveis</CardTitle>
          <PackagePlus className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600">{stats.disponiveis}</div>
          <p className="text-xs text-slate-500 mt-1">Prontos para venda</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 2. Componente visual de carregamento (Skeleton)
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-slate-200 shadow-sm animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 3. Página principal
export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Fixo */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-slate-800">Visão Geral do Sistema</h1>
      </header>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">

        {/* Envolvemos os dados no Suspense */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}