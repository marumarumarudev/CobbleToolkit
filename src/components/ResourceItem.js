export default function ResourceItem({ name, url, note }) {
  return (
    <li className="mb-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline hover:text-blue-300"
      >
        {name}
      </a>
      {note && <span className="text-gray-400 ml-2">— {note}</span>}
    </li>
  );
}
