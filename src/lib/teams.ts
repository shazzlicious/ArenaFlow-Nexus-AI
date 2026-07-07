export interface Team {
  code: string;
  name: string;
  flag: string;
  primary: string; // hex
  accent: string; // hex
}

// A representative subset of qualified/expected 2026 nations.
export const TEAMS: Team[] = [
  { code: "ARG", name: "Argentina", flag: "🇦🇷", primary: "#75AADB", accent: "#F6B40E" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷", primary: "#FFDF00", accent: "#009C3B" },
  { code: "FRA", name: "France", flag: "🇫🇷", primary: "#0055A4", accent: "#EF4135" },
  { code: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary: "#FFFFFF", accent: "#CE1124" },
  { code: "ESP", name: "Spain", flag: "🇪🇸", primary: "#AA151B", accent: "#F1BF00" },
  { code: "GER", name: "Germany", flag: "🇩🇪", primary: "#DD0000", accent: "#FFCE00" },
  { code: "POR", name: "Portugal", flag: "🇵🇹", primary: "#046A38", accent: "#DA291C" },
  { code: "NED", name: "Netherlands", flag: "🇳🇱", primary: "#FF6C00", accent: "#21468B" },
  { code: "ITA", name: "Italy", flag: "🇮🇹", primary: "#0066CC", accent: "#009246" },
  { code: "USA", name: "United States", flag: "🇺🇸", primary: "#3C3B6E", accent: "#B22234" },
  { code: "MEX", name: "Mexico", flag: "🇲🇽", primary: "#006847", accent: "#CE1126" },
  { code: "CAN", name: "Canada", flag: "🇨🇦", primary: "#D80621", accent: "#FFFFFF" },
  { code: "JPN", name: "Japan", flag: "🇯🇵", primary: "#BC002D", accent: "#0A2463" },
  { code: "KOR", name: "South Korea", flag: "🇰🇷", primary: "#003478", accent: "#C60C30" },
  { code: "AUS", name: "Australia", flag: "🇦🇺", primary: "#00843D", accent: "#FFCD00" },
  { code: "BEL", name: "Belgium", flag: "🇧🇪", primary: "#ED2939", accent: "#FDDA24" },
  { code: "CRO", name: "Croatia", flag: "🇭🇷", primary: "#171796", accent: "#FF0000" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾", primary: "#0038A8", accent: "#FCD116" },
  { code: "MAR", name: "Morocco", flag: "🇲🇦", primary: "#C1272D", accent: "#006233" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", primary: "#00853F", accent: "#FDEF42" },
  { code: "SUI", name: "Switzerland", flag: "🇨🇭", primary: "#DA291C", accent: "#FFFFFF" },
  { code: "COL", name: "Colombia", flag: "🇨🇴", primary: "#FCD116", accent: "#003893" },
  { code: "IND", name: "India", flag: "🇮🇳", primary: "#FF9933", accent: "#138808" },
  { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", primary: "#006C35", accent: "#FFFFFF" },
];

export const DEFAULT_TEAM = TEAMS[0];

export function getTeam(code: string): Team {
  return TEAMS.find((t) => t.code === code) ?? DEFAULT_TEAM;
}
