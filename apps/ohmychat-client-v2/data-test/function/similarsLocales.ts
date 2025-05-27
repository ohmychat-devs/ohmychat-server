import langs from "../langs";
import { getCountryLangFromCode } from "./getCountryLangFromCode";

export type ScoredLocale = {
    locale: string;
    score: number;
};

export const similarsLocales = async function (locale: string): Promise<ScoredLocale[]> {
    const locales = langs;
    const { country, lang } = getCountryLangFromCode(locale);

    let bordersAlpha2: string[] = [];

    try {
        // 1. Obtenir les frontières (alpha-3)
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${country}?fields=borders`);
        const data = await res.json();
        const bordersAlpha3: string[] = data?.borders ?? [];

        if (bordersAlpha3.length > 0) {
            // 2. Obtenir les équivalents alpha-2 en une seule requête
            const borderRes = await fetch(`https://restcountries.com/v3.1/alpha?codes=${bordersAlpha3.join(',')}&fields=cca2`);
            const borderData = await borderRes.json();
            bordersAlpha2 = borderData.map((country: any) => country.cca2);
        }
    } catch (error) {
        console.warn(`Impossible de récupérer les frontières alpha-2 pour ${country}`, error);
    }

    const scored: ScoredLocale[] = [];

    locales.forEach(loc => {
        const dashIndex = loc.lastIndexOf('-');
        const locLang = dashIndex !== -1 ? loc.slice(0, dashIndex) : loc;
        const locCountry = dashIndex !== -1 ? loc.slice(dashIndex + 1) : "";

        let score = 0.1;

        if (loc === locale) {
            score = 1.0;
        } else if (locLang === lang && locCountry !== country) {
            score = 0.8;
        } else if (locCountry === country && locLang !== lang) {
            score = 0.6;
        } else if (locLang.split('-')[0] === lang.split('-')[0]) {
            score = 0.4;
        }

        if (bordersAlpha2.includes(locCountry)) {
            score += 0.05;
            if (score > 1) score = 1.0;
        }

        scored.push({ locale: loc, score });
    });

    return scored.sort((a, b) => b.score - a.score);
};