import { problemHeadline, problemCopy } from "@/content/problem";

export function Problem() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 py-16 sm:py-24 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">The problem</span>
          <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-pale">{problemHeadline}</h2>
        </div>
        <div className="flex flex-col gap-5 text-xl text-mist">
          {problemCopy.map((p, i) => (
            <p key={i} className="m-0">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
