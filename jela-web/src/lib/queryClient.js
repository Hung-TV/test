import { QueryClient } from '@tanstack/react-query';

// Khởi tạo bên ngoài component để cache không bị tạo lại sau mỗi lần render.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
