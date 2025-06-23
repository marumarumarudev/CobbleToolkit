import UploadArea from "@/components/UploadArea";
import { Toaster } from "react-hot-toast";

<Toaster position="top-right" reverseOrder={false} />;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <UploadArea />
    </main>
  );
}
