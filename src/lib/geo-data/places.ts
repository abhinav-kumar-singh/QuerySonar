export interface PlaceSuggestion {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  formatted: string;
  type?: string;
  lat?: number;
  lng?: number;
  flag?: string;
  aliases?: string[];
}

export function getFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const POPULAR_PRESETS: PlaceSuggestion[] = [
  {
    id: "preset-global",
    name: "Global / Worldwide",
    formatted: "Worldwide (All Regions)",
    type: "global",
    flag: "🌍",
  },
  {
    id: "preset-us",
    name: "United States",
    country: "United States",
    countryCode: "US",
    formatted: "United States (US)",
    type: "country",
    flag: "🇺🇸",
    aliases: ["USA", "America"],
  },
  {
    id: "preset-cn",
    name: "China",
    country: "China",
    countryCode: "CN",
    formatted: "China (CN)",
    type: "country",
    flag: "🇨🇳",
    aliases: ["PRC", "People's Republic of China", "Zhongguo", "Mainland China"],
  },
  {
    id: "preset-gb",
    name: "United Kingdom",
    country: "United Kingdom",
    countryCode: "GB",
    formatted: "United Kingdom (UK)",
    type: "country",
    flag: "🇬🇧",
    aliases: ["UK", "Britain", "Great Britain", "England"],
  },
  {
    id: "preset-in",
    name: "India",
    country: "India",
    countryCode: "IN",
    formatted: "India (IN)",
    type: "country",
    flag: "🇮🇳",
    aliases: ["Bharat"],
  },
  {
    id: "preset-de",
    name: "Germany",
    country: "Germany",
    countryCode: "DE",
    formatted: "Germany (DE)",
    type: "country",
    flag: "🇩🇪",
    aliases: ["Deutschland"],
  },
  {
    id: "preset-ca",
    name: "Canada",
    country: "Canada",
    countryCode: "CA",
    formatted: "Canada (CA)",
    type: "country",
    flag: "🇨🇦",
  },
  {
    id: "preset-au",
    name: "Australia",
    country: "Australia",
    countryCode: "AU",
    formatted: "Australia (AU)",
    type: "country",
    flag: "🇦🇺",
    aliases: ["Aussie"],
  },
  {
    id: "preset-fr",
    name: "France",
    country: "France",
    countryCode: "FR",
    formatted: "France (FR)",
    type: "country",
    flag: "🇫🇷",
  },
  {
    id: "preset-jp",
    name: "Japan",
    country: "Japan",
    countryCode: "JP",
    formatted: "Japan (JP)",
    type: "country",
    flag: "🇯🇵",
    aliases: ["Nippon", "Nihon"],
  },
  {
    id: "preset-sg",
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    formatted: "Singapore (SG)",
    type: "country",
    flag: "🇸🇬",
  },
  {
    id: "preset-ae",
    name: "United Arab Emirates",
    country: "United Arab Emirates",
    countryCode: "AE",
    formatted: "United Arab Emirates (UAE)",
    type: "country",
    flag: "🇦🇪",
    aliases: ["UAE", "Emirates", "Dubai"],
  },
  {
    id: "preset-br",
    name: "Brazil",
    country: "Brazil",
    countryCode: "BR",
    formatted: "Brazil (BR)",
    type: "country",
    flag: "🇧🇷",
    aliases: ["Brasil"],
  },
];

