import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

// Fabric particle data for the animated background - Faster movement
const fabricParticles = [
    { size: 'w-64 h-64', gradient: 'from-orange-300/30 to-orange-500/30', top: '5%', left: '10%', duration: 10, delay: 0 },
    { size: 'w-48 h-48', gradient: 'from-orange-200/25 to-amber-400/25', top: '60%', right: '5%', duration: 12, delay: 1 },
    { size: 'w-56 h-56', gradient: 'from-amber-300/25 to-orange-400/25', bottom: '10%', left: '20%', duration: 14, delay: 2 },
    { size: 'w-40 h-40', gradient: 'from-yellow-300/20 to-orange-400/20', top: '30%', left: '60%', duration: 11, delay: 3 },
    { size: 'w-52 h-52', gradient: 'from-orange-400/25 to-red-400/25', top: '70%', left: '40%', duration: 13, delay: 4 },
    { size: 'w-44 h-44', gradient: 'from-amber-200/20 to-orange-300/20', top: '15%', right: '20%', duration: 16, delay: 1.5 },
];

// Animated floating background component with mouse interaction
const FabricBackground = ({ mousePos }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Warm gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900"></div>

            {/* Grid texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            {/* Mouse-reactive glow that follows cursor - Faster response */}
            <motion.div
                className="absolute w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full blur-3xl"
                animate={{
                    x: mousePos.x - 192,
                    y: mousePos.y - 192,
                }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
            />

            {/* Animated floating particles that react to mouse */}
            {fabricParticles.map((particle, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${particle.size} bg-gradient-to-br ${particle.gradient} rounded-full blur-3xl`}
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -60, 40, 0],
                        rotate: [0, 180, 360],
                        scale: [1, 1.2, 0.8, 1],

                    }}
                    whileHover={{ scale: 1.5 }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: particle.delay,
                        type: 'spring',
                        stiffness: 150,
                        damping: 15,
                        mass: 0.5,
                    }}
                    style={{
                        top: particle.top,
                        left: particle.left,
                        right: particle.right,
                        bottom: particle.bottom,
                        transition: {
                            duration: particle.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: particle.delay,
                            type: 'spring',
                            stiffness: 150,
                            damping: 15,
                            mass: 0.5,
                            transition: {
                                duration: particle.duration,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: particle.delay,
                                type: 'spring',
                                stiffness: 150,
                                damping: 15,
                                mass: 0.5,
                            },
                        },
                    }}
                />
            ))}
        </div>
    );
};

// Staggered entry animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,

        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

const slideFromLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    // Mouse parallax effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
    const cardX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
    const cardY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

    // Track raw mouse position for background glow
    const [bgMousePos, setBgMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            mouseX.set((clientX / innerWidth) - 0.5);
            mouseY.set((clientY / innerHeight) - 0.5);
            setBgMousePos({ x: clientX, y: clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            // Redirigir según el rol del usuario autenticado
            const user = JSON.parse(localStorage.getItem('authUser'));
            const roleRedirects = {
                admin: '/admin',
                seller: '/vendedor',
                client: '/cliente',
            };
            const destination = roleRedirects[user?.role] || from;
            navigate(destination, { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated fabric background */}
                <FabricBackground mousePos={bgMousePos} />

                {/* Card with parallax */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ x: cardX, y: cardY }}
                    className="relative z-10 max-w-md w-full"
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    whileFocus={{ scale: 1.02 }}
                    whileBlur={{ scale: 1.02 }}
                >
                    {/* Card hover glow wrapper */}
                    <motion.div
                        whileHover={{ y: -4, scale: 1.02 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative group"
                    >
                        {/* Orange glow effect on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/0 via-orange-400/0 to-amber-500/0 group-hover:from-orange-500/30 group-hover:via-orange-400/30 group-hover:to-amber-500/30 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

                        {/* Glassmorphism card */}
                        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {/* Title */}
                                <motion.div variants={itemVariants} className="text-center mb-8">
                                    <h1 className="text-3xl font-display font-bold mb-2">
                                        Bienvenido
                                    </h1>
                                    <motion.p
                                        variants={itemVariants}
                                        className="text-gray-600 dark:text-gray-400"
                                    >
                                        Ingresa a tu cuenta para continuar
                                    </motion.p>
                                </motion.div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Email input */}
                                    <motion.div variants={slideFromLeft}>
                                        <label className="block font-semibold mb-2">Correo Electrónico</label>
                                        <div className="relative group/input">
                                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover/input:text-orange-500 transition-colors duration-300 z-10" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input-field-premium pl-10"
                                                placeholder="ejemplo@correo.com"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Password input */}
                                    <motion.div variants={slideFromLeft}>
                                        <label className="block font-semibold mb-2">Contraseña</label>
                                        <div className="relative group/input">
                                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover/input:text-orange-500 transition-colors duration-300 z-10" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="input-field-premium pl-10"
                                                placeholder="******"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Premium gradient button */}
                                    <motion.div variants={itemVariants}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                                        >
                                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                            {!isLoading && (
                                                <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                                            )}
                                        </motion.button>
                                    </motion.div>
                                </form>

                                {/* Register link */}
                                <motion.div
                                    variants={itemVariants}
                                    className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center"
                                >
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        ¿No tienes una cuenta?
                                    </p>
                                    <Link to="/registro" className="text-primary-600 font-bold hover:underline">
                                        Crear Cuenta Nueva
                                    </Link>
                                </motion.div>

                                {/* Demo credentials */}
                                <motion.div
                                    variants={itemVariants}
                                    className="mt-8 p-4 bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl text-xs space-y-2 border border-gray-200/50 dark:border-slate-700/50"
                                >
                                    <p className="font-bold text-gray-500 uppercase tracking-wider">Credenciales Demo:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setEmail('admin@ddtextil.com'); setPassword('admin123') }}
                                            className="p-2.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-600 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                                        >
                                            Admin
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setEmail('vendedor@ddtextil.com'); setPassword('vendedor123') }}
                                            className="p-2.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-600 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                                        >
                                            Vendedor
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setEmail('cliente@ddtextil.com'); setPassword('cliente123') }}
                                            className="col-span-2 p-2.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-600 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                                        >
                                            Cliente
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}

export default Login;
