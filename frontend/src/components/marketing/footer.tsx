export function Footer() {
  return (
    <footer className="on-ink border-t-[3px]" style={{ borderColor: "#3a3835" }}>
      <div className="mx-auto max-w-[1240px] px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#c9c6be]">
          <span className="flex items-center gap-3.5">
            <span className="font-display text-xl leading-none text-surface">Baradd</span>
            Early prototype on Stellar testnet
          </span>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-1 font-bold">
            <a
              href="https://github.com/bleu/baradd-roles/blob/master/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-surface"
            >
              MIT License
            </a>
            <a
              href="https://github.com/bleu/baradd-roles"
              target="_blank"
              rel="noreferrer"
              className="hover:text-surface"
            >
              GitHub
            </a>
            <a
              href="https://github.com/bleu/baradd-roles/blob/master/docs/spec.md"
              target="_blank"
              rel="noreferrer"
              className="hover:text-surface"
            >
              Specification
            </a>
          </nav>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[#8a867d]">
          Baradd is experimental open-source software, currently an early prototype that runs on demo data. It is
          not financial advice and has not been audited. Baradd is an independent project built on Stellar and on
          OpenZeppelin&apos;s <code className="text-[#c9c6be]">stellar-accounts</code>; it is not endorsed by the
          Stellar Development Foundation or OpenZeppelin. Its name is inspired by the Sindarin word barad; this
          project is not affiliated with the Tolkien Estate.
        </p>
      </div>
    </footer>
  );
}
