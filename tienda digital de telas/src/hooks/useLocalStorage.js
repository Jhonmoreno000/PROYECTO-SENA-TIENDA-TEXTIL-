import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) return initialValue;
            const parsed = JSON.parse(item);
            return parsed !== null ? parsed : initialValue;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                if (valueToStore !== undefined) {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}
