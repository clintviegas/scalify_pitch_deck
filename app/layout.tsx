// Root layout — required by Next.js.
// The [locale] segment provides its own <html>/<body> with lang + dir.
// This root layout only wraps non-locale routes (e.g. /dashboard, /api).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
