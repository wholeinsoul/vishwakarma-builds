import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-center px-4">
      <div>
        <span className="text-6xl">🎈</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-600">
          Looks like this balloon floated away! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button className="mt-6 bg-party-pink hover:bg-pink-600">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