// Comprehensive list of all world countries and major territories
export const ALL_COUNTRIES: PlaceSuggestion[] = [
  { id: "c-af", name: "Afghanistan", country: "Afghanistan", countryCode: "AF", formatted: "Afghanistan (AF)", flag: "🇦🇫", type: "country" },
  { id: "c-al", name: "Albania", country: "Albania", countryCode: "AL", formatted: "Albania (AL)", flag: "🇦🇱", type: "country" },
  { id: "c-dz", name: "Algeria", country: "Algeria", countryCode: "DZ", formatted: "Algeria (DZ)", flag: "🇩🇿", type: "country" },
  { id: "c-ad", name: "Andorra", country: "Andorra", countryCode: "AD", formatted: "Andorra (AD)", flag: "🇦🇩", type: "country" },
  { id: "c-ao", name: "Angola", country: "Angola", countryCode: "AO", formatted: "Angola (AO)", flag: "🇦🇴", type: "country" },
  { id: "c-ar", name: "Argentina", country: "Argentina", countryCode: "AR", formatted: "Argentina (AR)", flag: "🇦🇷", type: "country" },
  { id: "c-am", name: "Armenia", country: "Armenia", countryCode: "AM", formatted: "Armenia (AM)", flag: "🇦🇲", type: "country" },
  { id: "c-au", name: "Australia", country: "Australia", countryCode: "AU", formatted: "Australia (AU)", flag: "🇦🇺", type: "country", aliases: ["Aussie"] },
  { id: "c-at", name: "Austria", country: "Austria", countryCode: "AT", formatted: "Austria (AT)", flag: "🇦🇹", type: "country", aliases: ["Österreich"] },
  { id: "c-az", name: "Azerbaijan", country: "Azerbaijan", countryCode: "AZ", formatted: "Azerbaijan (AZ)", flag: "🇦🇿", type: "country" },
  { id: "c-bs", name: "Bahamas", country: "Bahamas", countryCode: "BS", formatted: "Bahamas (BS)", flag: "🇧🇸", type: "country" },
  { id: "c-bh", name: "Bahrain", country: "Bahrain", countryCode: "BH", formatted: "Bahrain (BH)", flag: "🇧🇭", type: "country" },
  { id: "c-bd", name: "Bangladesh", country: "Bangladesh", countryCode: "BD", formatted: "Bangladesh (BD)", flag: "🇧🇩", type: "country" },
  { id: "c-bb", name: "Barbados", country: "Barbados", countryCode: "BB", formatted: "Barbados (BB)", flag: "🇧🇧", type: "country" },
  { id: "c-by", name: "Belarus", country: "Belarus", countryCode: "BY", formatted: "Belarus (BY)", flag: "🇧🇾", type: "country" },
  { id: "c-be", name: "Belgium", country: "Belgium", countryCode: "BE", formatted: "Belgium (BE)", flag: "🇧🇪", type: "country" },
  { id: "c-bz", name: "Belize", country: "Belize", countryCode: "BZ", formatted: "Belize (BZ)", flag: "🇧🇿", type: "country" },
  { id: "c-bj", name: "Benin", country: "Benin", countryCode: "BJ", formatted: "Benin (BJ)", flag: "🇧🇯", type: "country" },
  { id: "c-bt", name: "Bhutan", country: "Bhutan", countryCode: "BT", formatted: "Bhutan (BT)", flag: "🇧🇹", type: "country" },
  { id: "c-bo", name: "Bolivia", country: "Bolivia", countryCode: "BO", formatted: "Bolivia (BO)", flag: "🇧🇴", type: "country" },
  { id: "c-ba", name: "Bosnia and Herzegovina", country: "Bosnia and Herzegovina", countryCode: "BA", formatted: "Bosnia and Herzegovina (BA)", flag: "🇧🇦", type: "country" },
  { id: "c-bw", name: "Botswana", country: "Botswana", countryCode: "BW", formatted: "Botswana (BW)", flag: "🇧🇼", type: "country" },
  { id: "c-br", name: "Brazil", country: "Brazil", countryCode: "BR", formatted: "Brazil (BR)", flag: "🇧🇷", type: "country", aliases: ["Brasil"] },
  { id: "c-bn", name: "Brunei", country: "Brunei", countryCode: "BN", formatted: "Brunei (BN)", flag: "🇧🇳", type: "country" },
  { id: "c-bg", name: "Bulgaria", country: "Bulgaria", countryCode: "BG", formatted: "Bulgaria (BG)", flag: "🇧🇬", type: "country" },
  { id: "c-bf", name: "Burkina Faso", country: "Burkina Faso", countryCode: "BF", formatted: "Burkina Faso (BF)", flag: "🇧🇫", type: "country" },
  { id: "c-bi", name: "Burundi", country: "Burundi", countryCode: "BI", formatted: "Burundi (BI)", flag: "🇧🇮", type: "country" },
  { id: "c-kh", name: "Cambodia", country: "Cambodia", countryCode: "KH", formatted: "Cambodia (KH)", flag: "🇰🇭", type: "country" },
  { id: "c-cm", name: "Cameroon", country: "Cameroon", countryCode: "CM", formatted: "Cameroon (CM)", flag: "🇨🇲", type: "country" },
  { id: "c-ca", name: "Canada", country: "Canada", countryCode: "CA", formatted: "Canada (CA)", flag: "🇨🇦", type: "country" },
  { id: "c-cv", name: "Cape Verde", country: "Cape Verde", countryCode: "CV", formatted: "Cape Verde (CV)", flag: "🇨🇻", type: "country" },
  { id: "c-cf", name: "Central African Republic", country: "Central African Republic", countryCode: "CF", formatted: "Central African Republic (CF)", flag: "🇨🇫", type: "country" },
  { id: "c-td", name: "Chad", country: "Chad", countryCode: "TD", formatted: "Chad (TD)", flag: "🇹🇩", type: "country" },
  { id: "c-cl", name: "Chile", country: "Chile", countryCode: "CL", formatted: "Chile (CL)", flag: "🇨🇱", type: "country" },
  { id: "c-cn", name: "China", country: "China", countryCode: "CN", formatted: "China (CN)", flag: "🇨🇳", type: "country", aliases: ["PRC", "People's Republic of China", "Zhongguo", "Mainland China"] },
  { id: "c-co", name: "Colombia", country: "Colombia", countryCode: "CO", formatted: "Colombia (CO)", flag: "🇨🇴", type: "country" },
  { id: "c-km", name: "Comoros", country: "Comoros", countryCode: "KM", formatted: "Comoros (KM)", flag: "🇰🇲", type: "country" },
  { id: "c-cg", name: "Congo", country: "Congo", countryCode: "CG", formatted: "Congo (CG)", flag: "🇨🇬", type: "country" },
  { id: "c-cd", name: "DR Congo", country: "DR Congo", countryCode: "CD", formatted: "DR Congo (CD)", flag: "🇨🇩", type: "country", aliases: ["Democratic Republic of the Congo", "Zaire"] },
  { id: "c-cr", name: "Costa Rica", country: "Costa Rica", countryCode: "CR", formatted: "Costa Rica (CR)", flag: "🇨🇷", type: "country" },
  { id: "c-hr", name: "Croatia", country: "Croatia", countryCode: "HR", formatted: "Croatia (HR)", flag: "🇭🇷", type: "country", aliases: ["Hrvatska"] },
  { id: "c-cu", name: "Cuba", country: "Cuba", countryCode: "CU", formatted: "Cuba (CU)", flag: "🇨🇺", type: "country" },
  { id: "c-cy", name: "Cyprus", country: "Cyprus", countryCode: "CY", formatted: "Cyprus (CY)", flag: "🇨🇾", type: "country" },
  { id: "c-cz", name: "Czech Republic", country: "Czech Republic", countryCode: "CZ", formatted: "Czech Republic (CZ)", flag: "🇨🇿", type: "country", aliases: ["Czechia"] },
  { id: "c-dk", name: "Denmark", country: "Denmark", countryCode: "DK", formatted: "Denmark (DK)", flag: "🇩🇰", type: "country" },
  { id: "c-dj", name: "Djibouti", country: "Djibouti", countryCode: "DJ", formatted: "Djibouti (DJ)", flag: "🇩🇯", type: "country" },
  { id: "c-do", name: "Dominican Republic", country: "Dominican Republic", countryCode: "DO", formatted: "Dominican Republic (DO)", flag: "🇩🇴", type: "country" },
  { id: "c-ec", name: "Ecuador", country: "Ecuador", countryCode: "EC", formatted: "Ecuador (EC)", flag: "🇪🇨", type: "country" },
  { id: "c-eg", name: "Egypt", country: "Egypt", countryCode: "EG", formatted: "Egypt (EG)", flag: "🇪🇬", type: "country" },
  { id: "c-sv", name: "El Salvador", country: "El Salvador", countryCode: "SV", formatted: "El Salvador (SV)", flag: "🇸🇻", type: "country" },
  { id: "c-gq", name: "Equatorial Guinea", country: "Equatorial Guinea", countryCode: "GQ", formatted: "Equatorial Guinea (GQ)", flag: "🇬🇶", type: "country" },
  { id: "c-er", name: "Eritrea", country: "Eritrea", countryCode: "ER", formatted: "Eritrea (ER)", flag: "🇪🇷", type: "country" },
  { id: "c-ee", name: "Estonia", country: "Estonia", countryCode: "EE", formatted: "Estonia (EE)", flag: "🇪🇪", type: "country" },
  { id: "c-sz", name: "Eswatini", country: "Eswatini", countryCode: "SZ", formatted: "Eswatini (SZ)", flag: "🇸🇿", type: "country", aliases: ["Swaziland"] },
  { id: "c-et", name: "Ethiopia", country: "Ethiopia", countryCode: "ET", formatted: "Ethiopia (ET)", flag: "🇪🇹", type: "country" },
  { id: "c-fj", name: "Fiji", country: "Fiji", countryCode: "FJ", formatted: "Fiji (FJ)", flag: "🇫🇯", type: "country" },
  { id: "c-fi", name: "Finland", country: "Finland", countryCode: "FI", formatted: "Finland (FI)", flag: "🇫🇮", type: "country", aliases: ["Suomi"] },
  { id: "c-fr", name: "France", country: "France", countryCode: "FR", formatted: "France (FR)", flag: "🇫🇷", type: "country" },
  { id: "c-ga", name: "Gabon", country: "Gabon", countryCode: "GA", formatted: "Gabon (GA)", flag: "🇬🇦", type: "country" },
  { id: "c-gm", name: "Gambia", country: "Gambia", countryCode: "GM", formatted: "Gambia (GM)", flag: "🇬🇲", type: "country" },
  { id: "c-ge", name: "Georgia", country: "Georgia", countryCode: "GE", formatted: "Georgia (GE)", flag: "🇬🇪", type: "country" },
  { id: "c-de", name: "Germany", country: "Germany", countryCode: "DE", formatted: "Germany (DE)", flag: "🇩🇪", type: "country", aliases: ["Deutschland"] },
  { id: "c-gh", name: "Ghana", country: "Ghana", countryCode: "GH", formatted: "Ghana (GH)", flag: "🇬🇭", type: "country" },
  { id: "c-gr", name: "Greece", country: "Greece", countryCode: "GR", formatted: "Greece (GR)", flag: "🇬🇷", type: "country", aliases: ["Hellas"] },
  { id: "c-gd", name: "Grenada", country: "Grenada", countryCode: "GD", formatted: "Grenada (GD)", flag: "🇬🇩", type: "country" },
  { id: "c-gt", name: "Guatemala", country: "Guatemala", countryCode: "GT", formatted: "Guatemala (GT)", flag: "🇬🇹", type: "country" },
  { id: "c-gn", name: "Guinea", country: "Guinea", countryCode: "GN", formatted: "Guinea (GN)", flag: "🇬🇳", type: "country" },
  { id: "c-gw", name: "Guinea-Bissau", country: "Guinea-Bissau", countryCode: "GW", formatted: "Guinea-Bissau (GW)", flag: "🇬🇼", type: "country" },
  { id: "c-gy", name: "Guyana", country: "Guyana", countryCode: "GY", formatted: "Guyana (GY)", flag: "🇬🇾", type: "country" },
  { id: "c-ht", name: "Haiti", country: "Haiti", countryCode: "HT", formatted: "Haiti (HT)", flag: "🇭🇹", type: "country" },
  { id: "c-hn", name: "Honduras", country: "Honduras", countryCode: "HN", formatted: "Honduras (HN)", flag: "🇭🇳", type: "country" },
  { id: "c-hk", name: "Hong Kong", country: "Hong Kong", countryCode: "HK", formatted: "Hong Kong (HK)", flag: "🇭🇰", type: "country", aliases: ["HK"] },
  { id: "c-hu", name: "Hungary", country: "Hungary", countryCode: "HU", formatted: "Hungary (HU)", flag: "🇭🇺", type: "country", aliases: ["Magyarország"] },
  { id: "c-is", name: "Iceland", country: "Iceland", countryCode: "IS", formatted: "Iceland (IS)", flag: "🇮🇸", type: "country" },
  { id: "c-in", name: "India", country: "India", countryCode: "IN", formatted: "India (IN)", flag: "🇮🇳", type: "country", aliases: ["Bharat"] },
  { id: "c-id", name: "Indonesia", country: "Indonesia", countryCode: "ID", formatted: "Indonesia (ID)", flag: "🇮🇩", type: "country" },
  { id: "c-ir", name: "Iran", country: "Iran", countryCode: "IR", formatted: "Iran (IR)", flag: "🇮🇷", type: "country" },
  { id: "c-iq", name: "Iraq", country: "Iraq", countryCode: "IQ", formatted: "Iraq (IQ)", flag: "🇮🇶", type: "country" },
  { id: "c-ie", name: "Ireland", country: "Ireland", countryCode: "IE", formatted: "Ireland (IE)", flag: "🇮🇪", type: "country", aliases: ["Éire"] },
  { id: "c-il", name: "Israel", country: "Israel", countryCode: "IL", formatted: "Israel (IL)", flag: "🇮🇱", type: "country" },
  { id: "c-it", name: "Italy", country: "Italy", countryCode: "IT", formatted: "Italy (IT)", flag: "🇮🇹", type: "country", aliases: ["Italia"] },
  { id: "c-ci", name: "Ivory Coast", country: "Ivory Coast", countryCode: "CI", formatted: "Ivory Coast (CI)", flag: "🇨🇮", type: "country", aliases: ["Côte d'Ivoire"] },
  { id: "c-jm", name: "Jamaica", country: "Jamaica", countryCode: "JM", formatted: "Jamaica (JM)", flag: "🇯🇲", type: "country" },
  { id: "c-jp", name: "Japan", country: "Japan", countryCode: "JP", formatted: "Japan (JP)", flag: "🇯🇵", type: "country", aliases: ["Nippon", "Nihon"] },
  { id: "c-jo", name: "Jordan", country: "Jordan", countryCode: "JO", formatted: "Jordan (JO)", flag: "🇯🇴", type: "country" },
  { id: "c-kz", name: "Kazakhstan", country: "Kazakhstan", countryCode: "KZ", formatted: "Kazakhstan (KZ)", flag: "🇰🇿", type: "country" },
  { id: "c-ke", name: "Kenya", country: "Kenya", countryCode: "KE", formatted: "Kenya (KE)", flag: "🇰🇪", type: "country" },
  { id: "c-kw", name: "Kuwait", country: "Kuwait", countryCode: "KW", formatted: "Kuwait (KW)", flag: "🇰🇼", type: "country" },
  { id: "c-kg", name: "Kyrgyzstan", country: "Kyrgyzstan", countryCode: "KG", formatted: "Kyrgyzstan (KG)", flag: "🇰🇬", type: "country" },
  { id: "c-la", name: "Laos", country: "Laos", countryCode: "LA", formatted: "Laos (LA)", flag: "🇱🇦", type: "country" },
  { id: "c-lv", name: "Latvia", country: "Latvia", countryCode: "LV", formatted: "Latvia (LV)", flag: "🇱🇻", type: "country" },
  { id: "c-lb", name: "Lebanon", country: "Lebanon", countryCode: "LB", formatted: "Lebanon (LB)", flag: "🇱🇧", type: "country" },
  { id: "c-ls", name: "Lesotho", country: "Lesotho", countryCode: "LS", formatted: "Lesotho (LS)", flag: "🇱🇸", type: "country" },
  { id: "c-lr", name: "Liberia", country: "Liberia", countryCode: "LR", formatted: "Liberia (LR)", flag: "🇱🇷", type: "country" },
  { id: "c-ly", name: "Libya", country: "Libya", countryCode: "LY", formatted: "Libya (LY)", flag: "🇱🇾", type: "country" },
  { id: "c-li", name: "Liechtenstein", country: "Liechtenstein", countryCode: "LI", formatted: "Liechtenstein (LI)", flag: "🇱🇮", type: "country" },
  { id: "c-lt", name: "Lithuania", country: "Lithuania", countryCode: "LT", formatted: "Lithuania (LT)", flag: "🇱🇹", type: "country" },
  { id: "c-lu", name: "Luxembourg", country: "Luxembourg", countryCode: "LU", formatted: "Luxembourg (LU)", flag: "🇱🇺", type: "country" },
  { id: "c-mg", name: "Madagascar", country: "Madagascar", countryCode: "MG", formatted: "Madagascar (MG)", flag: "🇲🇬", type: "country" },
  { id: "c-mw", name: "Malawi", country: "Malawi", countryCode: "MW", formatted: "Malawi (MW)", flag: "🇲🇼", type: "country" },
  { id: "c-my", name: "Malaysia", country: "Malaysia", countryCode: "MY", formatted: "Malaysia (MY)", flag: "🇲🇾", type: "country" },
  { id: "c-mv", name: "Maldives", country: "Maldives", countryCode: "MV", formatted: "Maldives (MV)", flag: "🇲🇻", type: "country" },
  { id: "c-ml", name: "Mali", country: "Mali", countryCode: "ML", formatted: "Mali (ML)", flag: "🇲🇱", type: "country" },
  { id: "c-mt", name: "Malta", country: "Malta", countryCode: "MT", formatted: "Malta (MT)", flag: "🇲🇹", type: "country" },
  { id: "c-mr", name: "Mauritania", country: "Mauritania", countryCode: "MR", formatted: "Mauritania (MR)", flag: "🇲🇷", type: "country" },
  { id: "c-mu", name: "Mauritius", country: "Mauritius", countryCode: "MU", formatted: "Mauritius (MU)", flag: "🇲🇺", type: "country" },
  { id: "c-mx", name: "Mexico", country: "Mexico", countryCode: "MX", formatted: "Mexico (MX)", flag: "🇲🇽", type: "country", aliases: ["México"] },
  { id: "c-md", name: "Moldova", country: "Moldova", countryCode: "MD", formatted: "Moldova (MD)", flag: "🇲🇩", type: "country" },
  { id: "c-mc", name: "Monaco", country: "Monaco", countryCode: "MC", formatted: "Monaco (MC)", flag: "🇲🇨", type: "country" },
  { id: "c-mn", name: "Mongolia", country: "Mongolia", countryCode: "MN", formatted: "Mongolia (MN)", flag: "🇲🇳", type: "country" },
  { id: "c-me", name: "Montenegro", country: "Montenegro", countryCode: "ME", formatted: "Montenegro (ME)", flag: "🇲🇪", type: "country" },
  { id: "c-ma", name: "Morocco", country: "Morocco", countryCode: "MA", formatted: "Morocco (MA)", flag: "🇲🇦", type: "country" },
  { id: "c-mz", name: "Mozambique", country: "Mozambique", countryCode: "MZ", formatted: "Mozambique (MZ)", flag: "🇲🇿", type: "country" },
  { id: "c-mm", name: "Myanmar", country: "Myanmar", countryCode: "MM", formatted: "Myanmar (MM)", flag: "🇲🇲", type: "country", aliases: ["Burma"] },
  { id: "c-na", name: "Namibia", country: "Namibia", countryCode: "NA", formatted: "Namibia (NA)", flag: "🇳🇦", type: "country" },
  { id: "c-np", name: "Nepal", country: "Nepal", countryCode: "NP", formatted: "Nepal (NP)", flag: "🇳🇵", type: "country" },
  { id: "c-nl", name: "Netherlands", country: "Netherlands", countryCode: "NL", formatted: "Netherlands (NL)", flag: "🇳🇱", type: "country", aliases: ["Holland", "Nederland"] },
  { id: "c-nz", name: "New Zealand", country: "New Zealand", countryCode: "NZ", formatted: "New Zealand (NZ)", flag: "🇳🇿", type: "country", aliases: ["Aotearoa"] },
  { id: "c-ni", name: "Nicaragua", country: "Nicaragua", countryCode: "NI", formatted: "Nicaragua (NI)", flag: "🇳🇮", type: "country" },
  { id: "c-ne", name: "Niger", country: "Niger", countryCode: "NE", formatted: "Niger (NE)", flag: "🇳🇪", type: "country" },
  { id: "c-ng", name: "Nigeria", country: "Nigeria", countryCode: "NG", formatted: "Nigeria (NG)", flag: "🇳🇬", type: "country" },
  { id: "c-kp", name: "North Korea", country: "North Korea", countryCode: "KP", formatted: "North Korea (KP)", flag: "🇰🇵", type: "country", aliases: ["DPRK"] },
  { id: "c-mk", name: "North Macedonia", country: "North Macedonia", countryCode: "MK", formatted: "North Macedonia (MK)", flag: "🇲🇰", type: "country", aliases: ["Macedonia"] },
  { id: "c-no", name: "Norway", country: "Norway", countryCode: "NO", formatted: "Norway (NO)", flag: "🇳🇴", type: "country", aliases: ["Norge"] },
  { id: "c-om", name: "Oman", country: "Oman", countryCode: "OM", formatted: "Oman (OM)", flag: "🇴🇲", type: "country" },
  { id: "c-pk", name: "Pakistan", country: "Pakistan", countryCode: "PK", formatted: "Pakistan (PK)", flag: "🇵🇰", type: "country" },
  { id: "c-ps", name: "Palestine", country: "Palestine", countryCode: "PS", formatted: "Palestine (PS)", flag: "🇵🇸", type: "country" },
  { id: "c-pa", name: "Panama", country: "Panama", countryCode: "PA", formatted: "Panama (PA)", flag: "🇵🇦", type: "country" },
  { id: "c-pg", name: "Papua New Guinea", country: "Papua New Guinea", countryCode: "PG", formatted: "Papua New Guinea (PG)", flag: "🇵🇬", type: "country" },
  { id: "c-py", name: "Paraguay", country: "Paraguay", countryCode: "PY", formatted: "Paraguay (PY)", flag: "🇵🇾", type: "country" },
  { id: "c-pe", name: "Peru", country: "Peru", countryCode: "PE", formatted: "Peru (PE)", flag: "🇵🇪", type: "country" },
  { id: "c-ph", name: "Philippines", country: "Philippines", countryCode: "PH", formatted: "Philippines (PH)", flag: "🇵🇭", type: "country" },
  { id: "c-pl", name: "Poland", country: "Poland", countryCode: "PL", formatted: "Poland (PL)", flag: "🇵🇱", type: "country", aliases: ["Polska"] },
  { id: "c-pt", name: "Portugal", country: "Portugal", countryCode: "PT", formatted: "Portugal (PT)", flag: "🇵🇹", type: "country" },
  { id: "c-qa", name: "Qatar", country: "Qatar", countryCode: "QA", formatted: "Qatar (QA)", flag: "🇶🇦", type: "country" },
  { id: "c-ro", name: "Romania", country: "Romania", countryCode: "RO", formatted: "Romania (RO)", flag: "🇷🇴", type: "country" },
  { id: "c-ru", name: "Russia", country: "Russia", countryCode: "RU", formatted: "Russia (RU)", flag: "🇷🇺", type: "country", aliases: ["Russian Federation"] },
  { id: "c-rw", name: "Rwanda", country: "Rwanda", countryCode: "RW", formatted: "Rwanda (RW)", flag: "🇷🇼", type: "country" },
  { id: "c-sa", name: "Saudi Arabia", country: "Saudi Arabia", countryCode: "SA", formatted: "Saudi Arabia (SA)", flag: "🇸🇦", type: "country", aliases: ["KSA"] },
  { id: "c-sn", name: "Senegal", country: "Senegal", countryCode: "SN", formatted: "Senegal (SN)", flag: "🇸🇳", type: "country" },
  { id: "c-rs", name: "Serbia", country: "Serbia", countryCode: "RS", formatted: "Serbia (RS)", flag: "🇷🇸", type: "country" },
  { id: "c-sc", name: "Seychelles", country: "Seychelles", countryCode: "SC", formatted: "Seychelles (SC)", flag: "🇸🇨", type: "country" },
  { id: "c-sl", name: "Sierra Leone", country: "Sierra Leone", countryCode: "SL", formatted: "Sierra Leone (SL)", flag: "🇸🇱", type: "country" },
  { id: "c-sg", name: "Singapore", country: "Singapore", countryCode: "SG", formatted: "Singapore (SG)", flag: "🇸🇬", type: "country" },
  { id: "c-sk", name: "Slovakia", country: "Slovakia", countryCode: "SK", formatted: "Slovakia (SK)", flag: "🇸🇰", type: "country" },
  { id: "c-si", name: "Slovenia", country: "Slovenia", countryCode: "SI", formatted: "Slovenia (SI)", flag: "🇸🇮", type: "country" },
  { id: "c-so", name: "Somalia", country: "Somalia", countryCode: "SO", formatted: "Somalia (SO)", flag: "🇸🇴", type: "country" },
  { id: "c-za", name: "South Africa", country: "South Africa", countryCode: "ZA", formatted: "South Africa (ZA)", flag: "🇿🇦", type: "country", aliases: ["RSA"] },
  { id: "c-kr", name: "South Korea", country: "South Korea", countryCode: "KR", formatted: "South Korea (KR)", flag: "🇰🇷", type: "country", aliases: ["ROK", "Korea"] },
  { id: "c-ss", name: "South Sudan", country: "South Sudan", countryCode: "SS", formatted: "South Sudan (SS)", flag: "🇸🇸", type: "country" },
  { id: "c-es", name: "Spain", country: "Spain", countryCode: "ES", formatted: "Spain (ES)", flag: "🇪🇸", type: "country", aliases: ["España"] },
  { id: "c-lk", name: "Sri Lanka", country: "Sri Lanka", countryCode: "LK", formatted: "Sri Lanka (LK)", flag: "🇱🇰", type: "country" },
  { id: "c-sd", name: "Sudan", country: "Sudan", countryCode: "SD", formatted: "Sudan (SD)", flag: "🇸🇩", type: "country" },
  { id: "c-sr", name: "Suriname", country: "Suriname", countryCode: "SR", formatted: "Suriname (SR)", flag: "🇸🇷", type: "country" },
  { id: "c-se", name: "Sweden", country: "Sweden", countryCode: "SE", formatted: "Sweden (SE)", flag: "🇸🇪", type: "country", aliases: ["Sverige"] },
  { id: "c-ch", name: "Switzerland", country: "Switzerland", countryCode: "CH", formatted: "Switzerland (CH)", flag: "🇨🇭", type: "country", aliases: ["Schweiz", "Suisse"] },
  { id: "c-sy", name: "Syria", country: "Syria", countryCode: "SY", formatted: "Syria (SY)", flag: "🇸🇾", type: "country" },
  { id: "c-tw", name: "Taiwan", country: "Taiwan", countryCode: "TW", formatted: "Taiwan (TW)", flag: "🇹🇼", type: "country", aliases: ["ROC"] },
  { id: "c-tj", name: "Tajikistan", country: "Tajikistan", countryCode: "TJ", formatted: "Tajikistan (TJ)", flag: "🇹🇯", type: "country" },
  { id: "c-tz", name: "Tanzania", country: "Tanzania", countryCode: "TZ", formatted: "Tanzania (TZ)", flag: "🇹🇿", type: "country" },
  { id: "c-th", name: "Thailand", country: "Thailand", countryCode: "TH", formatted: "Thailand (TH)", flag: "🇹🇭", type: "country", aliases: ["Siam"] },
  { id: "c-tg", name: "Togo", country: "Togo", countryCode: "TG", formatted: "Togo (TG)", flag: "🇹🇬", type: "country" },
  { id: "c-tt", name: "Trinidad and Tobago", country: "Trinidad and Tobago", countryCode: "TT", formatted: "Trinidad and Tobago (TT)", flag: "🇹🇹", type: "country" },
  { id: "c-tn", name: "Tunisia", country: "Tunisia", countryCode: "TN", formatted: "Tunisia (TN)", flag: "🇹🇳", type: "country" },
  { id: "c-tr", name: "Turkey", country: "Turkey", countryCode: "TR", formatted: "Turkey (TR)", flag: "🇹🇷", type: "country", aliases: ["Türkiye"] },
  { id: "c-tm", name: "Turkmenistan", country: "Turkmenistan", countryCode: "TM", formatted: "Turkmenistan (TM)", flag: "🇹🇲", type: "country" },
  { id: "c-ug", name: "Uganda", country: "Uganda", countryCode: "UG", formatted: "Uganda (UG)", flag: "🇺🇬", type: "country" },
  { id: "c-ua", name: "Ukraine", country: "Ukraine", countryCode: "UA", formatted: "Ukraine (UA)", flag: "🇺🇦", type: "country" },
  { id: "c-ae", name: "United Arab Emirates", country: "United Arab Emirates", countryCode: "AE", formatted: "United Arab Emirates (UAE)", flag: "🇦🇪", type: "country", aliases: ["UAE", "Emirates", "Dubai"] },
  { id: "c-gb", name: "United Kingdom", country: "United Kingdom", countryCode: "GB", formatted: "United Kingdom (UK)", flag: "🇬🇧", type: "country", aliases: ["UK", "Britain", "Great Britain", "England", "Scotland", "Wales"] },
  { id: "c-us", name: "United States", country: "United States", countryCode: "US", formatted: "United States (US)", flag: "🇺🇸", type: "country", aliases: ["USA", "America"] },
  { id: "c-uy", name: "Uruguay", country: "Uruguay", countryCode: "UY", formatted: "Uruguay (UY)", flag: "🇺🇾", type: "country" },
  { id: "c-uz", name: "Uzbekistan", country: "Uzbekistan", countryCode: "UZ", formatted: "Uzbekistan (UZ)", flag: "🇺🇿", type: "country" },
  { id: "c-ve", name: "Venezuela", country: "Venezuela", countryCode: "VE", formatted: "Venezuela (VE)", flag: "🇻🇪", type: "country" },
  { id: "c-vn", name: "Vietnam", country: "Vietnam", countryCode: "VN", formatted: "Vietnam (VN)", flag: "🇻🇳", type: "country" },
  { id: "c-ye", name: "Yemen", country: "Yemen", countryCode: "YE", formatted: "Yemen (YE)", flag: "🇾🇪", type: "country" },
  { id: "c-zm", name: "Zambia", country: "Zambia", countryCode: "ZM", formatted: "Zambia (ZM)", flag: "🇿🇲", type: "country" },
  { id: "c-zw", name: "Zimbabwe", country: "Zimbabwe", countryCode: "ZW", formatted: "Zimbabwe (ZW)", flag: "🇿🇼", type: "country" },
];

