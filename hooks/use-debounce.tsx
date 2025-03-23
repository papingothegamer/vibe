import { useCallback, useRef } from 'react'

export function useDebounce<T extends (...args: any[]) => Promise<void>>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  return useCallback(
    async (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      return new Promise<void>((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          await callback(...args)
          resolve()
        }, delay)
      })
    },
    [callback, delay]
  )
}