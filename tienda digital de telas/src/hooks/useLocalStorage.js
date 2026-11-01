import { useState, useCallback, useRef } from 'react';

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

    const storedValueRef = useRef(storedValue);
    storedValueRef.current = storedValue;

    const setValue = useCallback((value) => {
        try {
            const nextValue = value instanceof Function ? value(storedValueRef.current) : value;
            storedValueRef.current = nextValue;
            if (nextValue !== undefined) {
                window.localStorage.setItem(key, JSON.stringify(nextValue));
            }
            setStoredValue(nextValue);
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}
