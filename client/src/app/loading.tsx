import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-kc-dark">
      <div className="relative mb-8">
        <Image
          src="/images/kc-logo.png"
          alt="Kushtia Charukola"
          width={120}
          height={120}
          className="object-contain"
        />
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-kc-orange via-transparent to-kc-green opacity-30" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="h-2 w-48 animate-pulse rounded-full bg-gradient-to-r from-kc-orange to-kc-green" />
        <div className="text-lg font-medium text-kc-orange">
          Loading amazing things...
        </div>
      </div>
    </div>
  );
}
