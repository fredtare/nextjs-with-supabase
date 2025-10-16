import RegisterClient from './RegisterClient';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-600">Loading...</p></div>}>
      <div className="container mx-auto p-6 max-w-3xl">
        <RegisterClient />
      </div>
    </Suspense>
  );
}