// Major global technology, business and regional cities
export const MAJOR_CITIES: PlaceSuggestion[] = [
  // China
  { id: "city-beijing", name: "Beijing", city: "Beijing", country: "China", countryCode: "CN", formatted: "Beijing, China", flag: "🇨🇳", type: "city" },
  { id: "city-shanghai", name: "Shanghai", city: "Shanghai", country: "China", countryCode: "CN", formatted: "Shanghai, China", flag: "🇨🇳", type: "city" },
  { id: "city-shenzhen", name: "Shenzhen", city: "Shenzhen", country: "China", countryCode: "CN", formatted: "Shenzhen, China", flag: "🇨🇳", type: "city" },
  { id: "city-guangzhou", name: "Guangzhou", city: "Guangzhou", country: "China", countryCode: "CN", formatted: "Guangzhou, China", flag: "🇨🇳", type: "city" },
  { id: "city-hangzhou", name: "Hangzhou", city: "Hangzhou", country: "China", countryCode: "CN", formatted: "Hangzhou, China", flag: "🇨🇳", type: "city" },
  { id: "city-chengdu", name: "Chengdu", city: "Chengdu", country: "China", countryCode: "CN", formatted: "Chengdu, China", flag: "🇨🇳", type: "city" },
  { id: "city-hk", name: "Hong Kong", city: "Hong Kong", country: "Hong Kong", countryCode: "HK", formatted: "Hong Kong (HK)", flag: "🇭🇰", type: "city" },
  { id: "city-taipei", name: "Taipei", city: "Taipei", country: "Taiwan", countryCode: "TW", formatted: "Taipei, Taiwan", flag: "🇹🇼", type: "city" },

  // United States
  { id: "city-nyc", name: "New York", city: "New York", state: "NY", country: "United States", countryCode: "US", formatted: "New York, NY, United States", flag: "🇺🇸", type: "city" },
  { id: "city-sf", name: "San Francisco", city: "San Francisco", state: "CA", country: "United States", countryCode: "US", formatted: "San Francisco, CA, United States", flag: "🇺🇸", type: "city", aliases: ["Bay Area", "Silicon Valley"] },
  { id: "city-la", name: "Los Angeles", city: "Los Angeles", state: "CA", country: "United States", countryCode: "US", formatted: "Los Angeles, CA, United States", flag: "🇺🇸", type: "city" },
  { id: "city-seattle", name: "Seattle", city: "Seattle", state: "WA", country: "United States", countryCode: "US", formatted: "Seattle, WA, United States", flag: "🇺🇸", type: "city" },
  { id: "city-austin", name: "Austin", city: "Austin", state: "TX", country: "United States", countryCode: "US", formatted: "Austin, TX, United States", flag: "🇺🇸", type: "city" },
  { id: "city-boston", name: "Boston", city: "Boston", state: "MA", country: "United States", countryCode: "US", formatted: "Boston, MA, United States", flag: "🇺🇸", type: "city" },
  { id: "city-chicago", name: "Chicago", city: "Chicago", state: "IL", country: "United States", countryCode: "US", formatted: "Chicago, IL, United States", flag: "🇺🇸", type: "city" },

  // Europe
  { id: "city-london", name: "London", city: "London", country: "United Kingdom", countryCode: "GB", formatted: "London, United Kingdom", flag: "🇬🇧", type: "city" },
  { id: "city-paris", name: "Paris", city: "Paris", country: "France", countryCode: "FR", formatted: "Paris, France", flag: "🇫🇷", type: "city" },
  { id: "city-berlin", name: "Berlin", city: "Berlin", country: "Germany", countryCode: "DE", formatted: "Berlin, Germany", flag: "🇩🇪", type: "city" },
  { id: "city-munich", name: "Munich", city: "Munich", country: "Germany", countryCode: "DE", formatted: "Munich, Germany", flag: "🇩🇪", type: "city" },
  { id: "city-frankfurt", name: "Frankfurt", city: "Frankfurt", country: "Germany", countryCode: "DE", formatted: "Frankfurt, Germany", flag: "🇩🇪", type: "city" },
  { id: "city-amsterdam", name: "Amsterdam", city: "Amsterdam", country: "Netherlands", countryCode: "NL", formatted: "Amsterdam, Netherlands", flag: "🇳🇱", type: "city" },
  { id: "city-madrid", name: "Madrid", city: "Madrid", country: "Spain", countryCode: "ES", formatted: "Madrid, Spain", flag: "🇪🇸", type: "city" },
  { id: "city-barcelona", name: "Barcelona", city: "Barcelona", country: "Spain", countryCode: "ES", formatted: "Barcelona, Spain", flag: "🇪🇸", type: "city" },
  { id: "city-rome", name: "Rome", city: "Rome", country: "Italy", countryCode: "IT", formatted: "Rome, Italy", flag: "🇮🇹", type: "city" },
  { id: "city-milan", name: "Milan", city: "Milan", country: "Italy", countryCode: "IT", formatted: "Milan, Italy", flag: "🇮🇹", type: "city" },
  { id: "city-dublin", name: "Dublin", city: "Dublin", country: "Ireland", countryCode: "IE", formatted: "Dublin, Ireland", flag: "🇮🇪", type: "city" },
  { id: "city-zurich", name: "Zurich", city: "Zurich", country: "Switzerland", countryCode: "CH", formatted: "Zurich, Switzerland", flag: "🇨🇭", type: "city" },
  { id: "city-stockholm", name: "Stockholm", city: "Stockholm", country: "Sweden", countryCode: "SE", formatted: "Stockholm, Sweden", flag: "🇸🇪", type: "city" },

  // Asia & Oceania
  { id: "city-tokyo", name: "Tokyo", city: "Tokyo", country: "Japan", countryCode: "JP", formatted: "Tokyo, Japan", flag: "🇯🇵", type: "city" },
  { id: "city-seoul", name: "Seoul", city: "Seoul", country: "South Korea", countryCode: "KR", formatted: "Seoul, South Korea", flag: "🇰🇷", type: "city" },
  { id: "city-singapore", name: "Singapore", city: "Singapore", country: "Singapore", countryCode: "SG", formatted: "Singapore (SG)", flag: "🇸🇬", type: "city" },
  { id: "city-sydney", name: "Sydney", city: "Sydney", state: "NSW", country: "Australia", countryCode: "AU", formatted: "Sydney, NSW, Australia", flag: "🇦🇺", type: "city" },
  { id: "city-melbourne", name: "Melbourne", city: "Melbourne", state: "VIC", country: "Australia", countryCode: "AU", formatted: "Melbourne, VIC, Australia", flag: "🇦🇺", type: "city" },
  { id: "city-mumbai", name: "Mumbai", city: "Mumbai", country: "India", countryCode: "IN", formatted: "Mumbai, India", flag: "🇮🇳", type: "city" },
  { id: "city-bengaluru", name: "Bengaluru", city: "Bengaluru", country: "India", countryCode: "IN", formatted: "Bengaluru, India", flag: "🇮🇳", type: "city", aliases: ["Bangalore"] },
  { id: "city-delhi", name: "Delhi", city: "Delhi", country: "India", countryCode: "IN", formatted: "Delhi, India", flag: "🇮🇳", type: "city", aliases: ["New Delhi"] },
  { id: "city-dubai", name: "Dubai", city: "Dubai", country: "United Arab Emirates", countryCode: "AE", formatted: "Dubai, United Arab Emirates", flag: "🇦🇪", type: "city" },
  { id: "city-bangkok", name: "Bangkok", city: "Bangkok", country: "Thailand", countryCode: "TH", formatted: "Bangkok, Thailand", flag: "🇹🇭", type: "city" },
  { id: "city-jakarta", name: "Jakarta", city: "Jakarta", country: "Indonesia", countryCode: "ID", formatted: "Jakarta, Indonesia", flag: "🇮🇩", type: "city" },
  { id: "city-toronto", name: "Toronto", city: "Toronto", state: "ON", country: "Canada", countryCode: "CA", formatted: "Toronto, ON, Canada", flag: "🇨🇦", type: "city" },
  { id: "city-vancouver", name: "Vancouver", city: "Vancouver", state: "BC", country: "Canada", countryCode: "CA", formatted: "Vancouver, BC, Canada", flag: "🇨🇦", type: "city" },
  { id: "city-saopaulo", name: "Sao Paulo", city: "Sao Paulo", country: "Brazil", countryCode: "BR", formatted: "Sao Paulo, Brazil", flag: "🇧🇷", type: "city", aliases: ["São Paulo"] },
  { id: "city-mexicocity", name: "Mexico City", city: "Mexico City", country: "Mexico", countryCode: "MX", formatted: "Mexico City, Mexico", flag: "🇲🇽", type: "city" },
  { id: "city-johannesburg", name: "Johannesburg", city: "Johannesburg", country: "South Africa", countryCode: "ZA", formatted: "Johannesburg, South Africa", flag: "🇿🇦", type: "city" },
  { id: "city-cairo", name: "Cairo", city: "Cairo", country: "Egypt", countryCode: "EG", formatted: "Cairo, Egypt", flag: "🇪🇬", type: "city" },
];

