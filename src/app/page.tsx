import { Chat } from "@/components/chat";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl h-[calc(100vh-2rem)]">
        <Chat />
      </div>
    </div>
  );
}
