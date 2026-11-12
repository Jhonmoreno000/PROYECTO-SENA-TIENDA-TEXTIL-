import React, { useState } from 'react';
import { RotateCw, ShieldCheck, Lock } from 'lucide-react';
import { formatCurrency } from '../../utilidades/formateadores';
import { LogoPasarelaPorId, LogoMastercard, LogoVisa } from './LogosPasarelas';

/**
 * CardPreview: Adaptación del diseño 3D Flip Card de Uiverse.io (por Praashoo7).
 * Integra chip metálico de alta definición, sensor contactless NFC, textura satinada
 * y adaptación dinámica para Mastercard, Visa, Wompi, Mercado Pago, Nequi, ePayco y PSE.
 */
function CardPreview({
    cardNumber,
    cardHolder,
    expiryDate,
    cvv,
    isFlipped = false,
    cardType = 'unknown',
    gateway = 'card',
    totalAmount = 0,
    reference = 'DD-2026',
}) {
    const [manualFlip, setManualFlip] = useState(false);
    const volteada = isFlipped || manualFlip;

    // Formateo del número de tarjeta en bloques de 4 dígitos
    const formatCardNumber = (number) => {
        if (!number) return '9759 2484 5269 6576';
        const cleaned = number.replace(/\s/g, '');
        return (cleaned.match(/.{1,4}/g)?.join(' ') || cleaned).padEnd(19, '•').slice(0, 19);
    };

    // Textos y datos dinámicos según el método de pago activo
    const getCardConfig = () => {
        switch (gateway) {
            case 'wompi':
                return {
                    heading: 'WOMPI BANCOLOMBIA',
                    number: '3027  0589  5100  2026',
                    validThru: 'SEGURIDAD',
                    date: 'SHA-256',
                    name: cardHolder ? cardHolder.toUpperCase() : 'D&D TEXTIL × WOMPI',
                    accentGlow: 'rgba(0, 195, 137, 0.25)',
                };
            case 'mercadopago':
                return {
                    heading: 'MERCADO PAGO',
                    number: '5490  1200  8842  2026',
                    validThru: 'CUOTAS',
                    date: 'HASTA 12',
                    name: cardHolder ? cardHolder.toUpperCase() : 'CHECKOUT PRO D&D',
                    accentGlow: 'rgba(0, 158, 227, 0.25)',
                };
            case 'nequi':
                return {
                    heading: 'NEQUI • LLAVE BRE-B',
                    number: '302   705   8951   D&D',
                    validThru: 'TARIFA',
                    date: '0% COM.',
                    name: cardHolder ? cardHolder.toUpperCase() : 'D&D TEXTIL MEDELLÍN',
                    accentGlow: 'rgba(255, 0, 128, 0.22)',
                };
            case 'epayco':
                return {
                    heading: 'ePAYCO EFECTY',
                    number: '1104  5200  3027  0589',
                    validThru: 'CONVENIO',
                    date: 'MULTICAJA',
                    name: cardHolder ? cardHolder.toUpperCase() : 'D&D TEXTIL NACIONAL',
                    accentGlow: 'rgba(255, 90, 0, 0.22)',
                };
            case 'pse':
                return {
                    heading: 'PSE ACH COLOMBIA',
                    number: 'ACH   COL   3027   0589',
                    validThru: 'SISTEMA',
                    date: 'EN LÍNEA',
                    name: cardHolder ? cardHolder.toUpperCase() : 'DÉBITO BANCARIO',
                    accentGlow: 'rgba(56, 189, 248, 0.22)',
                };
            case 'card':
            default:
                return {
                    heading:
                        cardType === 'mastercard'
                            ? 'MASTERCARD'
                            : cardType === 'visa'
                            ? 'VISA PLATINUM'
                            : 'D&D TEXTIL PLATINUM',
                    number: formatCardNumber(cardNumber),
                    validThru: 'VALID THRU',
                    date: expiryDate || '12 / 24',
                    name: cardHolder ? cardHolder.toUpperCase() : 'BRUCE WAYNE',
                    accentGlow: 'rgba(245, 158, 11, 0.2)',
                };
        }
    };

    const config = getCardConfig();

    // Renderizado del logo adaptativo oficial
    const renderCardLogo = () => {
        if (gateway === 'card') {
            if (cardType === 'visa') {
                return <LogoVisa className="h-6" darkBg={true} />;
            }
            // Por defecto o si es mastercard: logo oficial con las 3 franjas de Uiverse
            return (
                <svg
                    className="logo-svg"
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="34"
                    viewBox="0 0 48 48"
                >
                    <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z" />
                    <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z" />
                    <path
                        fill="#ff3d00"
                        d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48 C20.376,15.05,18,19.245,18,24z"
                    />
                </svg>
            );
        }
        return <LogoPasarelaPorId gateway={gateway} cardType={cardType} className="h-6" darkBg={true} />;
    };

    return (
        <div className="w-full max-w-sm sm:max-w-md mx-auto select-none flex flex-col items-center">
            {/* Contenedor con perspectiva 3D */}
            <div className="relative w-full flex justify-center py-2">
                {/* Resplandor ambiental de lujo */}
                <div
                    className="absolute inset-0 rounded-3xl blur-2xl opacity-60 pointer-events-none transition-all duration-500"
                    style={{
                        background: `radial-gradient(circle, ${config.accentGlow} 0%, transparent 70%)`,
                    }}
                />

                {/* Estructura oficial Flip Card (Uiverse.io por Praashoo7) */}
                <div
                    className={`flip-card ${volteada ? 'is-flipped' : ''}`}
                    onClick={() => setManualFlip((prev) => !prev)}
                    title="Haz clic para girar la tarjeta 3D"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setManualFlip((prev) => !prev);
                        }
                    }}
                >
                    <div className="flip-card-inner">
                        {/* ================= CARA FRONTAL ================= */}
                        <div className="flip-card-front">
                            {/* Cabecera / Marca superior */}
                            <p className="heading_8264">{config.heading}</p>

                            {/* Logo oficial de la pasarela en la esquina superior/media derecha */}
                            <div className="logo">{renderCardLogo()}</div>

                            {/* Chip inteligente EMV en ultra-alta definición (Uiverse.io base64) */}
                            <svg
                                version="1.1"
                                className="chip"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                width="30px"
                                height="30px"
                                viewBox="0 0 50 50"
                                xmlSpace="preserve"
                                aria-label="Chip EMV inteligente"
                            >
                                <image
                                    id="image0"
                                    width="50"
                                    height="50"
                                    x="0"
                                    y="0"
                                    href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB6VBMVEUAAACNcTiVeUKVeUOYfEaafEeUeUSYfEWZfEaykleyklaXe0SWekSZZjOYfEWYe0WXfUWXe0WcgEicfkiXe0SVekSXekSWekKYe0a9nF67m12ZfUWUeEaXfESVekOdgEmVeUWWekSniU+VeUKVeUOrjFKYfEWliE6WeESZe0GSe0WYfES7ml2Xe0WXeESUeEOWfEWcf0eWfESXe0SXfEWYekSVeUKXfEWxklawkVaZfEWWekOUekOWekSYfESZe0eXekWYfEWZe0WZe0eVeUSWeETAnmDCoWLJpmbxy4P1zoXwyoLIpWbjvXjivnjgu3bfu3beunWvkFWxkle/nmDivXiWekTnwXvkwHrCoWOuj1SXe0TEo2TDo2PlwHratnKZfEbQrWvPrWuafUfbt3PJp2agg0v0zYX0zYSfgkvKp2frxX7mwHrlv3rsxn/yzIPgvHfduXWXe0XuyIDzzISsjVO1lVm0lFitjVPzzIPqxX7duna0lVncuHTLqGjvyIHeuXXxyYGZfUayk1iyk1e2lln1zYTEomO2llrbtnOafkjFpGSbfkfZtXLhvHfkv3nqxH3mwXujhU3KqWizlFilh06khk2fgkqsjlPHpWXJp2erjVOhg0yWe0SliE+XekShhEvAn2D///+gx8TWAAAARnRSTlMACVCTtsRl7Pv7+vxkBab7pZv5+ZlL/UnU/f3SJCVe+Fx39naA9/75XSMh0/3SSkia+pil/KRj7Pr662JPkrbP7OLQ0JFOijI1MwAAAAFiS0dEorDd34wAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IDx2lsiuJAAACLElEQVRIx2NgGAXkAUYmZhZWPICFmYkRVQcbOwenmzse4MbFzc6DpIGXj8PD04sA8PbhF+CFaxEU8iWkAQT8hEVgOkTF/InR4eUVICYO1SIhCRMLDAoKDvFDVhUaEhwUFAjjSUlDdMiEhcOEItzdI6OiYxA6YqODIt3dI2DcuDBZsBY5eVTr4xMSYcyk5BRUOXkFsBZFJTQnp6alQxgZmVloUkrKYC0qqmji2WE5EEZuWB6alKoKdi35YQUQRkFYPpFaCouKIYzi6EDitJSUlsGY5RWVRGjJLyxNy4ZxqtIqqvOxaVELQwZFZdkIJVU1RSiSalAt6rUwUBdWG1CP6pT6gNqwOrgCdQyHNYR5YQFhDXj8MiK1IAeyN6aORiyBjByVTc0FqBoKWpqwRCVSgilOaY2OaUPw29qjOzqLvTAchpos47u6EZyYnngUSRwpuTe6D+6qaFQdOPNLRzOM1dzhRZyW+CZouHk3dWLXglFcFIflQhj9YWjJGlZcaKAVSvjyPrRQ0oQVKDAQHlYFYUwIm4gqExGmBSkutaVQJeomwViTJqPK6OhCy2Q9sQBk8cY0DxjTJw0lAQWK6cOKfgNhpKK7ZMpUeF3jPa28BCETamiEqJKM+X1gxvWXpoUjVIVPnwErw71nmpgiqiQGBjNzbgs3j1nus+fMndc+Cwm0T52/oNR9lsdCS24ra7Tq1cbWjpXV3sHRCb1idXZ0sGdltXNxRateRwHRAACYHutzk/2I5QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMi0xM1QwODoxNToyOSswMDowMEUnN7UAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDItMTNUMDg6MTU6MjkrMDA6MDA0eo8JAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAyLTEzVDA4OjE1OjI5KzAwOjAwY2+u1gAAAABJRU5ErkJggg=="
                                />
                            </svg>

                            {/* Sensor de pago sin contacto (Contactless NFC) */}
                            <svg
                                version="1.1"
                                className="contactless"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                width="20px"
                                height="20px"
                                viewBox="0 0 50 50"
                                xmlSpace="preserve"
                                aria-label="Símbolo Contactless"
                            >
                                <image
                                    id="image0"
                                    width="50"
                                    height="50"
                                    x="0"
                                    y="0"
                                    href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IEzgIwaKTAAADDklEQVRYw+1XS0iUURQ+f5qPyjQflGRFEEFK76koKGxRbWyVVLSOgsCgwjZBJJYuKogSIoOonUK4q3U0WVBWFPZYiIE6kuArG3VGzK/FfPeMM/MLt99/NuHdfPd888/57jn3nvsQWWj/VcMlvMMd5KRTogqx9iCdIjUUmcGR9ImUYowyP3xNGQJoRLVaZ2DaZf8kyjEJALhI28ELioyiwC+Rc3QZwRYyO/DH51hQgWm6DMIh10KmD4u9O16K49itVoPOAmcGAWWOepXIRScAoJZ2Frro8oN+EyTT6lWkkg6msZfMSR35QTJmjU0g15tIGSJ08ZZMJkHkHpNZgSkyXosS13TkJpZ62mPIJvOSzC1bp8vRhhCakEk7G9/o4gmZdbpsTcKu0m63FbnBP9Qrc15zbkbemfgNDtEOI8NO5L5O9VYyRYgmJayZ9nPaxZrSjW4+F6Uw9yQqIiIZwhp2huQTf6OIvCZyGM6gDJBZbyXifJXr7FZjGXsdxADxI7HUJFB6iWvsIhFpkoiIiGTJfjJfiCuJg2ZEspq9EHGVpYgzKqwJqSAOEwuJQ/pxPvE3cYltJCLdxBLiSKKIE5HxJKcTRNeadxfhDiuYw44zVs1dxKwRk/uCxIiQkxKBsSctRVAge9g1E15EHE6yRUaJecRxcWlukdRIbGFOSZCMWQA/iWauIP3slREHXPyliqBcrrD71AmzZ+rD1Mt2Yr8TZc/UR4/YtFnbijnHi3UrN9vKQ9rPaJf867ZiaqDB+czeKYmd3pNa6fuI75MiC0uXXSR5aEMf7s7a6r/PudVXkjFb/SsrCRfROk0Fx6+H1i9kkTGn/E1vEmt1m089fh+RKdQ5O+xNJPUicUIjO0Dm7HwvErEr0YxeibL1StSh37STafE4I7zcBdRq1DiOkdmlTJVnkQTBTS7X1FYyvfO4piaInKbDCDaT2anLudYXCRFsQBgAcIF2/Okwgvz5+Z4tsw118dzruvIvjhTB+HOuWy8UvovEH6beitBKxDyxm9MmISKCWrzB7bSlaqGlsf0FC0gMjzTg6GgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDItMTNUMDg6MTk6NTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTEzVDA4OjE5OjU2KzAwOjAw0ssWdwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xM1QwODoxOTo1NiswMDowMIXeN6gAAAAASUVORK5CYII="
                                />
                            </svg>

                            {/* Número principal en relieve monetario */}
                            <p className="number">{config.number}</p>

                            {/* Fecha de expiración y etiqueta */}
                            <p className="valid_thru">{config.validThru}</p>
                            <p className="date_8264">{config.date}</p>

                            {/* Nombre del titular */}
                            <p className="name">{config.name}</p>
                        </div>

                        {/* ================= CARA POSTERIOR (REVERSO) ================= */}
                        <div className="flip-card-back">
                            {/* Banda magnética continua */}
                            <div className="strip" />

                            {/* Panel blanco para firma de seguridad */}
                            <div className="mstrip">
                                <span className="signature-label">D&amp;D Textil Medellín • {reference}</span>
                            </div>

                            {/* Cuadro de código de seguridad (CVV) */}
                            <div className="sstrip">
                                <p className="code">{cvv ? cvv : '***'}</p>
                            </div>

                            {/* Pie del reverso con sello de cifrado */}
                            <div className="back-footer-info">
                                <span className="flex items-center gap-1 font-semibold text-white/90">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    Cifrado TLS 1.3 • PCI-DSS
                                </span>
                                <span>Soporte: 302 705 8951</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de control interactivo debajo de la tarjeta */}
            <div className="mt-3 flex items-center justify-between w-full max-w-[320px] px-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Diseño Uiverse 3D adaptativo
                </span>
                <button
                    type="button"
                    onClick={() => setManualFlip((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-bold hover:underline cursor-pointer"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{volteada ? 'Ver frente' : 'Girar reverso'}</span>
                </button>
            </div>

            {/* Estilos CSS oficiales de Uiverse.io adaptados a la tarjeta */}
            <style dangerouslySetInnerHTML={{ __html: `
                .flip-card {
                    background-color: transparent;
                    width: 290px;
                    height: 186px;
                    perspective: 1000px;
                    color: white;
                    cursor: pointer;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                @media (min-width: 640px) {
                    .flip-card {
                        width: 320px;
                        height: 205px;
                    }
                }

                .heading_8264 {
                    position: absolute;
                    letter-spacing: .18em;
                    font-size: 0.58em;
                    font-weight: 800;
                    top: 1.8em;
                    right: 2.2em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.9);
                    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                }

                .logo {
                    position: absolute;
                    bottom: 1.1em;
                    right: 1.5em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chip {
                    position: absolute;
                    top: 2.2em;
                    left: 1.6em;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                }

                .contactless {
                    position: absolute;
                    top: 2.6em;
                    left: 4.2em;
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
                }

                .number {
                    position: absolute;
                    font-weight: bold;
                    font-size: .64em;
                    top: 8.4em;
                    left: 1.6em;
                    letter-spacing: 0.16em;
                    font-family: 'Courier New', Courier, monospace;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                    white-space: nowrap;
                }

                .valid_thru {
                    position: absolute;
                    font-weight: 700;
                    font-size: 0.36em;
                    top: 19em;
                    left: 4.5em;
                    letter-spacing: 0.1em;
                    color: rgba(255, 255, 255, 0.65);
                    text-transform: uppercase;
                }

                .date_8264 {
                    position: absolute;
                    font-weight: bold;
                    font-size: 0.54em;
                    top: 13.6em;
                    left: 3.0em;
                    letter-spacing: 0.14em;
                    font-family: 'Courier New', Courier, monospace;
                    color: #ff9800;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                }

                .name {
                    position: absolute;
                    font-weight: bold;
                    font-size: 0.54em;
                    top: 16.2em;
                    left: 2em;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.95);
                    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                    max-width: 13em;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .strip {
                    position: absolute;
                    width: 100%;
                    height: 1.8em;
                    top: 1.8em;
                    left: 0;
                    background: repeating-linear-gradient(
                        45deg,
                        #303030,
                        #303030 10px,
                        #202020 10px,
                        #202020 20px
                    );
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
                }

                .mstrip {
                    position: absolute;
                    background-color: rgb(255, 255, 255);
                    width: 9em;
                    height: 1.15em;
                    top: 5em;
                    left: 1.2em;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    padding: 0 0.5em;
                    overflow: hidden;
                }

                .signature-label {
                    font-size: 0.38em;
                    color: #475569;
                    font-style: italic;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .sstrip {
                    position: absolute;
                    background-color: rgb(255, 255, 255);
                    width: 4.2em;
                    height: 1.15em;
                    top: 5em;
                    left: 10.8em;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .code {
                    font-weight: bold;
                    text-align: center;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 0.65em;
                    letter-spacing: 0.15em;
                    margin: 0;
                    color: black;
                }

                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-style: preserve-3d;
                }

                .flip-card:hover .flip-card-inner,
                .flip-card.is-flipped .flip-card-inner {
                    transform: rotateY(180deg);
                }

                .flip-card-front, .flip-card-back {
                    box-shadow: 0 8px 14px 0 rgba(0,0,0,0.2);
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 1rem;
                    overflow: hidden;
                }

                .flip-card-front {
                    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset;
                    background-color: #171717;
                }

                .flip-card-back {
                    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset;
                    background-color: #171717;
                    transform: rotateY(180deg);
                }

                .back-footer-info {
                    position: absolute;
                    bottom: 0.8em;
                    left: 1.2em;
                    right: 1.2em;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.42em;
                    color: rgba(255, 255, 255, 0.7);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 0.4em;
                }
            ` }} />
        </div>
    );
}

export default CardPreview;
