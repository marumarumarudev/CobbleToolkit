import ResourceItem from "./ResourceItem";

export default function ResourceSection({ title, categories, items }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {categories ? (
        categories.map((cat) => (
          <div key={cat.label} className="mb-4">
            <h3 className="text-lg text-gray-300">{cat.label}</h3>
            <ul className="list-disc list-inside">
              {cat.items.map((item) => (
                <ResourceItem key={item.name} {...item} />
              ))}
            </ul>
          </div>
        ))
      ) : (
        <ul className="list-disc list-inside">
          {items.map((item) => (
            <ResourceItem key={item.name} {...item} />
          ))}
        </ul>
      )}
    </section>
  );
}
