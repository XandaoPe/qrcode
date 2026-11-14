import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Função auxiliar para gerar a tela de erro amigável
function renderErrorPage(title: string, message: string, code: number) {
    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f8fafc;
                    color: #334155;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                    padding: 20px;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    max-width: 400px;
                    width: 100%;
                }
                .icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 12px;
                    color: #0f172a;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #64748b;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">🔍</div>
                <h1>${title}</h1>
                <p>${message}</p>
            </div>
        </body>
        </html>
    `;

    return new NextResponse(html, {
        status: code,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serial: string }> }
) {
    try {
        const { serial } = await params;
        const client = await clientPromise;
        const db = client.db();
        const display = await db.collection('displays').findOne({ serial });

        // Se não encontrar o display
        if (!display) {
            return renderErrorPage(
                'Destino não encontrado',
                'O código escaneado não é válido ou o produto não está registrado no sistema.',
                404
            );
        }

        // Se o display não estiver ativo ou não tiver URL
        if (display.status !== 'ativo' || !display.destinationUrl) {
            return renderErrorPage(
                'Produto não ativado',
                'Este display ainda não foi ativado pela empresa ou encontra-se temporariamente desativado.',
                403
            );
        }

        // Redireciona para o site do cliente
        return NextResponse.redirect(display.destinationUrl, 302);

    } catch (error) {
        console.error('Erro no redirecionamento:', error);
        return renderErrorPage(
            'Erro interno',
            'Ocorreu um erro inesperado ao processar sua solicitação. Tente novamente mais tarde.',
            500
        );
    }
}