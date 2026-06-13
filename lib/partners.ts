import type { Lang } from "@/lib/i18n";

export interface Country {
  code: string;
  nameEn: string;
  nameFr: string;
  namePt: string;
  flag: string;
}

export interface Partner {
  id: string;
  name: string;
  organization: string;
  countryCode: string;
  email: string;
}

export function getCountryName(c: Country, lang: Lang): string {
  if (lang === "EN") return c.nameEn;
  if (lang === "PT") return c.namePt;
  return c.nameFr;
}

export const COUNTRIES: Country[] = [
  // ── Afrique (54) ──────────────────────────────────────────────────────────
  { code: "DZ", nameEn: "Algeria",                        nameFr: "Algérie",                       namePt: "Argélia",                       flag: "🇩🇿" },
  { code: "AO", nameEn: "Angola",                         nameFr: "Angola",                         namePt: "Angola",                         flag: "🇦🇴" },
  { code: "BJ", nameEn: "Benin",                          nameFr: "Bénin",                          namePt: "Benim",                          flag: "🇧🇯" },
  { code: "BW", nameEn: "Botswana",                       nameFr: "Botswana",                       namePt: "Botsuana",                       flag: "🇧🇼" },
  { code: "BF", nameEn: "Burkina Faso",                   nameFr: "Burkina Faso",                   namePt: "Burkina Faso",                   flag: "🇧🇫" },
  { code: "BI", nameEn: "Burundi",                        nameFr: "Burundi",                        namePt: "Burundi",                        flag: "🇧🇮" },
  { code: "CV", nameEn: "Cabo Verde",                     nameFr: "Cabo Verde",                     namePt: "Cabo Verde",                     flag: "🇨🇻" },
  { code: "CM", nameEn: "Cameroon",                       nameFr: "Cameroun",                       namePt: "Camarões",                       flag: "🇨🇲" },
  { code: "CF", nameEn: "Central African Republic",       nameFr: "Centrafrique",                   namePt: "República Centro-Africana",      flag: "🇨🇫" },
  { code: "TD", nameEn: "Chad",                           nameFr: "Tchad",                          namePt: "Chade",                          flag: "🇹🇩" },
  { code: "KM", nameEn: "Comoros",                        nameFr: "Comores",                        namePt: "Comores",                        flag: "🇰🇲" },
  { code: "CG", nameEn: "Congo (Brazzaville)",            nameFr: "Congo (Brazzaville)",            namePt: "Congo (Brazzaville)",            flag: "🇨🇬" },
  { code: "CD", nameEn: "Congo (Kinshasa)",               nameFr: "Congo (Kinshasa)",               namePt: "Congo (Quinxassa)",              flag: "🇨🇩" },
  { code: "DJ", nameEn: "Djibouti",                       nameFr: "Djibouti",                       namePt: "Djibuti",                        flag: "🇩🇯" },
  { code: "EG", nameEn: "Egypt",                          nameFr: "Égypte",                         namePt: "Egito",                          flag: "🇪🇬" },
  { code: "GQ", nameEn: "Equatorial Guinea",              nameFr: "Guinée Équatoriale",             namePt: "Guiné Equatorial",               flag: "🇬🇶" },
  { code: "ER", nameEn: "Eritrea",                        nameFr: "Érythrée",                       namePt: "Eritreia",                       flag: "🇪🇷" },
  { code: "SZ", nameEn: "Eswatini",                       nameFr: "Eswatini",                       namePt: "Essuatíni",                      flag: "🇸🇿" },
  { code: "ET", nameEn: "Ethiopia",                       nameFr: "Éthiopie",                       namePt: "Etiópia",                        flag: "🇪🇹" },
  { code: "GA", nameEn: "Gabon",                          nameFr: "Gabon",                          namePt: "Gabão",                          flag: "🇬🇦" },
  { code: "GM", nameEn: "Gambia",                         nameFr: "Gambie",                         namePt: "Gâmbia",                         flag: "🇬🇲" },
  { code: "GH", nameEn: "Ghana",                          nameFr: "Ghana",                          namePt: "Gana",                           flag: "🇬🇭" },
  { code: "GN", nameEn: "Guinea",                         nameFr: "Guinée",                         namePt: "Guiné",                          flag: "🇬🇳" },
  { code: "GW", nameEn: "Guinea-Bissau",                  nameFr: "Guinée-Bissau",                  namePt: "Guiné-Bissau",                   flag: "🇬🇼" },
  { code: "CI", nameEn: "Ivory Coast",                    nameFr: "Côte d'Ivoire",                  namePt: "Costa do Marfim",                flag: "🇨🇮" },
  { code: "KE", nameEn: "Kenya",                          nameFr: "Kenya",                          namePt: "Quénia",                         flag: "🇰🇪" },
  { code: "LS", nameEn: "Lesotho",                        nameFr: "Lesotho",                        namePt: "Lesoto",                         flag: "🇱🇸" },
  { code: "LR", nameEn: "Liberia",                        nameFr: "Libéria",                        namePt: "Libéria",                        flag: "🇱🇷" },
  { code: "LY", nameEn: "Libya",                          nameFr: "Libye",                          namePt: "Líbia",                          flag: "🇱🇾" },
  { code: "MG", nameEn: "Madagascar",                     nameFr: "Madagascar",                     namePt: "Madagáscar",                     flag: "🇲🇬" },
  { code: "MW", nameEn: "Malawi",                         nameFr: "Malawi",                         namePt: "Maláui",                         flag: "🇲🇼" },
  { code: "ML", nameEn: "Mali",                           nameFr: "Mali",                           namePt: "Mali",                           flag: "🇲🇱" },
  { code: "MR", nameEn: "Mauritania",                     nameFr: "Mauritanie",                     namePt: "Mauritânia",                     flag: "🇲🇷" },
  { code: "MU", nameEn: "Mauritius",                      nameFr: "Maurice",                        namePt: "Maurícia",                       flag: "🇲🇺" },
  { code: "MA", nameEn: "Morocco",                        nameFr: "Maroc",                          namePt: "Marrocos",                       flag: "🇲🇦" },
  { code: "MZ", nameEn: "Mozambique",                     nameFr: "Mozambique",                     namePt: "Moçambique",                     flag: "🇲🇿" },
  { code: "NA", nameEn: "Namibia",                        nameFr: "Namibie",                        namePt: "Namíbia",                        flag: "🇳🇦" },
  { code: "NE", nameEn: "Niger",                          nameFr: "Niger",                          namePt: "Níger",                          flag: "🇳🇪" },
  { code: "NG", nameEn: "Nigeria",                        nameFr: "Nigéria",                        namePt: "Nigéria",                        flag: "🇳🇬" },
  { code: "RW", nameEn: "Rwanda",                         nameFr: "Rwanda",                         namePt: "Ruanda",                         flag: "🇷🇼" },
  { code: "ST", nameEn: "São Tomé and Príncipe",          nameFr: "Sao Tomé-et-Príncipe",           namePt: "São Tomé e Príncipe",            flag: "🇸🇹" },
  { code: "SN", nameEn: "Senegal",                        nameFr: "Sénégal",                        namePt: "Senegal",                        flag: "🇸🇳" },
  { code: "SC", nameEn: "Seychelles",                     nameFr: "Seychelles",                     namePt: "Seicheles",                      flag: "🇸🇨" },
  { code: "SL", nameEn: "Sierra Leone",                   nameFr: "Sierra Leone",                   namePt: "Serra Leoa",                     flag: "🇸🇱" },
  { code: "SO", nameEn: "Somalia",                        nameFr: "Somalie",                        namePt: "Somália",                        flag: "🇸🇴" },
  { code: "ZA", nameEn: "South Africa",                   nameFr: "Afrique du Sud",                 namePt: "África do Sul",                  flag: "🇿🇦" },
  { code: "SS", nameEn: "South Sudan",                    nameFr: "Soudan du Sud",                  namePt: "Sudão do Sul",                   flag: "🇸🇸" },
  { code: "SD", nameEn: "Sudan",                          nameFr: "Soudan",                         namePt: "Sudão",                          flag: "🇸🇩" },
  { code: "TZ", nameEn: "Tanzania",                       nameFr: "Tanzanie",                       namePt: "Tanzânia",                       flag: "🇹🇿" },
  { code: "TG", nameEn: "Togo",                           nameFr: "Togo",                           namePt: "Togo",                           flag: "🇹🇬" },
  { code: "TN", nameEn: "Tunisia",                        nameFr: "Tunisie",                        namePt: "Tunísia",                        flag: "🇹🇳" },
  { code: "UG", nameEn: "Uganda",                         nameFr: "Ouganda",                        namePt: "Uganda",                         flag: "🇺🇬" },
  { code: "ZM", nameEn: "Zambia",                         nameFr: "Zambie",                         namePt: "Zâmbia",                         flag: "🇿🇲" },
  { code: "ZW", nameEn: "Zimbabwe",                       nameFr: "Zimbabwe",                       namePt: "Zimbábue",                       flag: "🇿🇼" },
];

