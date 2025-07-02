export default function ResourceItem({ name, url, note }) {
  return (
    <div className="bg-[#2c2c2c] p-4 rounded-lg shadow hover:shadow-lg transition border border-[#3a3a3a]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 font-semibold text-lg hover:underline block"
      >
        {name}
      </a>
      {note && <p className="text-sm text-gray-400 mt-1">— {note}</p>}
    </div>
  );
}
