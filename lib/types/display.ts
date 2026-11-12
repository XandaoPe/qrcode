export interface Display {
    serial: string; // Ex: "lote001-0001"
    status: 'disponivel' | 'ativo' | 'perdido';
    destinationUrl: string | null;
    clientId?: string | null;
    createdAt: Date;
}