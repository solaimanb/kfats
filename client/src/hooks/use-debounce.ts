import { useEffect, useState } from 'react'

/**
 * Custom hook for debouncing values
 * Follows React best practices for performance optimization
 * 
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
