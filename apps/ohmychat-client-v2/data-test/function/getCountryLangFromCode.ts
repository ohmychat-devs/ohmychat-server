export function getCountryLangFromCode(locale: string) {
    const lastDashIndex = locale.lastIndexOf('-');
    const lang = lastDashIndex !== -1 ? locale.slice(0, lastDashIndex) : locale;
    const country = lastDashIndex !== -1 ? locale.slice(lastDashIndex + 1) : "";
    return { country, lang };
}
