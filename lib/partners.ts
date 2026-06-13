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
  // ── Europe (44) ──────────────────────────────────────────────────────────
  { code: "AL", nameEn: "Albania",                        nameFr: "Albanie",                        namePt: "Albânia",                        flag: "🇦🇱" },
  { code: "AD", nameEn: "Andorra",                        nameFr: "Andorre",                        namePt: "Andorra",                        flag: "🇦🇩" },
  { code: "AT", nameEn: "Austria",                        nameFr: "Autriche",                       namePt: "Áustria",                        flag: "🇦🇹" },
  { code: "BY", nameEn: "Belarus",                        nameFr: "Biélorussie",                    namePt: "Bielorrússia",                   flag: "🇧🇾" },
  { code: "BE", nameEn: "Belgium",                        nameFr: "Belgique",                       namePt: "Bélgica",                        flag: "🇧🇪" },
  { code: "BA", nameEn: "Bosnia and Herzegovina",         nameFr: "Bosnie-Herzégovine",             namePt: "Bósnia e Herzegovina",           flag: "🇧🇦" },
  { code: "BG", nameEn: "Bulgaria",                       nameFr: "Bulgarie",                       namePt: "Bulgária",                       flag: "🇧🇬" },
  { code: "HR", nameEn: "Croatia",                        nameFr: "Croatie",                        namePt: "Croácia",                        flag: "🇭🇷" },
  { code: "CY", nameEn: "Cyprus",                         nameFr: "Chypre",                         namePt: "Chipre",                         flag: "🇨🇾" },
  { code: "CZ", nameEn: "Czech Republic",                 nameFr: "République tchèque",             namePt: "República Checa",                flag: "🇨🇿" },
  { code: "DK", nameEn: "Denmark",                        nameFr: "Danemark",                       namePt: "Dinamarca",                      flag: "🇩🇰" },
  { code: "EE", nameEn: "Estonia",                        nameFr: "Estonie",                        namePt: "Estónia",                        flag: "🇪🇪" },
  { code: "FI", nameEn: "Finland",                        nameFr: "Finlande",                       namePt: "Finlândia",                      flag: "🇫🇮" },
  { code: "FR", nameEn: "France",                         nameFr: "France",                         namePt: "França",                         flag: "🇫🇷" },
  { code: "DE", nameEn: "Germany",                        nameFr: "Allemagne",                      namePt: "Alemanha",                       flag: "🇩🇪" },
  { code: "GR", nameEn: "Greece",                         nameFr: "Grèce",                          namePt: "Grécia",                         flag: "🇬🇷" },
  { code: "HU", nameEn: "Hungary",                        nameFr: "Hongrie",                        namePt: "Hungria",                        flag: "🇭🇺" },
  { code: "IS", nameEn: "Iceland",                        nameFr: "Islande",                        namePt: "Islândia",                       flag: "🇮🇸" },
  { code: "IE", nameEn: "Ireland",                        nameFr: "Irlande",                        namePt: "Irlanda",                        flag: "🇮🇪" },
  { code: "IT", nameEn: "Italy",                          nameFr: "Italie",                         namePt: "Itália",                         flag: "🇮🇹" },
  { code: "LV", nameEn: "Latvia",                         nameFr: "Lettonie",                       namePt: "Letónia",                        flag: "🇱🇻" },
  { code: "LI", nameEn: "Liechtenstein",                  nameFr: "Liechtenstein",                  namePt: "Liechtenstein",                  flag: "🇱🇮" },
  { code: "LT", nameEn: "Lithuania",                      nameFr: "Lituanie",                       namePt: "Lituânia",                       flag: "🇱🇹" },
  { code: "LU", nameEn: "Luxembourg",                     nameFr: "Luxembourg",                     namePt: "Luxemburgo",                     flag: "🇱🇺" },
  { code: "MT", nameEn: "Malta",                          nameFr: "Malte",                          namePt: "Malta",                          flag: "🇲🇹" },
  { code: "MD", nameEn: "Moldova",                        nameFr: "Moldavie",                       namePt: "Moldávia",                       flag: "🇲🇩" },
  { code: "MC", nameEn: "Monaco",                         nameFr: "Monaco",                         namePt: "Mónaco",                         flag: "🇲🇨" },
  { code: "ME", nameEn: "Montenegro",                     nameFr: "Monténégro",                     namePt: "Montenegro",                     flag: "🇲🇪" },
  { code: "NL", nameEn: "Netherlands",                    nameFr: "Pays-Bas",                       namePt: "Países Baixos",                  flag: "🇳🇱" },
  { code: "MK", nameEn: "North Macedonia",                nameFr: "Macédoine du Nord",              namePt: "Macedónia do Norte",             flag: "🇲🇰" },
  { code: "NO", nameEn: "Norway",                         nameFr: "Norvège",                        namePt: "Noruega",                        flag: "🇳🇴" },
  { code: "PL", nameEn: "Poland",                         nameFr: "Pologne",                        namePt: "Polónia",                        flag: "🇵🇱" },
  { code: "PT", nameEn: "Portugal",                       nameFr: "Portugal",                       namePt: "Portugal",                       flag: "🇵🇹" },
  { code: "RO", nameEn: "Romania",                        nameFr: "Roumanie",                       namePt: "Roménia",                        flag: "🇷🇴" },
  { code: "RU", nameEn: "Russia",                         nameFr: "Russie",                         namePt: "Rússia",                         flag: "🇷🇺" },
  { code: "SM", nameEn: "San Marino",                     nameFr: "Saint-Marin",                    namePt: "São Marinho",                    flag: "🇸🇲" },
  { code: "RS", nameEn: "Serbia",                         nameFr: "Serbie",                         namePt: "Sérvia",                         flag: "🇷🇸" },
  { code: "SK", nameEn: "Slovakia",                       nameFr: "Slovaquie",                      namePt: "Eslováquia",                     flag: "🇸🇰" },
  { code: "SI", nameEn: "Slovenia",                       nameFr: "Slovénie",                       namePt: "Eslovénia",                      flag: "🇸🇮" },
  { code: "ES", nameEn: "Spain",                          nameFr: "Espagne",                        namePt: "Espanha",                        flag: "🇪🇸" },
  { code: "SE", nameEn: "Sweden",                         nameFr: "Suède",                          namePt: "Suécia",                         flag: "🇸🇪" },
  { code: "CH", nameEn: "Switzerland",                    nameFr: "Suisse",                         namePt: "Suíça",                          flag: "🇨🇭" },
  { code: "UA", nameEn: "Ukraine",                        nameFr: "Ukraine",                        namePt: "Ucrânia",                        flag: "🇺🇦" },
  { code: "GB", nameEn: "United Kingdom",                 nameFr: "Royaume-Uni",                    namePt: "Reino Unido",                    flag: "🇬🇧" },
  // ── Amériques (35) ──────────────────────────────────────────────────────
  { code: "AG", nameEn: "Antigua and Barbuda",            nameFr: "Antigua-et-Barbuda",             namePt: "Antígua e Barbuda",              flag: "🇦🇬" },
  { code: "AR", nameEn: "Argentina",                      nameFr: "Argentine",                      namePt: "Argentina",                      flag: "🇦🇷" },
  { code: "BS", nameEn: "Bahamas",                        nameFr: "Bahamas",                        namePt: "Bahamas",                        flag: "🇧🇸" },
  { code: "BB", nameEn: "Barbados",                       nameFr: "Barbade",                        namePt: "Barbados",                       flag: "🇧🇧" },
  { code: "BZ", nameEn: "Belize",                         nameFr: "Belize",                         namePt: "Belize",                         flag: "🇧🇿" },
  { code: "BO", nameEn: "Bolivia",                        nameFr: "Bolivie",                        namePt: "Bolívia",                        flag: "🇧🇴" },
  { code: "BR", nameEn: "Brazil",                         nameFr: "Brésil",                         namePt: "Brasil",                         flag: "🇧🇷" },
  { code: "CA", nameEn: "Canada",                         nameFr: "Canada",                         namePt: "Canadá",                         flag: "🇨🇦" },
  { code: "CL", nameEn: "Chile",                          nameFr: "Chili",                          namePt: "Chile",                          flag: "🇨🇱" },
  { code: "CO", nameEn: "Colombia",                       nameFr: "Colombie",                       namePt: "Colômbia",                       flag: "🇨🇴" },
  { code: "CR", nameEn: "Costa Rica",                     nameFr: "Costa Rica",                     namePt: "Costa Rica",                     flag: "🇨🇷" },
  { code: "CU", nameEn: "Cuba",                           nameFr: "Cuba",                           namePt: "Cuba",                           flag: "🇨🇺" },
  { code: "DM", nameEn: "Dominica",                       nameFr: "Dominique",                      namePt: "Dominica",                       flag: "🇩🇲" },
  { code: "DO", nameEn: "Dominican Republic",             nameFr: "République dominicaine",         namePt: "República Dominicana",           flag: "🇩🇴" },
  { code: "EC", nameEn: "Ecuador",                        nameFr: "Équateur",                       namePt: "Equador",                        flag: "🇪🇨" },
  { code: "SV", nameEn: "El Salvador",                    nameFr: "Salvador",                       namePt: "El Salvador",                    flag: "🇸🇻" },
  { code: "GD", nameEn: "Grenada",                        nameFr: "Grenade",                        namePt: "Granada",                        flag: "🇬🇩" },
  { code: "GT", nameEn: "Guatemala",                      nameFr: "Guatemala",                      namePt: "Guatemala",                      flag: "🇬🇹" },
  { code: "GY", nameEn: "Guyana",                         nameFr: "Guyana",                         namePt: "Guiana",                         flag: "🇬🇾" },
  { code: "HT", nameEn: "Haiti",                          nameFr: "Haïti",                          namePt: "Haiti",                          flag: "🇭🇹" },
  { code: "HN", nameEn: "Honduras",                       nameFr: "Honduras",                       namePt: "Honduras",                       flag: "🇭🇳" },
  { code: "JM", nameEn: "Jamaica",                        nameFr: "Jamaïque",                       namePt: "Jamaica",                        flag: "🇯🇲" },
  { code: "MX", nameEn: "Mexico",                         nameFr: "Mexique",                        namePt: "México",                         flag: "🇲🇽" },
  { code: "NI", nameEn: "Nicaragua",                      nameFr: "Nicaragua",                      namePt: "Nicarágua",                      flag: "🇳🇮" },
  { code: "PA", nameEn: "Panama",                         nameFr: "Panama",                         namePt: "Panamá",                         flag: "🇵🇦" },
  { code: "PY", nameEn: "Paraguay",                       nameFr: "Paraguay",                       namePt: "Paraguai",                       flag: "🇵🇾" },
  { code: "PE", nameEn: "Peru",                           nameFr: "Pérou",                          namePt: "Peru",                           flag: "🇵🇪" },
  { code: "KN", nameEn: "Saint Kitts and Nevis",          nameFr: "Saint-Kitts-et-Nevis",           namePt: "São Cristóvão e Nevis",          flag: "🇰🇳" },
  { code: "LC", nameEn: "Saint Lucia",                    nameFr: "Sainte-Lucie",                   namePt: "Santa Lúcia",                    flag: "🇱🇨" },
  { code: "VC", nameEn: "Saint Vincent and the Grenadines",nameFr:"Saint-Vincent-et-les-Grenadines",namePt: "São Vicente e Granadinas",       flag: "🇻🇨" },
  { code: "SR", nameEn: "Suriname",                       nameFr: "Suriname",                       namePt: "Suriname",                       flag: "🇸🇷" },
  { code: "TT", nameEn: "Trinidad and Tobago",            nameFr: "Trinité-et-Tobago",              namePt: "Trindade e Tobago",              flag: "🇹🇹" },
  { code: "US", nameEn: "United States",                  nameFr: "États-Unis",                     namePt: "Estados Unidos",                 flag: "🇺🇸" },
  { code: "UY", nameEn: "Uruguay",                        nameFr: "Uruguay",                        namePt: "Uruguai",                        flag: "🇺🇾" },
  { code: "VE", nameEn: "Venezuela",                      nameFr: "Venezuela",                      namePt: "Venezuela",                      flag: "🇻🇪" },
  // ── Asie (47) ────────────────────────────────────────────────────────────
  { code: "AF", nameEn: "Afghanistan",                    nameFr: "Afghanistan",                    namePt: "Afeganistão",                    flag: "🇦🇫" },
  { code: "AM", nameEn: "Armenia",                        nameFr: "Arménie",                        namePt: "Arménia",                        flag: "🇦🇲" },
  { code: "AZ", nameEn: "Azerbaijan",                     nameFr: "Azerbaïdjan",                    namePt: "Azerbaijão",                     flag: "🇦🇿" },
  { code: "BH", nameEn: "Bahrain",                        nameFr: "Bahreïn",                        namePt: "Bahrein",                        flag: "🇧🇭" },
  { code: "BD", nameEn: "Bangladesh",                     nameFr: "Bangladesh",                     namePt: "Bangladeche",                    flag: "🇧🇩" },
  { code: "BT", nameEn: "Bhutan",                         nameFr: "Bhoutan",                        namePt: "Butão",                          flag: "🇧🇹" },
  { code: "BN", nameEn: "Brunei",                         nameFr: "Brunéi",                         namePt: "Brunei",                         flag: "🇧🇳" },
  { code: "KH", nameEn: "Cambodia",                       nameFr: "Cambodge",                       namePt: "Camboja",                        flag: "🇰🇭" },
  { code: "CN", nameEn: "China",                          nameFr: "Chine",                          namePt: "China",                          flag: "🇨🇳" },
  { code: "GE", nameEn: "Georgia",                        nameFr: "Géorgie",                        namePt: "Geórgia",                        flag: "🇬🇪" },
  { code: "IN", nameEn: "India",                          nameFr: "Inde",                           namePt: "Índia",                          flag: "🇮🇳" },
  { code: "ID", nameEn: "Indonesia",                      nameFr: "Indonésie",                      namePt: "Indonésia",                      flag: "🇮🇩" },
  { code: "IR", nameEn: "Iran",                           nameFr: "Iran",                           namePt: "Irão",                           flag: "🇮🇷" },
  { code: "IQ", nameEn: "Iraq",                           nameFr: "Irak",                           namePt: "Iraque",                         flag: "🇮🇶" },
  { code: "IL", nameEn: "Israel",                         nameFr: "Israël",                         namePt: "Israel",                         flag: "🇮🇱" },
  { code: "JP", nameEn: "Japan",                          nameFr: "Japon",                          namePt: "Japão",                          flag: "🇯🇵" },
  { code: "JO", nameEn: "Jordan",                         nameFr: "Jordanie",                       namePt: "Jordânia",                       flag: "🇯🇴" },
  { code: "KZ", nameEn: "Kazakhstan",                     nameFr: "Kazakhstan",                     namePt: "Cazaquistão",                    flag: "🇰🇿" },
  { code: "KW", nameEn: "Kuwait",                         nameFr: "Koweït",                         namePt: "Kuwait",                         flag: "🇰🇼" },
  { code: "KG", nameEn: "Kyrgyzstan",                     nameFr: "Kirghizistan",                   namePt: "Quirguistão",                    flag: "🇰🇬" },
  { code: "LA", nameEn: "Laos",                           nameFr: "Laos",                           namePt: "Laos",                           flag: "🇱🇦" },
  { code: "LB", nameEn: "Lebanon",                        nameFr: "Liban",                          namePt: "Líbano",                         flag: "🇱🇧" },
  { code: "MY", nameEn: "Malaysia",                       nameFr: "Malaisie",                       namePt: "Malásia",                        flag: "🇲🇾" },
  { code: "MV", nameEn: "Maldives",                       nameFr: "Maldives",                       namePt: "Maldivas",                       flag: "🇲🇻" },
  { code: "MN", nameEn: "Mongolia",                       nameFr: "Mongolie",                       namePt: "Mongólia",                       flag: "🇲🇳" },
  { code: "MM", nameEn: "Myanmar",                        nameFr: "Myanmar",                        namePt: "Mianmar",                        flag: "🇲🇲" },
  { code: "NP", nameEn: "Nepal",                          nameFr: "Népal",                          namePt: "Nepal",                          flag: "🇳🇵" },
  { code: "KP", nameEn: "North Korea",                    nameFr: "Corée du Nord",                  namePt: "Coreia do Norte",                flag: "🇰🇵" },
  { code: "OM", nameEn: "Oman",                           nameFr: "Oman",                           namePt: "Omã",                            flag: "🇴🇲" },
  { code: "PK", nameEn: "Pakistan",                       nameFr: "Pakistan",                       namePt: "Paquistão",                      flag: "🇵🇰" },
  { code: "PS", nameEn: "Palestine",                      nameFr: "Palestine",                      namePt: "Palestina",                      flag: "🇵🇸" },
  { code: "PH", nameEn: "Philippines",                    nameFr: "Philippines",                    namePt: "Filipinas",                      flag: "🇵🇭" },
  { code: "QA", nameEn: "Qatar",                          nameFr: "Qatar",                          namePt: "Catar",                          flag: "🇶🇦" },
  { code: "SA", nameEn: "Saudi Arabia",                   nameFr: "Arabie Saoudite",                namePt: "Arábia Saudita",                 flag: "🇸🇦" },
  { code: "SG", nameEn: "Singapore",                      nameFr: "Singapour",                      namePt: "Singapura",                      flag: "🇸🇬" },
  { code: "KR", nameEn: "South Korea",                    nameFr: "Corée du Sud",                   namePt: "Coreia do Sul",                  flag: "🇰🇷" },
  { code: "LK", nameEn: "Sri Lanka",                      nameFr: "Sri Lanka",                      namePt: "Sri Lanka",                      flag: "🇱🇰" },
  { code: "SY", nameEn: "Syria",                          nameFr: "Syrie",                          namePt: "Síria",                          flag: "🇸🇾" },
  { code: "TJ", nameEn: "Tajikistan",                     nameFr: "Tadjikistan",                    namePt: "Tajiquistão",                    flag: "🇹🇯" },
  { code: "TH", nameEn: "Thailand",                       nameFr: "Thaïlande",                      namePt: "Tailândia",                      flag: "🇹🇭" },
  { code: "TL", nameEn: "Timor-Leste",                    nameFr: "Timor-Leste",                    namePt: "Timor-Leste",                    flag: "🇹🇱" },
  { code: "TR", nameEn: "Turkey",                         nameFr: "Turquie",                        namePt: "Turquia",                        flag: "🇹🇷" },
  { code: "TM", nameEn: "Turkmenistan",                   nameFr: "Turkménistan",                   namePt: "Turquemenistão",                 flag: "🇹🇲" },
  { code: "AE", nameEn: "United Arab Emirates",           nameFr: "Émirats arabes unis",            namePt: "Emirados Árabes Unidos",         flag: "🇦🇪" },
  { code: "UZ", nameEn: "Uzbekistan",                     nameFr: "Ouzbékistan",                    namePt: "Uzbequistão",                    flag: "🇺🇿" },
  { code: "VN", nameEn: "Vietnam",                        nameFr: "Viêt Nam",                       namePt: "Vietname",                       flag: "🇻🇳" },
  { code: "YE", nameEn: "Yemen",                          nameFr: "Yémen",                          namePt: "Iémen",                          flag: "🇾🇪" },
  // ── Océanie (14) ─────────────────────────────────────────────────────────
  { code: "AU", nameEn: "Australia",                      nameFr: "Australie",                      namePt: "Austrália",                      flag: "🇦🇺" },
  { code: "FJ", nameEn: "Fiji",                           nameFr: "Fidji",                          namePt: "Fiji",                           flag: "🇫🇯" },
  { code: "KI", nameEn: "Kiribati",                       nameFr: "Kiribati",                       namePt: "Quiribáti",                      flag: "🇰🇮" },
  { code: "MH", nameEn: "Marshall Islands",               nameFr: "Îles Marshall",                  namePt: "Ilhas Marshall",                 flag: "🇲🇭" },
  { code: "FM", nameEn: "Micronesia",                     nameFr: "Micronésie",                     namePt: "Micronésia",                     flag: "🇫🇲" },
  { code: "NR", nameEn: "Nauru",                          nameFr: "Nauru",                          namePt: "Nauru",                          flag: "🇳🇷" },
  { code: "NZ", nameEn: "New Zealand",                    nameFr: "Nouvelle-Zélande",               namePt: "Nova Zelândia",                  flag: "🇳🇿" },
  { code: "PW", nameEn: "Palau",                          nameFr: "Palaos",                         namePt: "Palau",                          flag: "🇵🇼" },
  { code: "PG", nameEn: "Papua New Guinea",               nameFr: "Papouasie-Nouvelle-Guinée",      namePt: "Papua-Nova Guiné",               flag: "🇵🇬" },
  { code: "WS", nameEn: "Samoa",                          nameFr: "Samoa",                          namePt: "Samoa",                          flag: "🇼🇸" },
  { code: "SB", nameEn: "Solomon Islands",                nameFr: "Îles Salomon",                   namePt: "Ilhas Salomão",                  flag: "🇸🇧" },
  { code: "TO", nameEn: "Tonga",                          nameFr: "Tonga",                          namePt: "Tonga",                          flag: "🇹🇴" },
  { code: "TV", nameEn: "Tuvalu",                         nameFr: "Tuvalu",                         namePt: "Tuvalu",                         flag: "🇹🇻" },
  { code: "VU", nameEn: "Vanuatu",                        nameFr: "Vanuatu",                        namePt: "Vanuatu",                        flag: "🇻🇺" },
  // ── Organisations internationales ────────────────────────────────────────
  { code: "INT", nameEn: "International Organization",   nameFr: "Organisation internationale",    namePt: "Organização Internacional",      flag: "🌐" },
];

