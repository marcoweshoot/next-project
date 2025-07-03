import { ThemeProvider } from "@/components/providers/theme-provider";
import './globals.css';
import { ToastProvider } from "@/components/ui/toast-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ApolloClientProvider from "@/components/providers/apollo-provider-client"; // nuovo import

export const metadata = {
  title: 'vite_react_shadcn_ts',
  description: 'Next.js App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ApolloClientProvider>
          <ToastProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </ToastProvider>
        </ApolloClientProvider>
              </ThemeProvider>
      </body>
    </html>
  );
}
