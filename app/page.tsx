const Home = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-sans font-bold text-primary-50">
          Cineverse 🎬
        </h1>
        <p className="mt-4 text-neutral-100">Tailwind theme is working!</p>
        <div className="mt-6 flex gap-4 justify-center">
          <span className="px-4 py-2 bg-success text-white rounded">Success</span>
          <span className="px-4 py-2 bg-error text-white rounded">Error</span>
          <span className="px-4 py-2 bg-warning text-white rounded">Warning</span>
        </div>
      </div>
    </div>
  );
};

export default Home;