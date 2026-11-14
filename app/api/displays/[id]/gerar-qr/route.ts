import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import QRCode from 'qrcode';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db();

        const display = await db.collection('displays').findOne({ _id: new ObjectId(id) });

        if (!display) {
            return NextResponse.json({ message: 'Display não encontrado' }, { status: 404 });
        }

        // Gera a URL de redirecionamento baseada na origem da requisição
        const origin = new URL(request.url).origin;
        const url = `${origin}/r/${display.serial}`;

        // Gera o QR Code em Base64
        const qrCodeBase64 = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        });

        // Salva no banco
        await db.collection('displays').updateOne(
            { _id: new ObjectId(id) },
            { $set: { qrCodeBase64, updatedAt: new Date() } }
        );

        return NextResponse.json({
            message: 'QR Code gerado com sucesso!',
            qrCodeBase64
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao gerar QR Code' }, { status: 500 });
    }
}