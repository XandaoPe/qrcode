'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Printer, Calendar, Hash, AlertTriangle, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { GoogleReviewCard } from '@/components/print/GoogleReviewCard';

interface DisplayGerado {
    serial: string;
    url: string;
    qrCodeBase64?: string;
}

interface Impressao {
    _id: string;
    data: string;
    quantidade: number;
    displays?: DisplayGerado[];
    seriais?: string[];
    createdAt: string;
}

export default function HistoricoImpressoesPage() {
    const router = useRouter();
    const [historico, setHistorico] = useState<Impressao[]>([]);
    const [loading, setLoading] = useState(true);
    const [printingId, setPrintingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Ref para o container invisível da reimpressão
    const printContainerRef = useRef<HTMLDivElement>(null);
    const [displaysToPrint, setDisplaysToPrint] = useState<DisplayGerado[]>([]);

    async function fetchHistorico() {
        setLoading(true);
        try {
            const res = await fetch('/api/historico');
            const data = await res.json();
            if (data.impressoes) setHistorico(data.impressoes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHistorico();
    }, []);

    async function handleReimprimir(item: Impressao) {
        if (!item.displays || item.displays.length === 0) {
            alert("Este é um registro antigo e não contém os dados do QR Code salvos. Não é possível reimprimir.");
            return;
        }

        setPrintingId(item._id);
        setDisplaysToPrint(item.displays);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            if (!printContainerRef.current) return;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const cardW = 80;
            const cardH = 50;
            const marginY = 8;
            const gapY = 6;
            const marginX = (pageWidth - (cardW * 2)) / 3;

            let currentX = marginX;
            let currentY = marginY;
            let col = 0;

            const cards = printContainerRef.current.children;

            for (let i = 0; i < cards.length; i++) {
                const imgData = await toPng(cards[i] as HTMLElement, {
                    quality: 1.0,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    width: 400,
                    height: 250,
                });

                pdf.addImage(imgData, 'PNG', currentX, currentY, cardW, cardH);

                col++;
                if (col >= 2) {
                    col = 0;
                    currentX = marginX;
                    currentY += cardH + gapY;

                    if (currentY + cardH > pageHeight - marginY) {
                        pdf.addPage();
                        currentY = marginY;
                    }
                } else {
                    currentX += cardW + marginX;
                }
            }

            pdf.save(`reimpressao-${new Date(item.data).getTime()}.pdf`);

        } catch (error) {
            console.error("Erro ao reimprimir", error);
            alert("Erro ao gerar o PDF de reimpressão.");
        } finally {
            setPrintingId(null);
            setDisplaysToPrint([]);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este registro do histórico? Esta ação não pode ser desfeita.')) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`/api/historico/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Atualiza a lista removendo o item localmente para ser mais rápido
                setHistorico(prev => prev.filter(item => item._id !== id));
            } else {
                alert('Erro ao excluir o registro.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao tentar excluir.');
        } finally {
            setDeletingId(null);
        }
    }

    const getSerialRange = (item: Impressao) => {
        if (item.displays && item.displays.length > 0) {
            const first = item.displays[0]?.serial || '';
            const last = item.displays[item.displays.length - 1]?.serial || '';
            return first === last ? first : `${first} até ${last}`;
        }
        if (item.seriais && item.seriais.length > 0) {
            const first = item.seriais[0] || '';
            const last = item.seriais[item.seriais.length - 1] || '';
            return first === last ? first : `${first} até ${last}`;
        }
        return 'Dados não disponíveis';
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* CONTAINER INVISÍVEL PARA A REIMPRESSÃO */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                <div ref={printContainerRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {displaysToPrint.map((d) => (
                        <GoogleReviewCard
                            key={d.serial}
                            serial={d.serial}
                            qrCodeBase64={d.qrCodeBase64 || ''}
                            url={d.url}
                        />
                    ))}
                </div>
            </div>

            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-4 text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <h1 className="text-xl font-semibold text-slate-800">Histórico de Impressões</h1>
            </header>

            <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : historico.length === 0 ? (
                    <Card className="text-center p-12 text-slate-500">
                        Nenhuma impressão registrada ainda.
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {historico.map((item) => {
                            const hasDisplaysData = item.displays && item.displays.length > 0;

                            return (
                                <Card key={item._id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${hasDisplaysData ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'}`}>
                                                {hasDisplaysData ? <Printer className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {new Date(item.data).toLocaleString('pt-BR')}
                                                </p>
                                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                    <Hash className="w-4 h-4 text-slate-400" />
                                                    {item.quantidade} displays impressos
                                                </p>
                                                <p className="text-xs text-slate-400 mt-2 max-w-md truncate">
                                                    {getSerialRange(item)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto items-center">
                                            {/* Botão de Excluir */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Excluir Registro"
                                                onClick={() => handleDelete(item._id)}
                                                disabled={deletingId === item._id || printingId === item._id}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                                            >
                                                {deletingId === item._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </Button>

                                            {/* Botão de Reimprimir */}
                                            <Button
                                                className={`w-full md:w-auto text-white ${hasDisplaysData ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 cursor-not-allowed hover:bg-slate-400'}`}
                                                onClick={() => handleReimprimir(item)}
                                                disabled={printingId === item._id || !hasDisplaysData || deletingId === item._id}
                                                title={!hasDisplaysData ? "Registro antigo, sem dados do QR Code" : "Baixar PDF novamente"}
                                            >
                                                {printingId === item._id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Printer className="w-4 h-4 mr-2" />
                                                )}
                                                {printingId === item._id ? 'Gerando...' : 'Reimprimir PDF'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}