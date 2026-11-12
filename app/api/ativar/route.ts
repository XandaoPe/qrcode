import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serial, destinationUrl } = body;

        if (!serial || !destinationUrl) {
            return NextResponse.json(
                { message: 'Serial e URL são obrigatórios' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(); // Pega o banco padrão da sua string de conexão

        // Só ativa se o display estiver com status 'disponivel'
        const result = await db.collection('displays').updateOne(
            { serial, status: 'disponivel' },
            { $set: { status: 'ativo', destinationUrl, clientId: 'teste-cliente-123' } }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { message: 'Display não encontrado ou já foi ativado.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: `Display ${serial} ativado com sucesso!` });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Erro interno no servidor' },
            { status: 500 }
        );
    }
}