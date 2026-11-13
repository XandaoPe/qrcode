import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { lote, quantidade, baseUrl } = await request.json();

        if (!lote || !quantidade || !baseUrl) {
            return NextResponse.json(
                { message: 'Lote, quantidade e URL base são obrigatórios' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('displays');

        // Gera os documentos sequenciais
        const displays = [];
        for (let i = 1; i <= quantidade; i++) {
            // Ex: lote001-0001
            const serial = `${lote}-${String(i).padStart(4, '0')}`;

            displays.push({
                serial,
                status: 'disponivel',
                destinationUrl: null,
                createdAt: new Date(),
            });
        }

        // Insere todos de uma vez no banco
        // O 'ordered: false' permite que, se um serial já existir, ele pule e insira os outros sem travar tudo
        try {
            await collection.insertMany(displays, { ordered: false });
        } catch (error: any) {
            // Código 11000 é erro de duplicidade no MongoDB
            if (error.code === 11000) {
                return NextResponse.json(
                    { message: 'Atenção: Alguns seriais deste lote já existiam e foram ignorados.' },
                    { status: 207 } // Multi-Status
                );
            }
            throw error;
        }

        return NextResponse.json({
            message: `${quantidade} displays gerados com sucesso!`,
            displays: displays.map(d => ({ serial: d.serial, url: `${baseUrl}/r/${d.serial}` }))
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Erro interno ao gerar o lote' },
            { status: 500 }
        );
    }
}