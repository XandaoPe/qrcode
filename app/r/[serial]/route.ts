import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serial: string }> }
) {
    try {
        const { serial } = await params;
        const client = await clientPromise;
        const db = client.db();
        const display = await db.collection('displays').findOne({ serial });

        if (!display) {
            // Se não existe, volta pra home
            return NextResponse.redirect(new URL('/', request.url));
        }

        // REGRA DE NEGÓCIO: Se não estiver 'ativo' ou não tiver URL, não redireciona
        if (display.status !== 'ativo' || !display.destinationUrl) {
            // Manda para uma página de aviso ou para a home
            return NextResponse.redirect(new URL('/?erro=display-inativo', request.url));
        }

        // Redireciona para o site do cliente
        return NextResponse.redirect(display.destinationUrl, 302);
    } catch (error) {
        console.error('Erro no redirecionamento:', error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}