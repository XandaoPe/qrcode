import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT: Atualizar um display (Editar)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { nomeEmpresa, destinationUrl, status } = body;

        const client = await clientPromise;
        const db = client.db();

        const updateData: any = { updatedAt: new Date() };
        if (nomeEmpresa !== undefined) updateData.nomeEmpresa = nomeEmpresa;
        if (destinationUrl !== undefined) updateData.destinationUrl = destinationUrl;
        if (status !== undefined) updateData.status = status;

        const result = await db.collection('displays').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Display não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Display atualizado com sucesso!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao atualizar display' }, { status: 500 });
    }
}

// DELETE: Excluir um display
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('displays').deleteOne(
            { _id: new ObjectId(id) }
        );

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Display não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Display excluído com sucesso!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao excluir display' }, { status: 500 });
    }
}