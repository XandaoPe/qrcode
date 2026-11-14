'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importação para voltar
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Link as LinkIcon, CheckCircle2, XCircle, Copy, Check, Smartphone, ArrowLeft, X } from 'lucide-react';

export default function AtivarDisplayPage() {
    const router = useRouter();
    const [serial, setSerial] = useState('');
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [nfcUrl, setNfcUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (serial.trim()) {
            const baseUrl = window.location.origin;
            setNfcUrl(`${baseUrl}/r/${serial.trim()}`);
        } else {
            setNfcUrl('');
        }
    }, [serial]);

    async function handleAtivar(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/ativar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serial, destinationUrl: url }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
        } finally {
            setLoading(false);
        }
    }

    async function copyToClipboard() {
        if (!nfcUrl) return;
        try {
            await navigator.clipboard.writeText(nfcUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar', err);
        }
    }

    // Função para limpar o formulário
    function handleLimpar() {
        setSerial('');
        setUrl('');
        setMessage(null);
    }

    return (
        <div className="flex flex-col h-full">
            {/* HEADER PROFISSIONAL COM BOTÃO VOLTAR */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-4 text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <h1 className="text-xl font-semibold text-slate-800">Ativação de Display</h1>
            </header>

            <div className="flex-1 flex items-center justify-center p-8">
                <Card className="w-full max-w-md shadow-lg border-slate-200">
                    <CardHeader className="space-y-1 text-center relative pb-6">
                        {/* BOTÃO FECHAR/LIMPAR NO CANTO DO CARD */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                            onClick={handleLimpar}
                            title="Limpar formulário"
                        >
                            <X className="w-4 h-4" />
                        </Button>

                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <QrCode className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Ativar Display</CardTitle>
                        <CardDescription className="text-slate-500">
                            Insira o serial do produto e a URL de destino.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleAtivar} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="serial" className="text-slate-700">Serial do Display</Label>
                                <div className="relative">
                                    <QrCode className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="serial"
                                        placeholder="Ex: lote001-0001"
                                        className="pl-9 font-mono"
                                        value={serial}
                                        onChange={(e) => setSerial(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="url" className="text-slate-700">URL de Destino</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="url"
                                        type="url"
                                        placeholder="https://site-do-cliente.com"
                                        className="pl-9"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors" disabled={loading}>
                                {loading ? 'Ativando...' : 'Ativar Display'}
                            </Button>
                        </form>

                        {nfcUrl && (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Smartphone className="w-4 h-4" />
                                    <span>URL para NFC Tools</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input readOnly value={nfcUrl} className="bg-white text-xs font-mono text-slate-600" />
                                    <Button
                                        type="button"
                                        variant={copied ? "default" : "secondary"}
                                        className={`shrink-0 transition-all ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {message && (
                            <Alert className={`flex items-start ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2" /> : <XCircle className="h-4 w-4 mt-0.5 mr-2" />}
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}