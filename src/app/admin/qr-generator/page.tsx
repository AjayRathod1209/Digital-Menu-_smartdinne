'use client';

import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import QRGeneratorContent from './QRGeneratorContent';

export default function QRGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading QR generator...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <QRGeneratorContent />
    </Suspense>
  );
}