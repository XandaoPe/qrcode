import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET: Listar todos os displays
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        // Busca todos e ordena por data de criação (mais recentes primeiro)
        const displays = await db.collection('displays')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json({ displays });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Erro ao buscar displays' },
            { status: 500 }
        );
    }
}