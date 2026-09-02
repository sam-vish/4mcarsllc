import { steps } from "@/lib/config";

export default function HowItWorks() {
  return (
    <section id="how" className="hatch py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="steel-rule w-24" />
        <h2 className="mt-5 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
          Find it tonight, drive it tomorrow
        </h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-lg border border-white/10 bg-tarmac p-6">
              <span className="tag text-5xl text-brand">{i + 1}</span>
              <h3 className="mt-3 font-display text-2xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
