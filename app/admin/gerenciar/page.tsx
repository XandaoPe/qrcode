'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ArrowLeft, Search, Edit2, Trash2, Power, CheckCircle2,
    XCircle, Loader2, Building2, Link as LinkIcon, X, Download, QrCode, ExternalLink
} from 'lucide-react';

interface Display {
    _id: string;
    serial: string;
    status: 'disponivel' | 'ativo' | 'desativado';
    destinationUrl: string | null;
    nomeEmpresa: string | null;
    qrCodeBase64: string | null;
    createdAt: string;
}

export default function GerenciarDisplaysPage() {
    const router = useRouter();
    const [displays, setDisplays] = useState<Display[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Estado para controlar qual ação o modal está executando
    const [modalAction, setModalAction] = useState<'edit' | 'activate'>('edit');
    const [modalLoading, setModalLoading] = useState(false);
    const [generatingQrId, setGeneratingQrId] = useState<string | null>(null);

    // Estado do Modal
    const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null);
    const [formNomeEmpresa, setFormNomeEmpresa] = useState('');
    const [formUrl, setFormUrl] = useState('');

    async function fetchDisplays() {
        setLoading(true);
        try {
            const res = await fetch('/api/displays');
            const data = await res.json();
            if (res.ok) {
                setDisplays(data.displays);
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro ao carregar displays.' });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDisplays();
    }, []);

    // --- AÇÕES DA TABELA ---

    async function handleToggleStatus(display: Display) {
        if (display.status === 'ativo') {
            // Desativar direto (sem modal)
            try {
                const res = await fetch(`/api/displays/${display._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'desativado' }),
                });
                if (res.ok) {
                    setMessage({ type: 'success', text: `Display ${display.serial} desativado!` });
                    fetchDisplays();
                }
            } catch {
                setMessage({ type: 'error', text: 'Erro ao desativar.' });
            }
        } else {
            // Se estiver disponível ou desativado, abre o modal para Ativar
            openModal(display, 'activate');
        }
    }

    async function handleGenerateQr(display: Display) {
        setGeneratingQrId(display._id);
        try {
            const res = await fetch(`/api/displays/${display._id}/gerar-qr`, { method: 'POST' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'QR Code gerado com sucesso!' });
                fetchDisplays(); // Atualiza a tabela para mostrar a imagem
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro ao gerar QR Code.' });
        } finally {
            setGeneratingQrId(null);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja excluir este display?')) return;
        try {
            const res = await fetch(`/api/displays/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Display excluído!' });
                fetchDisplays();
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro ao excluir.' });
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

    // --- CONTROLE DO MODAL ---

    function openModal(display: Display, action: 'edit' | 'activate') {
        setModalAction(action);
        setSelectedDisplay(display);
        setFormNomeEmpresa(display.nomeEmpresa || '');
        setFormUrl(display.destinationUrl || '');
    }

    function closeModal() {
        setSelectedDisplay(null);
        setFormNomeEmpresa('');
        setFormUrl('');
    }

    async function handleSaveModal(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedDisplay) return;
        setModalLoading(true);

        try {
            const payload: any = {
                nomeEmpresa: formNomeEmpresa,
                destinationUrl: formUrl,
            };
            if (modalAction === 'activate') {
                payload.status = 'ativo';
            }

            const res = await fetch(`/api/displays/${selectedDisplay._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: `Display ${modalAction === 'activate' ? 'ativado' : 'atualizado'} com sucesso!` });
                closeModal();
                fetchDisplays();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Erro ao salvar.' });
        } finally {
            setModalLoading(false);
        }
    }

    const filteredDisplays = displays.filter(d =>
        d.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.nomeEmpresa && d.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full relative">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-4 text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <h1 className="text-xl font-semibold text-slate-800">Gerenciar Displays</h1>
            </header>

            <div className="p-8 max-w-7xl mx-auto w-full space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por serial ou empresa..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-slate-500">
                        Total: {filteredDisplays.length} displays
                    </div>
                </div>

                {message && (
                    <Alert className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                        <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                )}

                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-4 font-medium text-center">QR Code</th>
                                    <th className="px-4 py-4 font-medium">Serial</th>
                                    <th className="px-4 py-4 font-medium">Empresa</th>
                                    <th className="px-4 py-4 font-medium">Link do QR (Físico)</th>
                                    <th className="px-4 py-4 font-medium">Destino (Cliente)</th>
                                    <th className="px-4 py-4 font-medium">Status</th>
                                    <th className="px-4 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Carregando displays...
                                        </td>
                                    </tr>
                                ) : filteredDisplays.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            Nenhum display encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDisplays.map((display) => {
                                        // Constrói a URL física do QR Code baseada na origem atual
                                        const qrPhysicalUrl = typeof window !== 'undefined'
                                            ? `${window.location.origin}/r/${display.serial}`
                                            : `/r/${display.serial}`;

                                        return (
                                            <tr key={display._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-center">
                                                    {display.qrCodeBase64 ? (
                                                        <div className="relative group inline-block">
                                                            <img
                                                                src={display.qrCodeBase64}
                                                                alt={`QR ${display.serial}`}
                                                                className="w-12 h-12 rounded border border-slate-200 bg-white"
                                                            />
                                                            <button
                                                                onClick={() => downloadQRCode(display.qrCodeBase64!, display.serial)}
                                                                className="absolute inset-0 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                                title="Baixar QR Code"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center">
                                                            <span className="text-slate-400 text-[10px] italic mb-1">Sem QR</span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 text-[10px] px-2"
                                                                onClick={() => handleGenerateQr(display)}
                                                                disabled={generatingQrId === display._id}
                                                            >
                                                                {generatingQrId === display._id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <QrCode className="w-3 h-3 mr-1" />}
                                                                Gerar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 font-mono font-medium text-slate-800">
                                                    {display.serial}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {display.nomeEmpresa ? (
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="w-4 h-4 text-slate-400" />
                                                            <span className="text-slate-700 max-w-[150px] truncate" title={display.nomeEmpresa}>
                                                                {display.nomeEmpresa}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Não definido</span>
                                                    )}
                                                </td>

                                                {/* NOVA COLUNA: Link gravado no QR Code */}
                                                <td className="px-4 py-4">
                                                    <a
                                                        href={qrPhysicalUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-slate-500 hover:text-blue-600 flex items-center gap-1 max-w-[180px] truncate font-mono text-xs"
                                                        title={qrPhysicalUrl}
                                                    >
                                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                                        /r/{display.serial}
                                                    </a>
                                                </td>

                                                {/* COLUNA RENOMEADA: Destino do cliente */}
                                                <td className="px-4 py-4">
                                                    {display.destinationUrl ? (
                                                        <a
                                                            href={display.destinationUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center gap-1 max-w-[180px] truncate"
                                                            title={display.destinationUrl}
                                                        >
                                                            <LinkIcon className="w-3 h-3 shrink-0" />
                                                            {display.destinationUrl}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400 italic">-</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${display.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                                            display.status === 'desativado' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'}`}>
                                                        {display.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Regerar QR Code (se já existir) */}
                                                        {display.qrCodeBase64 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Regerar QR Code"
                                                                onClick={() => handleGenerateQr(display)}
                                                                disabled={generatingQrId === display._id}
                                                                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                                            >
                                                                {generatingQrId === display._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                                                            </Button>
                                                        )}

                                                        {/* Botão de Ativar / Desativar */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title={display.status === 'ativo' ? 'Desativar' : 'Ativar'}
                                                            onClick={() => handleToggleStatus(display)}
                                                            className={display.status === 'ativo' ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'}
                                                        >
                                                            <Power className="w-4 h-4" />
                                                        </Button>

                                                        {/* Botão de Editar */}
                                                        {display.status !== 'disponivel' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Editar"
                                                                onClick={() => openModal(display, 'edit')}
                                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                        )}

                                                        {/* Botão de Excluir */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Excluir"
                                                            onClick={() => handleDelete(display._id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* MODAL UNIFICADO: ATIVAÇÃO / EDIÇÃO */}
            {selectedDisplay && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                {modalAction === 'activate' ? <Power className="w-5 h-5 text-green-600" /> : <Edit2 className="w-5 h-5 text-blue-600" />}
                                {modalAction === 'activate' ? 'Ativar Display' : 'Editar Display'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={closeModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <CardContent className="p-6">
                            <form onSubmit={handleSaveModal} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Serial do Display</label>
                                    <Input value={selectedDisplay.serial} disabled className="bg-slate-50 font-mono text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nome da Empresa</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            className="pl-9"
                                            placeholder="Ex: Restaurante do Zé"
                                            value={formNomeEmpresa}
                                            onChange={(e) => setFormNomeEmpresa(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">URL de Destino</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            className="pl-9"
                                            type="url"
                                            placeholder="https://site-do-cliente.com"
                                            value={formUrl}
                                            onChange={(e) => setFormUrl(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeModal} disabled={modalLoading}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className={modalAction === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} disabled={modalLoading}>
                                        {modalLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        {modalAction === 'activate' ? 'Ativar Display' : 'Salvar Alterações'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}