export function searchPlaces(rawQuery: string): PlaceSuggestion[] {
  const query = (rawQuery || "").trim();
  if (!query || query.length < 1) {
    return POPULAR_PRESETS;
  }

  const q = query.toLowerCase();

  // Special match for global / worldwide
  const isGlobalQuery = "global".includes(q) || "worldwide".includes(q) || "world".includes(q) || "all".includes(q);

  const scored: Array<{ place: PlaceSuggestion; score: number }> = [];
  const seenNames = new Set<string>();

  if (isGlobalQuery) {
    scored.push({ place: POPULAR_PRESETS[0], score: 200 });
    seenNames.add(POPULAR_PRESETS[0].formatted.toLowerCase());
  }

  // Combine countries and major cities
  const allEntries = [...ALL_COUNTRIES, ...MAJOR_CITIES];

  for (const item of allEntries) {
    const nameLower = item.name.toLowerCase();
    const formattedLower = item.formatted.toLowerCase();
    const codeLower = (item.countryCode || "").toLowerCase();
    const aliases = (item.aliases || []).map((a) => a.toLowerCase());

    let score = 0;

    // Exact matches
    if (nameLower === q) {
      score = 100;
    } else if (codeLower === q) {
      score = 95;
    } else if (aliases.includes(q)) {
      score = 90;
    }
    // Prefix matches
    else if (nameLower.startsWith(q)) {
      score = 80;
    } else if (codeLower.startsWith(q)) {
      score = 75;
    } else if (aliases.some((a) => a.startsWith(q))) {
      score = 70;
    }
    // Word boundary match
    else if (nameLower.includes(` ${q}`) || formattedLower.includes(` ${q}`)) {
      score = 65;
    }
    // Substring match
    else if (nameLower.includes(q)) {
      score = 55;
    } else if (formattedLower.includes(q)) {
      score = 50;
    } else if (aliases.some((a) => a.includes(q))) {
      score = 45;
    }

    if (score > 0) {
      if (!seenNames.has(formattedLower)) {
        seenNames.add(formattedLower);
        scored.push({ place: item, score });
      }
    }
  }

  // Sort by score descending, then by name length (prefer shorter canonical names)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.place.name.length - b.place.name.length;
  });

  const results = scored.slice(0, 10).map((s) => s.place);

  // If no places matched our dictionary, provide a clean custom location entry
  if (results.length === 0) {
    results.push({
      id: `custom-${encodeURIComponent(query)}`,
      name: query,
      formatted: `${query} (Custom Location)`,
      type: "custom",
      flag: "📍",
    });
  }

  return results;
}
