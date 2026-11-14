'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function ConfiguracoesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [prefixo, setPrefixo] = useState('DISP');
    const [proximoNumero, setProximoNumero] = useState(1);
    const [padding, setPadding] = useState(4);

    useEffect(() => {
        fetch('/api/configuracoes')
            .then(res => res.json())
            .then(data => {
                if (data.config) {
                    setPrefixo(data.config.prefixo);
                    setProximoNumero(data.config.proximoNumero);
                    setPadding(data.config.padding);
                }
            })
            .catch(() => setMessage({ type: 'error', text: 'Erro ao carregar configurações.' }))
            .finally(() => setLoading(false));
    }, []);

    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/configuracoes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prefixo, proximoNumero, padding }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro ao salvar.' });
        } finally {
            setSaving(false);
        }
    }

    // Função para gerar a prévia do serial
    const getPreview = () => {
        const numStr = String(proximoNumero).padStart(padding, '0');
        return `${prefixo || 'PREFIXO'}-${numStr}`;
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-4 text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <h1 className="text-xl font-semibold text-slate-800">Configurações do Sistema</h1>
            </header>

            <div className="p-8 max-w-2xl mx-auto w-full">
                <Card className="shadow-lg border-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="w-6 h-6 text-slate-700" />
                            <CardTitle className="text-2xl">Numeração de Displays</CardTitle>
                        </div>
                        <CardDescription>
                            Defina como os seriais sequenciais serão gerados na criação de novos lotes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSalvar} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="prefixo">Prefixo</Label>
                                    <Input
                                        id="prefixo"
                                        value={prefixo}
                                        onChange={(e) => setPrefixo(e.target.value.toUpperCase())}
                                        placeholder="Ex: DISP"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Texto fixo antes do número.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="padding">Dígitos (Zeros à esquerda)</Label>
                                    <Input
                                        id="padding"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={padding}
                                        onChange={(e) => setPadding(parseInt(e.target.value))}
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Ex: 4 dígitos = 0001.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="proximoNumero">Próximo Número</Label>
                                <Input
                                    id="proximoNumero"
                                    type="number"
                                    min="1"
                                    value={proximoNumero}
                                    onChange={(e) => setProximoNumero(parseInt(e.target.value))}
                                    required
                                />
                                <p className="text-xs text-slate-500">O número a ser usado no próximo lote.</p>
                            </div>

                            {/* PREVIEW */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-700 block mb-1">Prévia do Próximo Display:</span>
                                <span className="font-mono text-lg text-blue-600 font-bold">{getPreview()}</span>
                            </div>

                            {message && (
                                <Alert className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                    {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                    <AlertDescription>{message.text}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Configurações
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}