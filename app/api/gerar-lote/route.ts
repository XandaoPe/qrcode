import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import QRCode from 'qrcode';

export async function POST(request: Request) {
    try {
        const { quantidade, baseUrl } = await request.json();

        if (!quantidade || !baseUrl) {
            return NextResponse.json(
                { message: 'Quantidade e URL base são obrigatórios' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('displays');
        const configCollection = db.collection<any>('configuracoes');

        // 1. Buscar configuração atual
        let config = await configCollection.findOne({ _id: 'numeracao' });

        // Validação para corrigir dados corrompidos/incompletos no banco
        if (!config || config.proximoNumero === undefined || config.padding === undefined) {
            config = {
                _id: 'numeracao',
                prefixo: config?.prefixo || 'DISP',
                proximoNumero: config?.proximoNumero || 1,
                padding: config?.padding || 4
            };
        }

        let currentNum: number = Number(config.proximoNumero) || 1;
        let displaysToInsert: any[] = [];
        let attempts = 0;
        const maxAttempts = 3;

        // Gera o prefixo automático baseado em Data e Hora (ex: DISP-1411-1830)
        // Se o usuário salvou um prefixo customizado nas configurações, usa ele. Se não, usa o automático.
        const now = new Date();
        const dateStr = String(now.getDate()).padStart(2, '0') + String(now.getMonth() + 1).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
        const autoPrefix = `DISP-${dateStr}-${timeStr}`;

        while (displaysToInsert.length < quantidade && attempts < maxAttempts) {
            const needed = quantidade - displaysToInsert.length;
            const batch: any[] = [];

            for (let i = 0; i < needed; i++) {
                const numStr = String(currentNum + i).padStart(config.padding, '0');

                // Junta o prefixo com o sequencial. Ex: DISP-1411-1830-0001
                const serial = `${autoPrefix}-${numStr}`;
                const url = `${baseUrl}/r/${serial}`;

                const qrCodeDataUrl = await QRCode.toDataURL(url, {
                    width: 300,
                    margin: 2,
                    color: { dark: '#000000', light: '#ffffff' }
                });

                batch.push({
                    serial,
                    status: 'disponivel',
                    destinationUrl: null,
                    nomeEmpresa: null,
                    qrCodeBase64: qrCodeDataUrl,
                    createdAt: new Date(),
                });
            }

            try {
                // Tenta inserir o lote
                await collection.insertMany(batch, { ordered: true });
                displaysToInsert.push(...batch);
                currentNum += needed; // Avança o contador
            } catch (error: any) {
                if (error.code === 11000) {
                    console.warn('Conflito de numeração detectado. Ajustando automaticamente...');
                    // Encontra o serial de maior número no banco para pularmos para depois dele
                    const lastDisplay = await collection.find({})
                        .sort({ serial: -1 })
                        .limit(1)
                        .toArray();

                    if (lastDisplay.length > 0) {
                        // Tenta extrair o número do final do serial (ex: DISP-1411-1830-0050 -> 50)
                        const parts = lastDisplay[0].serial.split('-');
                        const lastNum = parseInt(parts[parts.length - 1] || '0', 10);
                        currentNum = lastNum + 1;
                    } else {
                        currentNum += 1;
                    }
                    attempts++;
                } else {
                    throw error;
                }
            }
        }

        if (displaysToInsert.length === 0) {
            return NextResponse.json({ message: 'Não foi possível gerar o lote devido a conflitos de numeração contínuos.' }, { status: 500 });
        }

        // 2. Salvar o novo estado da numeração
        await configCollection.updateOne(
            { _id: 'numeracao' },
            { $set: { proximoNumero: currentNum } },
            { upsert: true }
        );

        return NextResponse.json({
            message: `${displaysToInsert.length} displays gerados com sucesso!`,
            displays: displaysToInsert.map(d => ({
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