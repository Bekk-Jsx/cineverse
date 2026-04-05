import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-sans font-bold text-primary-500">
          Cineverse 🎬
        </h1>
        <p className="mt-4 text-neutral-100">Tailwind theme is working!</p>
        <div className="mt-6 flex gap-4 justify-center">
          <Button variant="default">Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;