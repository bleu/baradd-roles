import { redirect } from "next/navigation";

export default function DocsRedirect() {
  redirect("https://github.com/bleu/baradd-roles/blob/master/docs/spec.md");
}