// Partenaires officiels AFCAC EXPO 2026 — mettre à jour les emails avec les vrais contacts
export const PARTNERS: Partner[] = [
  { id: "ASECNA",       name: "Directeur Général",   organization: "ASECNA",            countryCode: "SN", email: "asecna@asecna.org" },
  { id: "ANAC_TG",      name: "Direction Générale",  organization: "ANAC Togo",         countryCode: "TG", email: "anacto@cafe.tg" },
  { id: "AU",           name: "Chairperson",         organization: "African Union",      countryCode: "ET", email: "au@africa-union.org" },
  { id: "AFCFTA",       name: "Secretary-General",   organization: "AfCFTA",            countryCode: "GH", email: "info@afcfta.au.int" },
  { id: "AFREXIMBANK",  name: "President",           organization: "AFREXIMBANK",       countryCode: "EG", email: "info@afreximbank.com" },
  { id: "AFDB",         name: "President",           organization: "AfDB",              countryCode: "CI", email: "afdb@afdb.org" },
  { id: "ET_AIRLINES",  name: "CEO",                 organization: "Ethiopian Airlines", countryCode: "ET", email: "commercial@ethiopianairlines.com" },
  { id: "SALT",         name: "Direction",           organization: "SALT",              countryCode: "TG", email: "info@salt.tg" },
  { id: "UNECA",        name: "Executive Secretary", organization: "UNECA",             countryCode: "ET", email: "uneca@un.org" },
  { id: "ACSA",         name: "CEO",                 organization: "ACSA",              countryCode: "ZA", email: "info@acsa.co.za" },
  { id: "WIETC",        name: "Direction",           organization: "WIETC",             countryCode: "SN", email: "info@wietc.aero" },
  { id: "AEROTRANSPORT",name: "Direction",           organization: "AEROTRANSPORT",     countryCode: "AO", email: "info@aerotransport.ao" },
  { id: "ASAIGE_PAL",   name: "Direction",           organization: "ASAIGE-PAL",        countryCode: "SN", email: "info@asaige-pal.com" },
  { id: "HOTEL2FEV",    name: "Direction",           organization: "Hôtel 2 Février",   countryCode: "TG", email: "reservations@hotel2fevrier.tg" },
  { id: "ASKY",         name: "CEO",                 organization: "ASKY Airlines",     countryCode: "TG", email: "commercial@flyasky.com" },
  { id: "ST_HANDLING",  name: "Direction",           organization: "ST HANDLING",       countryCode: "TG", email: "info@st-handling.aero" },
  { id: "ATNS",         name: "CEO",                 organization: "ATNS",              countryCode: "ZA", email: "info@atns.co.za" },
  { id: "AEROVAULT",    name: "CEO",                 organization: "Aerovault",         countryCode: "ZA", email: "info@aerovault.co.za" },
];

export function getPartnersForCountry(countryCode: string): Partner[] {
  return PARTNERS.filter(p => p.countryCode === countryCode);
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}
