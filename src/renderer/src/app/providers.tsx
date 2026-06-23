import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: false }
  }
})

export function AppProviders({ children }: { children: ReactNode }): JSX.Element {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
