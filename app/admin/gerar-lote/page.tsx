'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Package, Download, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface DisplayGerado {
    serial: string;
    url: string;
    qrCodeDataUrl?: string; // A imagem em base64
}

export default function GerarLotePage() {
    const [lote, setLote] = useState('');
    const [quantidade, setQuantidade] = useState('10');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [displaysGerados, setDisplaysGerados] = useState<DisplayGerado[]>([]);

    async function handleGerar(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setDisplaysGerados([]);

        // Pega a URL base atual (ex: https://seusite.vercel.app)
        const baseUrl = window.location.origin;

        try {
            const res = await fetch('/api/gerar-lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lote,
                    quantidade: parseInt(quantidade),
                    baseUrl
                }),
            });
            const data = await res.json();

            if (res.ok || res.status === 207) {
                setMessage({ type: res.status === 207 ? 'error' : 'success', text: data.message });

                // Agora geramos as imagens dos QR Codes no navegador
                const displaysComQrCode = await Promise.all(
                    data.displays.map(async (display: DisplayGerado) => {
                        const qrCodeDataUrl = await QRCode.toDataURL(display.url, {
                            width: 300,
                            margin: 2,
                            color: { dark: '#000000', light: '#ffffff' }
                        });
                        return { ...display, qrCodeDataUrl };
                    })
                );

                setDisplaysGerados(displaysComQrCode);
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
        } finally {
            setLoading(false);
        }
    }

    // Função para baixar um QR Code individual (útil para testes)
    function downloadQRCode(dataUrl: string, serial: string) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `qrcode-${serial}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Formulário de Geração */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Package className="w-6 h-6 text-blue-600" />
                            <CardTitle className="text-2xl">Gerar Lote de QR Codes</CardTitle>
                        </div>
                        <CardDescription>
                            Crie os seriais sequenciais. Eles serão salvos no banco como "disponíveis" e não poderão ser repetidos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGerar} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="space-y-2 flex-1 w-full">
                                <Label htmlFor="lote">Nome do Lote</Label>
                                <Input
                                    id="lote"
                                    placeholder="Ex: lote001"
                                    value={lote}
                                    onChange={(e) => setLote(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 w-full md:w-32">
                                <Label htmlFor="quantidade">Quantidade</Label>
                                <Input
                                    id="quantidade"
                                    type="number"
                                    min="1"
                                    max="500" // Limite para não travar o navegador
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

                {/* Grid de QR Codes Gerados */}
                {displaysGerados.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                QR Codes Gerados ({displaysGerados.length})
                            </h2>
                            <Button variant="outline" onClick={() => window.print()}>
                                Imprimir Página
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {displaysGerados.map((display) => (
                                <Card key={display.serial} className="overflow-hidden text-center hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 flex flex-col items-center">
                                        {display.qrCodeDataUrl && (
                                            <img
                                                src={display.qrCodeDataUrl}
                                                alt={`QR Code ${display.serial}`}
                                                className="w-40 h-40 mb-2"
                                            />
                                        )}
                                        <p className="font-mono font-bold text-sm text-slate-800">{display.serial}</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 text-slate-500"
                                            onClick={() => downloadQRCode(display.qrCodeDataUrl!, display.serial)}
                                        >
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