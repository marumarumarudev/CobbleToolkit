export default function ResourceItem({ name, url, note, author }) {
  return (
    <div className="bg-[#2c2c2c] p-4 rounded-lg shadow hover:shadow-lg transition border border-[#3a3a3a]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 font-semibold text-lg hover:underline block mb-1"
      >
        {name}
      </a>
      {author && <p className="text-gray-400 text-sm mb-1">by {author}</p>}
      {note && <p className="text-gray-500 text-sm">{note}</p>}
    </div>
  );
}
