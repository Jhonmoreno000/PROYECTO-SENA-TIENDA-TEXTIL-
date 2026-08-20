/**
 * ReviewsSection.jsx — Sección de Reseñas del Producto
 * ======================================================
 * Muestra las reseñas que los clientes registrados han dejado sobre un
 * producto, con calificación de estrellas y comentario.
 *
 * ¿Qué hace?
 *  - Resumen: promedio de estrellas, total de reseñas y barras de distribución
 *  - Carrusel horizontal minimalista de comentarios navegable con GSAP
 *    (flechas animadas + barra de progreso de scroll)
 *  - Formulario de reseña para usuarios registrados (selector de estrellas + comentario)
 *
 * Datos:
 *  - GET  /api/reviews?productId=N  → lista de reseñas del producto
 *  - POST /api/reviews              → publicar una nueva reseña
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Star, Quote, ChevronLeft, ChevronRight, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getApiUrl } from '../config';
import { formatDate } from '../utils/formatters';

gsap.registerPlugin(useGSAP);

/**
 * StarRating — Selector/visualizador de estrellas
 * Si onChange está presente, permite elegir la calificación (hover incluido).
 */
function StarRating({ value, onChange, size = 'w-5 h-5', readonly = false }) {
    const [hover, setHover] = useState(0);
    const active = onChange ? (hover || value) : value;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly || !onChange}
                    onClick={() => onChange && onChange(star)}
                    onMouseEnter={() => onChange && setHover(star)}
                    onMouseLeave={() => onChange && setHover(0)}
                    className={`${onChange ? 'cursor-pointer active:scale-90 transition-transform' : 'cursor-default'}`}
                    aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                >
                    <Star
                        className={`${size} transition-colors ${
                            star <= active
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                : 'text-slate-300 dark:text-slate-600'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ReviewsSection({ productId }) {
    const { user, isAuthenticated } = useAuth();
    const { showNotification } = useNotification();

    // ── Estado ──────────────────────────────────────────────────────────────
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0); // 0..1 del scroll del carrusel

    const sectionRef = useRef(null);
    const scrollRef = useRef(null);

    // ── Carga de reseñas desde la API ───────────────────────────────────────
    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(getApiUrl(`/api/reviews?productId=${productId}`));
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error('Error cargando reseñas:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // ── Resumen calculado (promedio + distribución) ────────────────────────
    const summary = useMemo(() => {
        const count = reviews.length;
        const avg = count ? reviews.reduce((acc, r) => acc + r.rating, 0) / count : 0;
        const distribution = [5, 4, 3, 2, 1].map((stars) => ({
            stars,
            count: reviews.filter((r) => r.rating === stars).length,
        }));
        return { count, avg, distribution };
    }, [reviews]);

    // ── Animación de entrada de la sección ─────────────────────────────────
    useGSAP(() => {
        if (sectionRef.current) {
            gsap.fromTo(
                sectionRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
            );
        }
    }, { scope: sectionRef });

    // ── Navegación del carrusel con GSAP (scroll suave) ────────────────────
    const scrollByCard = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const card = el.querySelector('.review-card');
        const amount = direction * (card ? card.offsetWidth + 24 : 360);
        gsap.to(el, {
            scrollLeft: Math.max(0, Math.min(el.scrollLeft + amount, el.scrollWidth - el.clientWidth)),
            duration: 0.6,
            ease: 'power3.out',
        });
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setProgress(max > 0 ? el.scrollLeft / max : 0);
    };

    // ── Publicación de una nueva reseña ────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !user) return;
        if (rating < 1) {
            showNotification('error', 'Selecciona una calificación de 1 a 5 estrellas');
            return;
        }
        if (!comment.trim()) {
            showNotification('error', 'Escribe un comentario sobre la tela');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(getApiUrl('/api/reviews'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: Number(productId),
                    userId: user.id,
                    rating,
                    comment: comment.trim(),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                showNotification('success', '¡Tu reseña fue publicada!');
                setComment('');
                setRating(0);
                await fetchReviews();
            } else {
                showNotification('error', data.error || 'No se pudo publicar la reseña');
            }
        } catch (err) {
            console.error('Error al publicar reseña:', err);
            showNotification('error', 'Error al conectar con el servidor');
        } finally {
            setSubmitting(false);
        }
    };

    const canScroll = reviews.length > 1;

    return (
        <section ref={sectionRef} className="mt-16" id="resenas">
            {/* ── Encabezado de la sección ─────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
                        <MessageSquare className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                        Reseñas de Clientes
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Opiniones de quienes ya compraron esta tela
                    </p>
                </div>

                {/* Resumen: promedio + distribución */}
                {!loading && summary.count > 0 && (
                    <div className="flex items-center gap-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl px-5 py-4">
                        <div className="text-center">
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {summary.avg.toFixed(1).replace('.', ',')}
                            </div>
                            <StarRating value={Math.round(summary.avg)} readonly size="w-4 h-4" />
                            <div className="text-xs text-gray-400 mt-1">{summary.count} reseña{summary.count > 1 ? 's' : ''}</div>
                        </div>
                        <div className="space-y-1">
                            {summary.distribution.map((d) => (
                                <div key={d.stars} className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 w-3">{d.stars}</span>
                                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                            style={{ width: `${summary.count ? (d.count / summary.count) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Estado de carga ───────────────────────────────────────────── */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6 space-y-3 animate-pulse">
                            <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                            <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full" />
                            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mt-4" />
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                /* ── Estado vacío ─────────────────────────────────────────── */
                <div className="card p-10 text-center">
                    <Quote className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-1">Aún no hay reseñas</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Sé el primero en opinar sobre esta tela.
                    </p>
                </div>
            ) : (
                /* ── Carrusel horizontal con navegación GSAP ──────────────── */
                <div className="relative">
                    {canScroll && (
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => scrollByCard(-1)}
                                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:border-primary-300 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                                    aria-label="Anterior reseña"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByCard(1)}
                                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:border-primary-300 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                                    aria-label="Siguiente reseña"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Desliza para ver más
                            </span>
                        </div>
                    )}

                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
                    >
                        {reviews.map((review) => (
                            <article
                                key={review.id}
                                className="review-card snap-start shrink-0 w-[300px] sm:w-[340px] card p-6 flex flex-col gap-4"
                            >
                                <div className="flex items-center justify-between">
                                    <StarRating value={review.rating} readonly />
                                    <Quote className="w-6 h-6 text-primary-200 dark:text-primary-800" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                                    "{review.comment}"
                                </p>
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-sm font-black flex items-center justify-center">
                                        {(review.userName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{review.userName}</div>
                                        <div className="text-xs text-gray-400">
                                            {review.createdAt ? formatDate(review.createdAt) : ''}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Barra de progreso del scroll */}
                    {canScroll && (
                        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-150"
                                style={{ width: `${Math.max(8, progress * 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ── Formulario de reseña ─────────────────────────────────────── */}
            <div className="mt-8 card p-6 sm:p-8">
                {isAuthenticated && user ? (
                    <form onSubmit={handleSubmit}>
                        <h3 className="font-bold text-lg mb-1">Escribe tu reseña</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                            Cuéntanos qué te pareció la tela: calidad, suavidad, color...
                        </p>

                        <div className="mb-4">
                            <div className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                                Tu calificación
                            </div>
                            <StarRating value={rating} onChange={setRating} size="w-7 h-7" />
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="3"
                            placeholder="Ej: Excelente calidad, el color es fiel a las fotos y el envío fue rápido..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all resize-none"
                        />

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-4 inline-flex items-center gap-2 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            {submitting ? 'Publicando...' : 'Publicar reseña'}
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div>
                            <h3 className="font-bold text-lg mb-1">¿Compraste esta tela?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Inicia sesión para dejar tu reseña y ayudar a otros clientes.
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 btn-secondary shrink-0"
                        >
                            <MessageSquare className="w-4 h-4" /> Iniciar sesión
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}