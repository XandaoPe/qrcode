import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<any>('configuracoes');

        let config = await collection.findOne({ _id: 'numeracao' });

        // Fallback robusto
        if (!config || config.proximoNumero === undefined) {
            config = {
                _id: 'numeracao',
                prefixo: 'DISP',
                proximoNumero: 1,
                padding: 4,
            };
        }

        return NextResponse.json({ config });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao buscar configurações' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { proximoNumero, padding } = await request.json();

        if (proximoNumero === undefined || padding === undefined) {
            return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<any>('configuracoes');

        await collection.updateOne(
            { _id: 'numeracao' },
            {
                $set: {
                    proximoNumero: Number(proximoNumero),
                    padding: Number(padding),
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ message: 'Configurações salvas com sucesso!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao salvar configurações' }, { status: 500 });
    }
}