export function Footer() {
  return (
    <footer className="border-t-[3px] border-line">
      <div className="mx-auto max-w-[1120px] px-6 py-10">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist">
          <a
            href="https://github.com/bleu/baradd-roles/blob/master/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="hover:text-pale"
          >
            MIT License
          </a>
          <a
            href="https://github.com/bleu/baradd-roles"
            target="_blank"
            rel="noreferrer"
            className="hover:text-pale"
          >
            GitHub
          </a>
          <a
            href="https://github.com/bleu/baradd-roles/blob/master/docs/spec.md"
            target="_blank"
            rel="noreferrer"
            className="hover:text-pale"
          >
            Specification
          </a>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-mist">
          Baradd is experimental open-source software, currently an early prototype that runs on
          demo data. It is not financial advice and has not been audited. Baradd is an independent
          project built on Stellar and on OpenZeppelin&apos;s <code>stellar-accounts</code>; it is
          not endorsed by the Stellar Development Foundation or OpenZeppelin. Its name is inspired
          by the Sindarin word barad; this project is not affiliated with the Tolkien Estate.
        </p>
      </div>
    </footer>
  );
}
