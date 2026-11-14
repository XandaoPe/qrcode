import React, { forwardRef } from 'react';

interface GoogleReviewCardProps {
    serial: string;
    qrCodeBase64: string;
    url: string;
}

export const GoogleReviewCard = forwardRef<HTMLDivElement, GoogleReviewCardProps>(
    ({ serial, qrCodeBase64, url }, ref) => {
        // Pega apenas o final da URL
        const shortUrl = url.split('/').pop() || serial;

        return (
            <div
                ref={ref}
                style={{
                    width: '400px',
                    height: '250px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: 'Arial, sans-serif',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                {/* ===== BLOCO SUPERIOR AZUL ===== */}
                <div
                    style={{
                        backgroundColor: '#1E40AF', // Azul royal
                        color: '#ffffff',
                        height: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingTop: '16px',
                        position: 'relative',
                    }}
                >
                    {/* Estrelas */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill="#FACC15" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        ))}
                    </div>

                    {/* Textos */}
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px', letterSpacing: '0.5px' }}>
                        nós gostaríamos da sua opinião
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.1' }}>
                        NOS AVALIE NO
                    </div>

                    {/* Logo do Google MAIOR e mais para baixo */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-45px', // AQUI: Desceu o logo para não cobrir o texto
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '75px',
                        height: '75px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '6px solid #ffffff',
                        zIndex: 10
                    }}>
                        <svg viewBox="0 0 24 24" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>
                </div>

                {/* ===== BLOCO INFERIOR BRANCO ===== */}
                <div style={{
                    height: '50%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    padding: '0px 30px 30px 30px', // AQUI: Aumentei o padding bottom para afastar do logo
                    position: 'relative'
                }}>

                    {/* Lado Esquerdo: NFC */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%' }}>
                        <div style={{
                            width: '55px', height: '55px',
                            backgroundColor: '#000000',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '8px'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                <line x1="12" y1="20" x2="12.01" y2="20"></line>
                            </svg>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1E40AF', textAlign: 'center', lineHeight: '1.2' }}>
                            APROXIME O<br />SEU CELULAR
                        </div>
                    </div>

                    {/* Divisor "OU" */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '70%', justifyContent: 'center' }}>
                        <div style={{ width: '2px', height: '100%', backgroundColor: '#e5e7eb' }}></div>
                        <div style={{
                            fontSize: '11px', fontWeight: 'bold', color: '#6b7280',
                            backgroundColor: '#ffffff', padding: '4px 8px',
                            borderRadius: '12px', border: '1px solid #e5e7eb', margin: '8px 0',
                            position: 'absolute'
                        }}>
                            OU
                        </div>
                    </div>

                    {/* Lado Direito: QR Code */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%' }}>
                        <div style={{ background: '#ffffff', padding: '4px', borderRadius: '4px', marginBottom: '8px' }}>
                            <img src={qrCodeBase64} alt="QR" style={{ width: '60px', height: '60px', display: 'block' }} />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1E40AF', textAlign: 'center', lineHeight: '1.2' }}>
                            APONTE A<br />SUA CÂMERA
                        </div>
                    </div>

                </div>

                {/* ===== BARRA COLORIDA NA BASE ===== */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '10px', display: 'flex' }}>
                    <div style={{ flex: 1, backgroundColor: '#4285F4' }}></div>
                    <div style={{ flex: 1, backgroundColor: '#EA4335' }}></div>
                    <div style={{ flex: 1, backgroundColor: '#FBBC05' }}></div>
                    <div style={{ flex: 1, backgroundColor: '#34A853' }}></div>
                </div>

                {/* URL Curta no canto (Opcional) */}
                <div style={{ position: 'absolute', bottom: '15px', right: '10px', fontSize: '7px', color: '#9CA3AF' }}>
                    {shortUrl}
                </div>
            </div>
        );
    }
);
GoogleReviewCard.displayName = 'GoogleReviewCard';