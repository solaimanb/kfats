import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">KFATS</h1>
      <div className="w-60 flex flex-col items-center mt-4 gap-4">
        <Link href="/login" className="w-full">
          <Button className="w-full">login</Button>
        </Link>

        <Link href="/signup" className="w-full">
          <Button className="w-full" variant="outline">register</Button>
        </Link>
      </div>
    </div>
  );
}
