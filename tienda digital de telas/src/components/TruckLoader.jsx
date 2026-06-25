import React from 'react';

/**
 * Cloud Loader
 * Migrated from Uiverse.io by andrew-manzyk
 */
function TruckLoader({ text = 'Cargando...', className = '' }) {
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,500&display=swap');
        
        .cloud-loader-wrapper {
            --cloud-color: #4387f4;
            --arrows-color: #80b1ff;
            --time-animation: 1s;
        }

        .cloud-loader-wrapper .loader {
            transform: scale(1);
        }

        .cloud-loader-wrapper #cloud {
            width: 100px;
            height: 100px;
        }

        .cloud-loader-wrapper #cloud rect {
            fill: var(--cloud-color);
        }

        .cloud-loader-wrapper #cloud g:nth-child(3) {
            transform-origin: 50% 72.8938%;
            fill: var(--arrows-color);
            filter: drop-shadow(0 0 8px black);
            animation: cloud-rotation var(--time-animation) linear infinite;
        }

        .cloud-loader-wrapper #shapes g g circle {
            animation: cloud-anim calc(var(--time-animation) * 2) linear infinite;
        }

        .cloud-loader-wrapper #shapes g g circle:nth-child(2) {
            animation-delay: calc((var(--time-animation) * 2) / -3);
        }

        .cloud-loader-wrapper #shapes g g circle:nth-child(3) {
            animation-delay: calc((var(--time-animation) * 2) / -1.5);
        }

        .cloud-loader-wrapper svg #lines g line {
            stroke-width: 5;
            transform-origin: 50% 50%;
            rotate: -65deg;
            animation: cloud-lines calc(var(--time-animation) / 1.33) linear infinite;
        }

        @keyframes cloud-rotation {
            0% {
                transform: rotate(0deg);
            }
            50% {
                transform: rotate(180deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        @keyframes cloud-lines {
            0% {
                transform: translateY(-10px);
            }
            100% {
                transform: translateY(8px);
            }
        }

        @keyframes cloud-anim {
            0% {
                cx: 20;
                cy: 60;
                r: 15;
            }
            50% {
                cx: 50;
                cy: 45;
                r: 20;
            }
            100% {
                cx: 80;
                cy: 60;
                r: 15;
            }
        }
    `;

    return (
        <div 
            className={`flex flex-col items-center justify-center min-h-[200px] gap-6 cloud-loader-wrapper ${className}`}
            role="status"
            aria-label="Cargando"
        >
            <style>{css}</style>
            
            <div className="loader">
                <svg id="cloud" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <defs>
                        <filter id="roundness">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5"></feGaussianBlur>
                            <feColorMatrix
                                values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10"
                            ></feColorMatrix>
                        </filter>
                        <mask id="shapes">
                            <g fill="white">
                                <polygon points="50 37.5 80 75 20 75 50 37.5"></polygon>
                                <circle cx="20" cy="60" r="15"></circle>
                                <circle cx="80" cy="60" r="15"></circle>
                                <g>
                                    <circle cx="20" cy="60" r="15"></circle>
                                    <circle cx="20" cy="60" r="15"></circle>
                                    <circle cx="20" cy="60" r="15"></circle>
                                </g>
                            </g>
                        </mask>
                        <mask id="clipping" clipPathUnits="userSpaceOnUse">
                            <g id="lines" filter="url(#roundness)">
                                <g mask="url(#shapes)" stroke="white">
                                    <line x1="-50" y1="-40" x2="150" y2="-40"></line>
                                    <line x1="-50" y1="-31" x2="150" y2="-31"></line>
                                    <line x1="-50" y1="-22" x2="150" y2="-22"></line>
                                    <line x1="-50" y1="-13" x2="150" y2="-13"></line>
                                    <line x1="-50" y1="-4" x2="150" y2="-4"></line>
                                    <line x1="-50" y1="5" x2="150" y2="5"></line>
                                    <line x1="-50" y1="14" x2="150" y2="14"></line>
                                    <line x1="-50" y1="23" x2="150" y2="23"></line>
                                    <line x1="-50" y1="32" x2="150" y2="32"></line>
                                    <line x1="-50" y1="41" x2="150" y2="41"></line>
                                    <line x1="-50" y1="50" x2="150" y2="50"></line>
                                    <line x1="-50" y1="59" x2="150" y2="59"></line>
                                    <line x1="-50" y1="68" x2="150" y2="68"></line>
                                    <line x1="-50" y1="77" x2="150" y2="77"></line>
                                    <line x1="-50" y1="86" x2="150" y2="86"></line>
                                    <line x1="-50" y1="95" x2="150" y2="95"></line>
                                    <line x1="-50" y1="104" x2="150" y2="104"></line>
                                    <line x1="-50" y1="113" x2="150" y2="113"></line>
                                    <line x1="-50" y1="122" x2="150" y2="122"></line>
                                    <line x1="-50" y1="131" x2="150" y2="131"></line>
                                    <line x1="-50" y1="140" x2="150" y2="140"></line>
                                </g>
                            </g>
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        rx="0"
                        ry="0"
                        mask="url(#clipping)"
                    ></rect>
                    <g>
                        <path
                            d="M33.52,68.12 C35.02,62.8 39.03,58.52 44.24,56.69 C49.26,54.93 54.68,55.61 59.04,58.4 C59.04,58.4 56.24,60.53 56.24,60.53 C55.45,61.13 55.68,62.37 56.63,62.64 C56.63,62.64 67.21,65.66 67.21,65.66 C67.98,65.88 68.75,65.3 68.74,64.5 C68.74,64.5 68.68,53.5 68.68,53.5 C68.67,52.51 67.54,51.95 66.75,52.55 C66.75,52.55 64.04,54.61 64.04,54.61 C57.88,49.79 49.73,48.4 42.25,51.03 C35.2,53.51 29.78,59.29 27.74,66.49 C27.29,68.08 28.22,69.74 29.81,70.19 C30.09,70.27 30.36,70.31 30.63,70.31 C31.94,70.31 33.14,69.44 33.52,68.12Z"
                        ></path>
                        <path
                            d="M69.95,74.85 C68.35,74.4 66.7,75.32 66.25,76.92 C64.74,82.24 60.73,86.51 55.52,88.35 C50.51,90.11 45.09,89.43 40.73,86.63 C40.73,86.63 43.53,84.51 43.53,84.51 C44.31,83.91 44.08,82.67 43.13,82.4 C43.13,82.4 32.55,79.38 32.55,79.38 C31.78,79.16 31.02,79.74 31.02,80.54 C31.02,80.54 31.09,91.54 31.09,91.54 C31.09,92.53 32.22,93.09 33.01,92.49 C33.01,92.49 35.72,90.43 35.72,90.43 C39.81,93.63 44.77,95.32 49.84,95.32 C52.41,95.32 55,94.89 57.51,94.01 C64.56,91.53 69.99,85.75 72.02,78.55 C72.47,76.95 71.54,75.3 69.95,74.85Z"
                        ></path>
                    </g>
                </svg>
            </div>

            {/* Typography */}
            {text && (
                <div 
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-lg text-gray-800 dark:text-gray-200 tracking-wide italic font-medium"
                >
                    {text}
                </div>
            )}
            
            <span className="sr-only">Cargando contenido...</span>
        </div>
    );
}

export default TruckLoader;
