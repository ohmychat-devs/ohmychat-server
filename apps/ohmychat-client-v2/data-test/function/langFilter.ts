import { getCountryLangFromCode } from "./getCountryLangFromCode";

export function langFilter(userLangs: { lang: string, weight: number }[] = []) {
    if (userLangs?.length === 0) {
      const { country, lang } = getCountryLangFromCode(Intl.DateTimeFormat().resolvedOptions().locale);
      return {
        $or: [
          { lang: { $regex: `^${lang}`, $options: 'i' } },
          { lang: { $regex: `${country}$`, $options: 'i' } }
        ]
      };
    }
  
    // Sinon on construit dynamiquement selon les préférences pondérées
    const orLangFilters = userLangs.map(({ lang }) => ({
      lang: { $regex: `^${lang}`, $options: 'i' }
    }));
  
    return { $or: orLangFilters };
}