import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useDarkMode() {
    const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        const syncTheme = (event) => {
            if (event.type === 'dark-mode-change') {
                setDarkMode(Boolean(event.detail));
            } else if (event.type === 'storage' && event.key === 'darkMode' && event.newValue !== null) {
                try {
                    setDarkMode(JSON.parse(event.newValue));
                } catch {
                    // Ignorar valores malformados
                }
            }
        };
        window.addEventListener('dark-mode-change', syncTheme);
        window.addEventListener('storage', syncTheme);
        return () => {
            window.removeEventListener('dark-mode-change', syncTheme);
            window.removeEventListener('storage', syncTheme);
        };
    }, [setDarkMode]);

    const toggleDarkMode = () => {
        const nextMode = !darkMode;
        setDarkMode(nextMode);
        window.dispatchEvent(new CustomEvent('dark-mode-change', { detail: nextMode }));
    };

    return [darkMode, toggleDarkMode];
}
