import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('impressoes').deleteOne(
            { _id: new ObjectId(id) }
        );

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Registro não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Registro de impressão excluído com sucesso!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao excluir registro' }, { status: 500 });
    }
}