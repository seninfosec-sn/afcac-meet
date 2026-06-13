export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Partner {
  id: string;
  name: string;
  organization: string;
  countryCode: string;
  email: string;
}

export const COUNTRIES: Country[] = [
  // Afrique (54)
  { code: "DZ", name: "Algérie",                       flag: "🇩🇿" },
  { code: "AO", name: "Angola",                         flag: "🇦🇴" },
  { code: "BJ", name: "Bénin",                          flag: "🇧🇯" },
  { code: "BW", name: "Botswana",                       flag: "🇧🇼" },
  { code: "BF", name: "Burkina Faso",                   flag: "🇧🇫" },
  { code: "BI", name: "Burundi",                        flag: "🇧🇮" },
  { code: "CV", name: "Cabo Verde",                     flag: "🇨🇻" },
  { code: "CM", name: "Cameroun",                       flag: "🇨🇲" },
  { code: "CF", name: "Centrafrique",                   flag: "🇨🇫" },
  { code: "TD", name: "Tchad",                          flag: "🇹🇩" },
  { code: "KM", name: "Comores",                        flag: "🇰🇲" },
  { code: "CG", name: "Congo (Brazzaville)",            flag: "🇨🇬" },
  { code: "CD", name: "Congo (Kinshasa)",               flag: "🇨🇩" },
  { code: "DJ", name: "Djibouti",                       flag: "🇩🇯" },
  { code: "EG", name: "Égypte",                         flag: "🇪🇬" },
  { code: "GQ", name: "Guinée Équatoriale",             flag: "🇬🇶" },
  { code: "ER", name: "Érythrée",                       flag: "🇪🇷" },
  { code: "SZ", name: "Eswatini",                       flag: "🇸🇿" },
  { code: "ET", name: "Éthiopie",                       flag: "🇪🇹" },
  { code: "GA", name: "Gabon",                          flag: "🇬🇦" },
  { code: "GM", name: "Gambie",                         flag: "🇬🇲" },
  { code: "GH", name: "Ghana",                          flag: "🇬🇭" },
  { code: "GN", name: "Guinée",                         flag: "🇬🇳" },
  { code: "GW", name: "Guinée-Bissau",                  flag: "🇬🇼" },
  { code: "CI", name: "Côte d'Ivoire",                  flag: "🇨🇮" },
  { code: "KE", name: "Kenya",                          flag: "🇰🇪" },
  { code: "LS", name: "Lesotho",                        flag: "🇱🇸" },
  { code: "LR", name: "Libéria",                        flag: "🇱🇷" },
  { code: "LY", name: "Libye",                          flag: "🇱🇾" },
  { code: "MG", name: "Madagascar",                     flag: "🇲🇬" },
  { code: "MW", name: "Malawi",                         flag: "🇲🇼" },
  { code: "ML", name: "Mali",                           flag: "🇲🇱" },
  { code: "MR", name: "Mauritanie",                     flag: "🇲🇷" },
  { code: "MU", name: "Maurice",                        flag: "🇲🇺" },
  { code: "MA", name: "Maroc",                          flag: "🇲🇦" },
  { code: "MZ", name: "Mozambique",                     flag: "🇲🇿" },
  { code: "NA", name: "Namibie",                        flag: "🇳🇦" },
  { code: "NE", name: "Niger",                          flag: "🇳🇪" },
  { code: "NG", name: "Nigéria",                        flag: "🇳🇬" },
  { code: "RW", name: "Rwanda",                         flag: "🇷🇼" },
  { code: "ST", name: "Sao Tomé-et-Príncipe",           flag: "🇸🇹" },
  { code: "SN", name: "Sénégal",                        flag: "🇸🇳" },
  { code: "SC", name: "Seychelles",                     flag: "🇸🇨" },
  { code: "SL", name: "Sierra Leone",                   flag: "🇸🇱" },
  { code: "SO", name: "Somalie",                        flag: "🇸🇴" },
  { code: "ZA", name: "Afrique du Sud",                 flag: "🇿🇦" },
  { code: "SS", name: "Soudan du Sud",                  flag: "🇸🇸" },
  { code: "SD", name: "Soudan",                         flag: "🇸🇩" },
  { code: "TZ", name: "Tanzanie",                       flag: "🇹🇿" },
  { code: "TG", name: "Togo",                           flag: "🇹🇬" },
  { code: "TN", name: "Tunisie",                        flag: "🇹🇳" },
  { code: "UG", name: "Ouganda",                        flag: "🇺🇬" },
  { code: "ZM", name: "Zambie",                         flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe",                       flag: "🇿🇼" },
  // Europe (44)
  { code: "AL", name: "Albanie",                        flag: "🇦🇱" },
  { code: "AD", name: "Andorre",                        flag: "🇦🇩" },
  { code: "AT", name: "Autriche",                       flag: "🇦🇹" },
  { code: "BY", name: "Biélorussie",                    flag: "🇧🇾" },
  { code: "BE", name: "Belgique",                       flag: "🇧🇪" },
  { code: "BA", name: "Bosnie-Herzégovine",             flag: "🇧🇦" },
  { code: "BG", name: "Bulgarie",                       flag: "🇧🇬" },
  { code: "HR", name: "Croatie",                        flag: "🇭🇷" },
  { code: "CY", name: "Chypre",                         flag: "🇨🇾" },
  { code: "CZ", name: "République tchèque",             flag: "🇨🇿" },
  { code: "DK", name: "Danemark",                       flag: "🇩🇰" },
  { code: "EE", name: "Estonie",                        flag: "🇪🇪" },
  { code: "FI", name: "Finlande",                       flag: "🇫🇮" },
  { code: "FR", name: "France",                         flag: "🇫🇷" },
  { code: "DE", name: "Allemagne",                      flag: "🇩🇪" },
  { code: "GR", name: "Grèce",                          flag: "🇬🇷" },
  { code: "HU", name: "Hongrie",                        flag: "🇭🇺" },
  { code: "IS", name: "Islande",                        flag: "🇮🇸" },
  { code: "IE", name: "Irlande",                        flag: "🇮🇪" },
  { code: "IT", name: "Italie",                         flag: "🇮🇹" },
  { code: "LV", name: "Lettonie",                       flag: "🇱🇻" },
  { code: "LI", name: "Liechtenstein",                  flag: "🇱🇮" },
  { code: "LT", name: "Lituanie",                       flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg",                     flag: "🇱🇺" },
  { code: "MT", name: "Malte",                          flag: "🇲🇹" },
  { code: "MD", name: "Moldavie",                       flag: "🇲🇩" },
  { code: "MC", name: "Monaco",                         flag: "🇲🇨" },
  { code: "ME", name: "Monténégro",                     flag: "🇲🇪" },
  { code: "NL", name: "Pays-Bas",                       flag: "🇳🇱" },
  { code: "MK", name: "Macédoine du Nord",              flag: "🇲🇰" },
  { code: "NO", name: "Norvège",                        flag: "🇳🇴" },
  { code: "PL", name: "Pologne",                        flag: "🇵🇱" },
  { code: "PT", name: "Portugal",                       flag: "🇵🇹" },
  { code: "RO", name: "Roumanie",                       flag: "🇷🇴" },
  { code: "RU", name: "Russie",                         flag: "🇷🇺" },
  { code: "SM", name: "Saint-Marin",                    flag: "🇸🇲" },
  { code: "RS", name: "Serbie",                         flag: "🇷🇸" },
  { code: "SK", name: "Slovaquie",                      flag: "🇸🇰" },
  { code: "SI", name: "Slovénie",                       flag: "🇸🇮" },
  { code: "ES", name: "Espagne",                        flag: "🇪🇸" },
  { code: "SE", name: "Suède",                          flag: "🇸🇪" },
  { code: "CH", name: "Suisse",                         flag: "🇨🇭" },
  { code: "UA", name: "Ukraine",                        flag: "🇺🇦" },
  { code: "GB", name: "Royaume-Uni",                    flag: "🇬🇧" },
  // Amériques (35)
  { code: "AG", name: "Antigua-et-Barbuda",             flag: "🇦🇬" },
  { code: "AR", name: "Argentine",                      flag: "🇦🇷" },
  { code: "BS", name: "Bahamas",                        flag: "🇧🇸" },
  { code: "BB", name: "Barbade",                        flag: "🇧🇧" },
  { code: "BZ", name: "Belize",                         flag: "🇧🇿" },
  { code: "BO", name: "Bolivie",                        flag: "🇧🇴" },
  { code: "BR", name: "Brésil",                         flag: "🇧🇷" },
  { code: "CA", name: "Canada",                         flag: "🇨🇦" },
  { code: "CL", name: "Chili",                          flag: "🇨🇱" },
  { code: "CO", name: "Colombie",                       flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica",                     flag: "🇨🇷" },
  { code: "CU", name: "Cuba",                           flag: "🇨🇺" },
  { code: "DM", name: "Dominique",                      flag: "🇩🇲" },
  { code: "DO", name: "République dominicaine",         flag: "🇩🇴" },
  { code: "EC", name: "Équateur",                       flag: "🇪🇨" },
  { code: "SV", name: "Salvador",                       flag: "🇸🇻" },
  { code: "GD", name: "Grenade",                        flag: "🇬🇩" },
  { code: "GT", name: "Guatemala",                      flag: "🇬🇹" },
  { code: "GY", name: "Guyana",                         flag: "🇬🇾" },
  { code: "HT", name: "Haïti",                          flag: "🇭🇹" },
  { code: "HN", name: "Honduras",                       flag: "🇭🇳" },
  { code: "JM", name: "Jamaïque",                       flag: "🇯🇲" },
  { code: "MX", name: "Mexique",                        flag: "🇲🇽" },
  { code: "NI", name: "Nicaragua",                      flag: "🇳🇮" },
  { code: "PA", name: "Panama",                         flag: "🇵🇦" },
  { code: "PY", name: "Paraguay",                       flag: "🇵🇾" },
  { code: "PE", name: "Pérou",                          flag: "🇵🇪" },
  { code: "KN", name: "Saint-Kitts-et-Nevis",           flag: "🇰🇳" },
  { code: "LC", name: "Sainte-Lucie",                   flag: "🇱🇨" },
  { code: "VC", name: "Saint-Vincent-et-les-Grenadines",flag: "🇻🇨" },
  { code: "SR", name: "Suriname",                       flag: "🇸🇷" },
  { code: "TT", name: "Trinité-et-Tobago",              flag: "🇹🇹" },
  { code: "US", name: "États-Unis",                     flag: "🇺🇸" },
  { code: "UY", name: "Uruguay",                        flag: "🇺🇾" },
  { code: "VE", name: "Venezuela",                      flag: "🇻🇪" },
  // Asie (47)
  { code: "AF", name: "Afghanistan",                    flag: "🇦🇫" },
  { code: "AM", name: "Arménie",                        flag: "🇦🇲" },
  { code: "AZ", name: "Azerbaïdjan",                    flag: "🇦🇿" },
  { code: "BH", name: "Bahreïn",                        flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh",                     flag: "🇧🇩" },
  { code: "BT", name: "Bhoutan",                        flag: "🇧🇹" },
  { code: "BN", name: "Brunéi",                         flag: "🇧🇳" },
  { code: "KH", name: "Cambodge",                       flag: "🇰🇭" },
  { code: "CN", name: "Chine",                          flag: "🇨🇳" },
  { code: "GE", name: "Géorgie",                        flag: "🇬🇪" },
  { code: "IN", name: "Inde",                           flag: "🇮🇳" },
  { code: "ID", name: "Indonésie",                      flag: "🇮🇩" },
  { code: "IR", name: "Iran",                           flag: "🇮🇷" },
  { code: "IQ", name: "Irak",                           flag: "🇮🇶" },
  { code: "IL", name: "Israël",                         flag: "🇮🇱" },
  { code: "JP", name: "Japon",                          flag: "🇯🇵" },
  { code: "JO", name: "Jordanie",                       flag: "🇯🇴" },
  { code: "KZ", name: "Kazakhstan",                     flag: "🇰🇿" },
  { code: "KW", name: "Koweït",                         flag: "🇰🇼" },
  { code: "KG", name: "Kirghizistan",                   flag: "🇰🇬" },
  { code: "LA", name: "Laos",                           flag: "🇱🇦" },
  { code: "LB", name: "Liban",                          flag: "🇱🇧" },
  { code: "MY", name: "Malaisie",                       flag: "🇲🇾" },
  { code: "MV", name: "Maldives",                       flag: "🇲🇻" },
  { code: "MN", name: "Mongolie",                       flag: "🇲🇳" },
  { code: "MM", name: "Myanmar",                        flag: "🇲🇲" },
  { code: "NP", name: "Népal",                          flag: "🇳🇵" },
  { code: "KP", name: "Corée du Nord",                  flag: "🇰🇵" },
  { code: "OM", name: "Oman",                           flag: "🇴🇲" },
  { code: "PK", name: "Pakistan",                       flag: "🇵🇰" },
  { code: "PS", name: "Palestine",                      flag: "🇵🇸" },
  { code: "PH", name: "Philippines",                    flag: "🇵🇭" },
  { code: "QA", name: "Qatar",                          flag: "🇶🇦" },
  { code: "SA", name: "Arabie Saoudite",                flag: "🇸🇦" },
  { code: "SG", name: "Singapour",                      flag: "🇸🇬" },
  { code: "KR", name: "Corée du Sud",                   flag: "🇰🇷" },
  { code: "LK", name: "Sri Lanka",                      flag: "🇱🇰" },
  { code: "SY", name: "Syrie",                          flag: "🇸🇾" },
  { code: "TJ", name: "Tadjikistan",                    flag: "🇹🇯" },
  { code: "TH", name: "Thaïlande",                      flag: "🇹🇭" },
  { code: "TL", name: "Timor-Leste",                    flag: "🇹🇱" },
  { code: "TR", name: "Turquie",                        flag: "🇹🇷" },
  { code: "TM", name: "Turkménistan",                   flag: "🇹🇲" },
  { code: "AE", name: "Émirats arabes unis",            flag: "🇦🇪" },
  { code: "UZ", name: "Ouzbékistan",                    flag: "🇺🇿" },
  { code: "VN", name: "Viêt Nam",                       flag: "🇻🇳" },
  { code: "YE", name: "Yémen",                          flag: "🇾🇪" },
  // Océanie (14)
  { code: "AU", name: "Australie",                      flag: "🇦🇺" },
  { code: "FJ", name: "Fidji",                          flag: "🇫🇯" },
  { code: "KI", name: "Kiribati",                       flag: "🇰🇮" },
  { code: "MH", name: "Îles Marshall",                  flag: "🇲🇭" },
  { code: "FM", name: "Micronésie",                     flag: "🇫🇲" },
  { code: "NR", name: "Nauru",                          flag: "🇳🇷" },
  { code: "NZ", name: "Nouvelle-Zélande",               flag: "🇳🇿" },
  { code: "PW", name: "Palaos",                         flag: "🇵🇼" },
  { code: "PG", name: "Papouasie-Nouvelle-Guinée",      flag: "🇵🇬" },
  { code: "WS", name: "Samoa",                          flag: "🇼🇸" },
  { code: "SB", name: "Îles Salomon",                   flag: "🇸🇧" },
  { code: "TO", name: "Tonga",                          flag: "🇹🇴" },
  { code: "TV", name: "Tuvalu",                         flag: "🇹🇻" },
  { code: "VU", name: "Vanuatu",                        flag: "🇻🇺" },
  // Organisations internationales (code spécial)
  { code: "INT", name: "Organisation internationale",   flag: "🌐" },
];

// Partenaires — à compléter avec les vrais contacts et emails
export const PARTNERS: Partner[] = [
  // ── Sénégal
  { id: "SN_ANACIM",    name: "Direction Générale",           organization: "ANACIM",                                   countryCode: "SN", email: "dgacim@anacim.sn" },
  { id: "SN_AIRSEN",    name: "Direction Commerciale",        organization: "Air Sénégal",                              countryCode: "SN", email: "commercial@air.sn" },
  // ── Algérie
  { id: "DZ_DGACM",     name: "Direction Générale",           organization: "DACM — Aviation civile Algérie",           countryCode: "DZ", email: "contact@dacm.gov.dz" },
  // ── Angola
  { id: "AO_INAVIC",    name: "Département Technique",        organization: "INAVIC — Aviation civile Angola",          countryCode: "AO", email: "info@inavic.ao" },
  // ── Bénin
  { id: "BJ_ANAC",      name: "Direction Générale",           organization: "ANAC Bénin",                               countryCode: "BJ", email: "anac@anac.bj" },
  // ── Burkina Faso
  { id: "BF_ANAC",      name: "Direction Générale",           organization: "ANAC Burkina Faso",                        countryCode: "BF", email: "contact@anac.bf" },
  // ── Cameroun
  { id: "CM_CCAA",      name: "Directeur Général",            organization: "CCAA — Aviation civile Cameroun",          countryCode: "CM", email: "ccaa@ccaa.aero" },
  // ── Cabo Verde
  { id: "CV_ASA",       name: "Direction Générale",           organization: "ASA — Autorité Aviation Cabo Verde",       countryCode: "CV", email: "info@asa.cv" },
  // ── Tchad
  { id: "TD_ADAC",      name: "Direction Générale",           organization: "ADAC — Aviation civile Tchad",             countryCode: "TD", email: "adac@adac.td" },
  // ── Côte d'Ivoire
  { id: "CI_ANAC",      name: "Direction Générale",           organization: "ANAC Côte d'Ivoire",                       countryCode: "CI", email: "info@anacoci.ci" },
  { id: "CI_AIR",       name: "Direction Commerciale",        organization: "Air Côte d'Ivoire",                        countryCode: "CI", email: "commercial@aircotedivoire.ci" },
  // ── RD Congo
  { id: "CD_RVA",       name: "Direction Générale",           organization: "RVA — Régie des Voies Aériennes",          countryCode: "CD", email: "rva@rva.cd" },
  // ── Djibouti
  { id: "DJ_ADAC",      name: "Direction Générale",           organization: "ADAC Djibouti",                            countryCode: "DJ", email: "adac@adacdjibouti.dj" },
  // ── Égypte
  { id: "EG_ECAA",      name: "Président",                    organization: "ECAA — Egyptian Civil Aviation Authority", countryCode: "EG", email: "info@ecaa.gov.eg" },
  // ── Éthiopie
  { id: "ET_ECAA",      name: "Director General",             organization: "ECAA — Ethiopian Civil Aviation Authority",countryCode: "ET", email: "info@ecaa.gov.et" },
  { id: "ET_ETAIR",     name: "Commercial Department",        organization: "Ethiopian Airlines",                        countryCode: "ET", email: "commercial@ethiopianairlines.com" },
  // ── Gabon
  { id: "GA_ANAC",      name: "Direction Générale",           organization: "ANAC Gabon",                               countryCode: "GA", email: "anac@anac.ga" },
  // ── Ghana
  { id: "GH_GCAA",      name: "Director General",             organization: "GCAA — Ghana Civil Aviation Authority",    countryCode: "GH", email: "info@gcaa.com.gh" },
  // ── Guinée
  { id: "GN_ANAC",      name: "Direction Générale",           organization: "ANAC Guinée",                              countryCode: "GN", email: "contact@anacguinee.org" },
  // ── Kenya
  { id: "KE_KCAA",      name: "Director General",             organization: "KCAA — Kenya Civil Aviation Authority",    countryCode: "KE", email: "info@kcaa.or.ke" },
  { id: "KE_KQ",        name: "Commercial Department",        organization: "Kenya Airways",                             countryCode: "KE", email: "commercial@kenya-airways.com" },
  // ── Libye
  { id: "LY_LYCAA",     name: "Director General",             organization: "LYCAA — Libyan Civil Aviation Authority",  countryCode: "LY", email: "info@lycaa.org" },
  // ── Madagascar
  { id: "MG_ACM",       name: "Direction Générale",           organization: "ACM — Autorité Aviation Madagascar",       countryCode: "MG", email: "acm@acm.mg" },
  // ── Mali
  { id: "ML_ANAC",      name: "Direction Générale",           organization: "ANAC Mali",                                countryCode: "ML", email: "anac@anac.ml" },
  // ── Maroc
  { id: "MA_DGAC",      name: "Directeur Général",            organization: "DGAC Maroc",                               countryCode: "MA", email: "dgac@dgac.gov.ma" },
  { id: "MA_RAM",       name: "Direction Commerciale",        organization: "Royal Air Maroc",                          countryCode: "MA", email: "commercial@royalairmaroc.com" },
  // ── Mauritanie
  { id: "MR_ANAC",      name: "Direction Générale",           organization: "ANAC Mauritanie",                          countryCode: "MR", email: "anac@anac.mr" },
  // ── Maurice
  { id: "MU_ATOL",      name: "Director",                     organization: "ATOL — Air Transport Authority Mauritius", countryCode: "MU", email: "info@atol.gov.mu" },
  // ── Mozambique
  { id: "MZ_IACM",      name: "Director Geral",               organization: "IACM — Instituto Aviação Civil Moçambique",countryCode: "MZ", email: "info@iacm.gov.mz" },
  // ── Namibie
  { id: "NA_DCA",       name: "Director",                     organization: "DCA Namibia",                              countryCode: "NA", email: "dca@mtc.com.na" },
  // ── Niger
  { id: "NE_ANAC",      name: "Direction Générale",           organization: "ANAC Niger",                               countryCode: "NE", email: "anac@anac.ne" },
  // ── Nigéria
  { id: "NG_NCAA",      name: "Director General",             organization: "NCAA — Nigerian Civil Aviation Authority",  countryCode: "NG", email: "info@ncaa.gov.ng" },
  // ── Rwanda
  { id: "RW_RCAA",      name: "Director General",             organization: "RCAA — Rwanda Civil Aviation Authority",   countryCode: "RW", email: "info@rcaa.gov.rw" },
  // ── Afrique du Sud
  { id: "ZA_SACAA",     name: "Director",                     organization: "SACAA — South African Civil Aviation",     countryCode: "ZA", email: "info@caa.co.za" },
  // ── Soudan
  { id: "SD_SCAA",      name: "Director General",             organization: "SCAA Sudan",                               countryCode: "SD", email: "info@caasud.com" },
  // ── Tanzanie
  { id: "TZ_TCAA",      name: "Director General",             organization: "TCAA — Tanzania Civil Aviation Authority", countryCode: "TZ", email: "info@tcaa.go.tz" },
  // ── Togo
  { id: "TG_ANAC",      name: "Direction Générale",           organization: "ANAC Togo",                                countryCode: "TG", email: "anacto@cafe.tg" },
  // ── Tunisie
  { id: "TN_DGAC",      name: "Directeur Général",            organization: "DGAC Tunisie",                             countryCode: "TN", email: "dgac@atc.nat.tn" },
  // ── Ouganda
  { id: "UG_UCAA",      name: "Director General",             organization: "UCAA — Uganda Civil Aviation Authority",   countryCode: "UG", email: "info@caa.co.ug" },
  // ── Zambie
  { id: "ZM_CAA",       name: "Director General",             organization: "CAA Zambia",                               countryCode: "ZM", email: "caazambia@caa.co.zm" },
  // ── Zimbabwe
  { id: "ZW_CAAZ",      name: "Director General",             organization: "CAAZ — Civil Aviation Authority Zimbabwe", countryCode: "ZW", email: "info@caaz.co.zw" },
  // ── Organisations internationales
  { id: "INT_ICAO",     name: "Regional Director",            organization: "ICAO — Organisation de l'aviation civile internationale", countryCode: "INT", email: "icaodakar@icao.int" },
  { id: "INT_IATA",     name: "Regional Manager",             organization: "IATA — Association du transport aérien international",    countryCode: "INT", email: "iataafr@iata.org" },
  { id: "INT_ASECNA",   name: "Directeur Général",            organization: "ASECNA",                                               countryCode: "INT", email: "asecna@asecna.org" },
  { id: "INT_AFRAA",    name: "Secretary General",            organization: "AFRAA — African Airlines Association",                  countryCode: "INT", email: "afraa@afraa.org" },
  // ── Constructeurs / Équipementiers
  { id: "FR_AIRBUS",    name: "VP Africa",                    organization: "Airbus",                                   countryCode: "FR", email: "africa@airbus.com" },
  { id: "FR_THALES",    name: "Director Africa",              organization: "Thales",                                   countryCode: "FR", email: "africa@thalesgroup.com" },
  { id: "FR_SAFRAN",    name: "Director Africa",              organization: "Safran",                                   countryCode: "FR", email: "africa@safran-group.com" },
  { id: "US_BOEING",    name: "VP Africa & Middle East",      organization: "Boeing",                                   countryCode: "US", email: "africa@boeing.com" },
  { id: "US_COLLINS",   name: "Director Africa",              organization: "Collins Aerospace",                        countryCode: "US", email: "info-africa@collins.com" },
  { id: "AE_EMIRATES",  name: "VP Partnerships",              organization: "Emirates",                                 countryCode: "AE", email: "partnerships@emirates.com" },
  { id: "QA_QATARAIR",  name: "VP Partnerships",              organization: "Qatar Airways",                            countryCode: "QA", email: "partnerships@qatarairways.com.qa" },
  { id: "TR_TURKISH",   name: "Regional Director Africa",     organization: "Turkish Airlines",                         countryCode: "TR", email: "africa@thy.com" },
];

export function getPartnersForCountry(countryCode: string): Partner[] {
  return PARTNERS.filter(p => p.countryCode === countryCode);
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}
