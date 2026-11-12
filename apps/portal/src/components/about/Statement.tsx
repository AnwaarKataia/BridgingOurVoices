/** A single large statement (vision or mission) on its own page. */
export function Statement({ text }: { text: string }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-site">
        <blockquote className="m-0 max-w-[920px] border-s-4 border-gold ps-6 md:ps-10">
          <p className="m-0 font-display text-statement text-ink">{text}</p>
        </blockquote>
      </div>
    </section>
  );
}
