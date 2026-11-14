'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Activity, Layers, Settings } from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Visão Geral', href: '/', icon: Activity },
        { name: 'Gerar Lotes', href: '/admin/gerar-lote', icon: Layers },
        { name: 'Ativar Display', href: '/admin/ativar', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <QrCode className="w-6 h-6 text-blue-500 mr-3" />
                <span className="text-white font-bold text-lg tracking-wide">QR Manager</span>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-slate-800 text-white'
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
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
    );
}