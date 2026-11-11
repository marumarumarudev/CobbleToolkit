import { Card, CardBody, Badge } from "@/components/ui";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const label = (key) => key.replace(/[_-]+/g, " ").toLowerCase();
const display = (value) => typeof value === "string" ? value : JSON.stringify(value) ?? "Not specified";

export default function MountStats({ entry }) {
  const riding = entry.riding;
  const modes = isRecord(riding?.behaviours) ? Object.entries(riding.behaviours) : [];
  return (
    <Card className="sm:col-span-2">
      <CardBody className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-accent">Mount stats</h3>
          {Array.isArray(riding?.seats) && <Badge tone="neutral">{riding.seats.length} seats defined</Badge>}
        </div>
        {riding == null ? (
          <p className="text-sm leading-relaxed text-text-secondary">
            {entry.mountDataVersion !== 1
              ? "This saved result has no mount data. Upload the source archive again to refresh it."
              : "No riding configuration found. The base mod or another pack may still make this Pokémon rideable."}
          </p>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-text-secondary">Datapack values and ranges, not actual speeds in game. Missing stats do not mean zero.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {modes.map(([mode, behaviour]) => (
                <section key={mode} aria-label={`${mode} mount stats`} className="min-w-0 rounded-md border border-border bg-bg-surface-2 p-3">
                  <h4 className="font-mono text-xs font-semibold uppercase text-accent">{mode}</h4>
                  {behaviour?.key && <p className="mt-1 break-all font-mono text-xs text-text-secondary">{display(behaviour.key)}</p>}
                  {isRecord(behaviour?.stats) && Object.keys(behaviour.stats).length ? (
                    <dl className="mt-3 space-y-2">
                      {Object.entries(behaviour.stats).map(([stat, value]) => (
                        <div key={stat} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-border/60 pb-1 text-xs">
                          <dt className="capitalize text-text-secondary">{label(stat)}</dt>
                          <dd className="max-w-full break-all font-mono text-text-primary">{display(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : <p className="mt-3 text-sm leading-relaxed text-text-secondary">No stats specified for this mode.</p>}
                </section>
              ))}
            </div>
            {!modes.length && <p className="text-sm leading-relaxed text-text-secondary">No riding behaviours specified. Expand the configuration for other mount fields.</p>}
            <details className="min-w-0 text-xs">
              <summary className="cursor-pointer text-accent">Raw riding configuration</summary>
              <pre className="scroll-visible mt-2 max-h-72 overflow-auto rounded-md bg-bg-base p-3 text-xs text-text-secondary">{JSON.stringify(riding, null, 2)}</pre>
            </details>
          </>
        )}
        {entry.ridingSources?.length > 0 && (
          <details className="text-xs text-text-secondary">
            <summary className="cursor-pointer">Mount data sources</summary>
            <ul className="mt-2 space-y-1">
              {entry.ridingSources.map((source, index) => <li key={index} className="break-all font-mono text-xs">{source.sourceFile} · {source.path}</li>)}
            </ul>
            <p className="mt-2 text-sm leading-relaxed">Species additions override loaded base definitions. Server pack priority is not applied.</p>
          </details>
        )}
      </CardBody>
    </Card>
  );
}
