'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Package, Download, Loader2, ArrowLeft, X } from 'lucide-react';

interface DisplayGerado {
    serial: string;
    url: string;
    qrCodeBase64?: string;
}

export default function GerarLotePage() {
    const router = useRouter();
    const [quantidade, setQuantidade] = useState('10');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [displaysGerados, setDisplaysGerados] = useState<DisplayGerado[]>([]);

    // Estado para mostrar a prévia do próximo serial
    const [proximoSerialPreview, setProximoSerialPreview] = useState('Carregando...');
    const [prefixoPreview, setPrefixoPreview] = useState('DISP-XXXX-XXXX');

    useEffect(() => {
        fetch('/api/configuracoes')
            .then(res => res.json())
            .then(data => {
                // Se a config vier corrompida do banco, o front também trata
                const proximoNumero = Number(data.config?.proximoNumero) || 1;
                const padding = Number(data.config?.padding) || 4;

                const numStr = String(proximoNumero).padStart(padding, '0');

                // Monta a prévia com a data e hora atual
                const now = new Date();
                const dateStr = String(now.getDate()).padStart(2, '0') + String(now.getMonth() + 1).padStart(2, '0');
                const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
                const autoPrefix = `DISP-${dateStr}-${timeStr}`;

                setPrefixoPreview(autoPrefix);
                setProximoSerialPreview(`${autoPrefix}-${numStr}`);
            })
            .catch(() => setProximoSerialPreview('Erro ao carregar'));
    }, []);

    async function handleGerar(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setDisplaysGerados([]);

        const baseUrl = window.location.origin;

        try {
            const res = await fetch('/api/gerar-lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantidade: parseInt(quantidade), baseUrl }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                setDisplaysGerados(data.displays);

                // Atualiza a prévia após gerar
                const nextNum = (parseInt(proximoSerialPreview.split('-').pop() || '0') + parseInt(quantidade)).toString().padStart(4, '0');
                setProximoSerialPreview(`${prefixoPreview}-${nextNum}`);
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
        } finally {
            setLoading(false);
        }
    }

    function downloadQRCode(dataUrl: string, serial: string) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `qrcode-${serial}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function handleLimpar() {
        setQuantidade('10');
        setMessage(null);
        setDisplaysGerados([]);
    }

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-4 text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <h1 className="text-xl font-semibold text-slate-800">Gerador de Lotes</h1>
            </header>

            <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
                <Card className="shadow-lg border-slate-200">
                    <CardHeader className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                            onClick={handleLimpar}
                            title="Limpar tudo"
                        >
                            <X className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600" />
                            <CardTitle className="text-2xl">Novo Lote de QR Codes</CardTitle>
                        </div>
                        <CardDescription>
                            O sistema gerará códigos sequenciais e adicionará automaticamente a data e hora para evitar conflitos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGerar} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="space-y-2 flex-1 w-full">
                                <Label>Formato do Próximo Lote</Label>
                                <div className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 font-mono items-center">
                                    {proximoSerialPreview} ...
                                </div>
                            </div>
                            <div className="space-y-2 w-full md:w-32">
                                <Label htmlFor="quantidade">Qtd (Max 500)</Label>
                                <Input
                                    id="quantidade"
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                                {loading ? 'Gerando...' : 'Gerar Lote'}
                            </Button>
                        </form>

                        {message && (
                            <Alert className={`mt-4 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {displaysGerados.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800">
                                QR Codes Gerados ({displaysGerados.length})
                            </h2>
                            <Button variant="outline" className="border-slate-300" onClick={() => window.print()}>
                                Imprimir Página
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {displaysGerados.map((display) => (
                                <Card key={display.serial} className="overflow-hidden text-center hover:shadow-md transition-shadow border-slate-200">
                                    <CardContent className="p-4 flex flex-col items-center">
                                        {display.qrCodeBase64 && (
                                            <img src={display.qrCodeBase64} alt={`QR Code ${display.serial}`} className="w-40 h-40 mb-2" />
                                        )}
                                        <p className="font-mono font-bold text-sm text-slate-800">{display.serial}</p>
                                        <Button variant="ghost" size="sm" className="mt-2 text-slate-500" onClick={() => downloadQRCode(display.qrCodeBase64!, display.serial)}>
                                            <Download className="w-3 h-3 mr-1" /> Baixar PNG
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}