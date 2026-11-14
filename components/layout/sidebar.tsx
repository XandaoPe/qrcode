'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Layers, Settings, Database, SlidersHorizontal, Printer } from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
        { href: '/admin/gerar-lote', label: 'Gerar Lote', icon: Layers },
        { href: '/admin/ativar', label: 'Ativar Display', icon: Settings },
        { href: '/admin/gerenciar', label: 'Gerenciar Displays', icon: Database },
        { href: '/admin/impressoes', label: 'Histórico de Impressões', icon: Printer },
        { href: '/admin/configuracoes', label: 'Configurações', icon: SlidersHorizontal },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <span className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                        QR
                    </div>
                    Manager
                </span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    // Verifica se a rota atual é exatamente o href, ou se é uma sub-rota (ex: /admin/gerenciar/123)
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                    return (
                        <Link key={link.href} href={link.href}>
                            <span className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-200">
                <div className="text-xs text-slate-400 text-center">
                    &copy; QR Manager
                </div>
            </div>
        </aside>
    );
}