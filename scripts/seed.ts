import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Carrega a variável de ambiente

const uri = process.env.MONGODB_URI;

async function seed() {
    if (!uri) throw new Error("MONGODB_URI não encontrada");

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    console.log("Inserindo displays de teste...");

    await db.collection('displays').insertMany([
        { serial: 'lote001-0001', status: 'disponivel', destinationUrl: null, createdAt: new Date() },
        { serial: 'lote001-0002', status: 'disponivel', destinationUrl: null, createdAt: new Date() }
    ]);

    console.log("Displays criados com sucesso!");
    await client.close();
}

seed().catch(console.error);