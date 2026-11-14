import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { quantidade, displays, data } = await request.json();
        const client = await clientPromise;
        const db = client.db();

        await db.collection('impressoes').insertOne({
            data: new Date(data),
            quantidade,
            displays, // Salva o array completo
            createdAt: new Date()
        });

        return NextResponse.json({ message: 'Impressão registrada com sucesso!' });
    } catch (error) {
        return NextResponse.json({ message: 'Erro ao registrar impressão' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const impressoes = await db.collection('impressoes').find({}).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ impressoes });
    } catch (error) {
        return NextResponse.json({ message: 'Erro ao buscar histórico' }, { status: 500 });
    }
}