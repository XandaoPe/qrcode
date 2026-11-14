import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serial, destinationUrl, nomeEmpresa } = body;

        if (!serial || !destinationUrl || !nomeEmpresa) {
            return NextResponse.json(
                { message: 'Serial, URL e Nome da Empresa são obrigatórios' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Só ativa se o display estiver com status 'disponivel'
        const result = await db.collection('displays').updateOne(
            { serial, status: 'disponivel' },
            {
                $set: {
                    status: 'ativo',
                    destinationUrl,
                    nomeEmpresa, // Novo campo adicionado
                    clientId: 'teste-cliente-123',
                    updatedAt: new Date()
                }
            }
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