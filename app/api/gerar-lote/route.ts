import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import QRCode from 'qrcode';

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

        // Gera os documentos sequenciais COM o QR Code em Base64
        const displays = [];
        for (let i = 1; i <= quantidade; i++) {
            const serial = `${lote}-${String(i).padStart(4, '0')}`;
            const url = `${baseUrl}/r/${serial}`;

            // Gera o QR Code como Data URL (Base64) no servidor
            const qrCodeDataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            });

            displays.push({
                serial,
                status: 'disponivel',
                destinationUrl: null,
                nomeEmpresa: null,
                qrCodeBase64: qrCodeDataUrl, // Armazena a imagem no banco
                createdAt: new Date(),
            });
        }

        try {
            await collection.insertMany(displays, { ordered: false });
        } catch (error: any) {
            if (error.code === 11000) {
                return NextResponse.json(
                    { message: 'Atenção: Alguns seriais deste lote já existiam e foram ignorados.' },
                    { status: 207 }
                );
            }
            throw error;
        }

        return NextResponse.json({
            message: `${quantidade} displays gerados com sucesso!`,
            displays: displays.map(d => ({
                serial: d.serial,
                url: `${baseUrl}/r/${d.serial}`,
                qrCodeBase64: d.qrCodeBase64
            }))
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Erro interno ao gerar o lote' },
            { status: 500 }
        );
    }
}