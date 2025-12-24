import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-orange-50 via-yellow-50 to-pink-50">
      <Navbar />

      {/* Main content sections will go here */}
      <main className="pt-32">
        {/* Add spacing for navbar */}
      </main>
    </div>
  );
}
