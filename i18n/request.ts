import { getRequestConfig } from "next-intl/server";
import { routing } from "../lib/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as "en" | "fr" | "ar")) {
    locale = routing.defaultLocale;
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