// Partenaires — à compléter avec les vrais contacts et emails
export const PARTNERS: Partner[] = [
  // ── Sénégal
  { id: "SN_ANACIM",    name: "Direction Générale",           organization: "ANACIM",                                   countryCode: "SN",  email: "dgacim@anacim.sn" },
  { id: "SN_AIRSEN",    name: "Direction Commerciale",        organization: "Air Sénégal",                              countryCode: "SN",  email: "commercial@air.sn" },
  // ── Algérie
  { id: "DZ_DGACM",     name: "Direction Générale",           organization: "DACM — Aviation civile Algérie",           countryCode: "DZ",  email: "contact@dacm.gov.dz" },
  // ── Angola
  { id: "AO_INAVIC",    name: "Département Technique",        organization: "INAVIC — Aviation civile Angola",          countryCode: "AO",  email: "info@inavic.ao" },
  // ── Bénin
  { id: "BJ_ANAC",      name: "Direction Générale",           organization: "ANAC Bénin",                               countryCode: "BJ",  email: "anac@anac.bj" },
  // ── Burkina Faso
  { id: "BF_ANAC",      name: "Direction Générale",           organization: "ANAC Burkina Faso",                        countryCode: "BF",  email: "contact@anac.bf" },
  // ── Cameroun
  { id: "CM_CCAA",      name: "Directeur Général",            organization: "CCAA — Aviation civile Cameroun",          countryCode: "CM",  email: "ccaa@ccaa.aero" },
  // ── Cabo Verde
  { id: "CV_ASA",       name: "Direction Générale",           organization: "ASA — Autorité Aviation Cabo Verde",       countryCode: "CV",  email: "info@asa.cv" },
  // ── Tchad
  { id: "TD_ADAC",      name: "Direction Générale",           organization: "ADAC — Aviation civile Tchad",             countryCode: "TD",  email: "adac@adac.td" },
  // ── Côte d'Ivoire
  { id: "CI_ANAC",      name: "Direction Générale",           organization: "ANAC Côte d'Ivoire",                       countryCode: "CI",  email: "info@anacoci.ci" },
  { id: "CI_AIR",       name: "Direction Commerciale",        organization: "Air Côte d'Ivoire",                        countryCode: "CI",  email: "commercial@aircotedivoire.ci" },
  // ── RD Congo
  { id: "CD_RVA",       name: "Direction Générale",           organization: "RVA — Régie des Voies Aériennes",          countryCode: "CD",  email: "rva@rva.cd" },
  // ── Djibouti
  { id: "DJ_ADAC",      name: "Direction Générale",           organization: "ADAC Djibouti",                            countryCode: "DJ",  email: "adac@adacdjibouti.dj" },
  // ── Égypte
  { id: "EG_ECAA",      name: "Président",                    organization: "ECAA — Egyptian Civil Aviation Authority", countryCode: "EG",  email: "info@ecaa.gov.eg" },
  // ── Éthiopie
  { id: "ET_ECAA",      name: "Director General",             organization: "ECAA — Ethiopian Civil Aviation Authority",countryCode: "ET",  email: "info@ecaa.gov.et" },
  { id: "ET_ETAIR",     name: "Commercial Department",        organization: "Ethiopian Airlines",                        countryCode: "ET",  email: "commercial@ethiopianairlines.com" },
  // ── Gabon
  { id: "GA_ANAC",      name: "Direction Générale",           organization: "ANAC Gabon",                               countryCode: "GA",  email: "anac@anac.ga" },
  // ── Ghana
  { id: "GH_GCAA",      name: "Director General",             organization: "GCAA — Ghana Civil Aviation Authority",    countryCode: "GH",  email: "info@gcaa.com.gh" },
  // ── Guinée
  { id: "GN_ANAC",      name: "Direction Générale",           organization: "ANAC Guinée",                              countryCode: "GN",  email: "contact@anacguinee.org" },
  // ── Kenya
  { id: "KE_KCAA",      name: "Director General",             organization: "KCAA — Kenya Civil Aviation Authority",    countryCode: "KE",  email: "info@kcaa.or.ke" },
  { id: "KE_KQ",        name: "Commercial Department",        organization: "Kenya Airways",                             countryCode: "KE",  email: "commercial@kenya-airways.com" },
  // ── Libye
  { id: "LY_LYCAA",     name: "Director General",             organization: "LYCAA — Libyan Civil Aviation Authority",  countryCode: "LY",  email: "info@lycaa.org" },
  // ── Madagascar
  { id: "MG_ACM",       name: "Direction Générale",           organization: "ACM — Autorité Aviation Madagascar",       countryCode: "MG",  email: "acm@acm.mg" },
  // ── Mali
  { id: "ML_ANAC",      name: "Direction Générale",           organization: "ANAC Mali",                                countryCode: "ML",  email: "anac@anac.ml" },
  // ── Maroc
  { id: "MA_DGAC",      name: "Directeur Général",            organization: "DGAC Maroc",                               countryCode: "MA",  email: "dgac@dgac.gov.ma" },
  { id: "MA_RAM",       name: "Direction Commerciale",        organization: "Royal Air Maroc",                          countryCode: "MA",  email: "commercial@royalairmaroc.com" },
  // ── Mauritanie
  { id: "MR_ANAC",      name: "Direction Générale",           organization: "ANAC Mauritanie",                          countryCode: "MR",  email: "anac@anac.mr" },
  // ── Maurice
  { id: "MU_ATOL",      name: "Director",                     organization: "ATOL — Air Transport Authority Mauritius", countryCode: "MU",  email: "info@atol.gov.mu" },
  // ── Mozambique
  { id: "MZ_IACM",      name: "Director Geral",               organization: "IACM — Instituto Aviação Civil Moçambique",countryCode: "MZ",  email: "info@iacm.gov.mz" },
  // ── Namibie
  { id: "NA_DCA",       name: "Director",                     organization: "DCA Namibia",                              countryCode: "NA",  email: "dca@mtc.com.na" },
  // ── Niger
  { id: "NE_ANAC",      name: "Direction Générale",           organization: "ANAC Niger",                               countryCode: "NE",  email: "anac@anac.ne" },
  // ── Nigéria
  { id: "NG_NCAA",      name: "Director General",             organization: "NCAA — Nigerian Civil Aviation Authority",  countryCode: "NG",  email: "info@ncaa.gov.ng" },
  // ── Rwanda
  { id: "RW_RCAA",      name: "Director General",             organization: "RCAA — Rwanda Civil Aviation Authority",   countryCode: "RW",  email: "info@rcaa.gov.rw" },
  // ── Afrique du Sud
  { id: "ZA_SACAA",     name: "Director",                     organization: "SACAA — South African Civil Aviation",     countryCode: "ZA",  email: "info@caa.co.za" },
  // ── Soudan
  { id: "SD_SCAA",      name: "Director General",             organization: "SCAA Sudan",                               countryCode: "SD",  email: "info@caasud.com" },
  // ── Tanzanie
  { id: "TZ_TCAA",      name: "Director General",             organization: "TCAA — Tanzania Civil Aviation Authority", countryCode: "TZ",  email: "info@tcaa.go.tz" },
  // ── Togo
  { id: "TG_ANAC",      name: "Direction Générale",           organization: "ANAC Togo",                                countryCode: "TG",  email: "anacto@cafe.tg" },
  // ── Tunisie
  { id: "TN_DGAC",      name: "Directeur Général",            organization: "DGAC Tunisie",                             countryCode: "TN",  email: "dgac@atc.nat.tn" },
  // ── Ouganda
  { id: "UG_UCAA",      name: "Director General",             organization: "UCAA — Uganda Civil Aviation Authority",   countryCode: "UG",  email: "info@caa.co.ug" },
  // ── Zambie
  { id: "ZM_CAA",       name: "Director General",             organization: "CAA Zambia",                               countryCode: "ZM",  email: "caazambia@caa.co.zm" },
  // ── Zimbabwe
  { id: "ZW_CAAZ",      name: "Director General",             organization: "CAAZ — Civil Aviation Authority Zimbabwe", countryCode: "ZW",  email: "info@caaz.co.zw" },
  // ── Organisations internationales
  { id: "INT_ICAO",     name: "Regional Director",            organization: "ICAO — Organisation de l'aviation civile internationale", countryCode: "INT", email: "icaodakar@icao.int" },
  { id: "INT_IATA",     name: "Regional Manager",             organization: "IATA — Association du transport aérien international",    countryCode: "INT", email: "iataafr@iata.org" },
  { id: "INT_ASECNA",   name: "Directeur Général",            organization: "ASECNA",                                               countryCode: "INT", email: "asecna@asecna.org" },
  { id: "INT_AFRAA",    name: "Secretary General",            organization: "AFRAA — African Airlines Association",                  countryCode: "INT", email: "afraa@afraa.org" },
  // ── Constructeurs / Équipementiers
  { id: "FR_AIRBUS",    name: "VP Africa",                    organization: "Airbus",                                   countryCode: "FR",  email: "africa@airbus.com" },
  { id: "FR_THALES",    name: "Director Africa",              organization: "Thales",                                   countryCode: "FR",  email: "africa@thalesgroup.com" },
  { id: "FR_SAFRAN",    name: "Director Africa",              organization: "Safran",                                   countryCode: "FR",  email: "africa@safran-group.com" },
  { id: "US_BOEING",    name: "VP Africa & Middle East",      organization: "Boeing",                                   countryCode: "US",  email: "africa@boeing.com" },
  { id: "US_COLLINS",   name: "Director Africa",              organization: "Collins Aerospace",                        countryCode: "US",  email: "info-africa@collins.com" },
  { id: "AE_EMIRATES",  name: "VP Partnerships",              organization: "Emirates",                                 countryCode: "AE",  email: "partnerships@emirates.com" },
  { id: "QA_QATARAIR",  name: "VP Partnerships",              organization: "Qatar Airways",                            countryCode: "QA",  email: "partnerships@qatarairways.com.qa" },
  { id: "TR_TURKISH",   name: "Regional Director Africa",     organization: "Turkish Airlines",                         countryCode: "TR",  email: "africa@thy.com" },
];

export function getPartnersForCountry(countryCode: string): Partner[] {
  return PARTNERS.filter(p => p.countryCode === countryCode);
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}
