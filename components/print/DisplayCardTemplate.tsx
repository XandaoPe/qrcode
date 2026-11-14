import React, { forwardRef } from 'react';

interface DisplayCardProps {
    serial: string;
    qrCodeBase64: string;
    url: string;
}

export const DisplayCardTemplate = forwardRef<HTMLDivElement, DisplayCardProps>(
    ({ serial, qrCodeBase64, url }, ref) => {
        return (
            <div
                ref={ref}
                style={{
                    width: '302px', // Aprox 8cm
                    height: '189px', // Aprox 5cm
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    display: 'flex',
                    overflow: 'hidden',
                    borderRadius: '6px',
                    fontFamily: 'Arial, sans-serif',
                    boxSizing: 'border-box'
                }}
            >
                {/* Lado Esquerdo: QR Code e URL */}
                <div style={{
                    width: '50%',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%'
                    }}>
                        <img
                            src={qrCodeBase64}
                            alt="QR Code"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <div style={{
                        fontSize: '7px',
                        color: '#64748b',
                        textAlign: 'center',
                        marginTop: '4px',
                        wordBreak: 'break-all',
                        lineHeight: '1.2'
                    }}>
                        {url.replace('https://', '').replace('http://', '')}
                    </div>
                </div>

                {/* Lado Direito: Textos e Logo */}
                <div style={{
                    width: '50%',
                    padding: '12px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    boxSizing: 'border-box'
                }}>
                    {/* Logo do Google SVG */}
                    <div style={{ marginBottom: '4px' }}>
                        <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>

                    <div style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        lineHeight: '1.1'
                    }}>
                        Avalie-nos<br />no Google
                    </div>

                    <div style={{ color: '#FACC15', fontSize: '14px', letterSpacing: '2px', margin: '6px 0' }}>
                        ★★★★★
                    </div>

                    <div style={{
                        color: '#22D3EE',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '16px'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                            <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                            <line x1="12" y1="20" x2="12.01" y2="20"></line>
                        </svg>
                        NFC
                    </div>

                    <div style={{
                        fontSize: '7px',
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        marginTop: '8px',
                        position: 'absolute',
                        bottom: '8px',
                        width: '100%',
                        textAlign: 'center',
                        left: 0
                    }}>
                        Aproxime o celular
                    </div>
                </div>
            </div>
        );
    }
);
DisplayCardTemplate.displayName = 'DisplayCardTemplate';