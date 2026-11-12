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
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Se o display ainda não foi vendido/ativado
        if (display.status !== 'ativo' || !display.destinationUrl) {
            // Manda para uma página temporária (ou para a home, por enquanto)
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Redireciona para o site do cliente
        return NextResponse.redirect(display.destinationUrl, 302);
    } catch (error) {
        console.error('Erro no redirecionamento:', error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}