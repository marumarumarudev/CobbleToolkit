import ResourceItem from "./ResourceItem";

export default function ResourceSection({
  title,
  categories,
  items,
  search,
  categoryKey,
}) {
  const matchesSearch = (item) => {
    const text = `${item.name} ${item.note || ""} ${
      item.author || ""
    }`.toLowerCase();
    return text.includes(search.toLowerCase());
  };

  const currentCategory = categoryKey;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {categories ? (
        categories.map((cat) => {
          const filteredItems = cat.items.filter(matchesSearch);
          if (filteredItems.length === 0) return null;

          return (
            <div key={cat.label} className="mb-6">
              <h3 className="text-blue-300 font-semibold text-sm mb-3">
                {cat.label}
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <ResourceItem
                    key={item.name}
                    {...item}
                    category={currentCategory}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {items.filter(matchesSearch).map((item) => (
            <ResourceItem
              key={item.name}
              {...item}
              category={currentCategory}
            />
          ))}
        </div>
      )}
    </section>
  );
}
