export default function GuidesLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-10 sm:px-6 sm:py-12 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-6">Guides</h1>
        <p className="text-gray-300 mb-8">
          Player-written tips and knowledge for popular Cobblemon modpacks. Not
          official; focused on practical info missing from wikis.
        </p>
        {children}
      </div>
    </div>
  );
}
