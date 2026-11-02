import { redirect } from "next/navigation";

export default function DocsRedirect() {
  redirect("https://github.com/bleu/barad-stellar-wallet/blob/master/docs/spec.md");
}
