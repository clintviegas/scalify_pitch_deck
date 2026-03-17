import { redirect } from "next/navigation";

// The middleware redirects "/" → "/en" automatically.
// This is a safety fallback in case middleware doesn't run.
export default function RootPage() {
  redirect("/en");
}
