import type { Locale } from "@/i18n/config";

/** ISO 3166-1 alpha-2 codes (the same 245 countries and territories as the brand file's list). */
const codes = [
  "AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT",
  "BO","BA","BW","BR","IO","VG","BN","BG","BF","BI","KH","CM","CA","CV","BQ","KY","CF","TD","CL","CN","CX","CC","CO","KM","CG","CD",
  "CK","CR","CI","HR","CU","CW","CY","CZ","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF",
  "PF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HN","HK","HU","IS","IN","ID","IR","IQ",
  "IE","IM","IT","JM","JP","JE","JO","KZ","KE","KI","XK","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY",
  "MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE",
  "NG","NU","NF","KP","MK","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","WS",
  "SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","KR","SS","ES","LK","BL","SH","KN","LC","MF","PM","VC",
  "SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UY",
  "UZ","VU","VA","VE","VN","WF","EH","YE","ZM","ZW",
];

/** Countries with names in the page language, sorted alphabetically for that language. */
export function countryOptions(locale: Locale): { code: string; name: string }[] {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const collator = new Intl.Collator(locale);
  return codes
    .map((code) => ({ code, name: names.of(code) ?? code }))
    .sort((a, b) => collator.compare(a.name, b.name));
}
