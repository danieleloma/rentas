import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 self-center">
          <span className="text-base font-bold tracking-tight text-foreground">Rentas</span>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
        </Link>

        {/* Form card */}
        <Card className="animate-scale-in shadow-md">
          <CardContent className="p-6 sm:p-8">
            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Rentas Ltd. All rights reserved.
        </p>

      </div>
    </div>
  );
}
