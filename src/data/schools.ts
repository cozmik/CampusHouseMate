import type { School, SchoolType } from "@/lib/types";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const mk = (
  name: string,
  state: string,
  type: SchoolType,
  acronym: string,
  aliases?: string[],
): School => ({
  id: slug(name),
  name,
  state,
  type,
  acronym,
  aliases,
});

export const schools: School[] = [
  mk("University of Lagos", "Lagos", "university", "UNILAG"),
  mk("University of Ibadan", "Oyo", "university", "UI"),
  mk("Obafemi Awolowo University", "Osun", "university", "OAU"),
  mk("University of Nigeria, Nsukka", "Enugu", "university", "UNN"),
  mk("Ahmadu Bello University", "Kaduna", "university", "ABU"),
  mk("University of Benin", "Edo", "university", "UNIBEN"),
  mk("University of Ilorin", "Kwara", "university", "UNILORIN"),
  mk("Lagos State University", "Lagos", "university", "LASU"),
  mk("Federal University of Technology, Akure", "Ondo", "university", "FUTA"),
  mk("Federal University of Technology, Minna", "Niger", "university", "FUTMINNA"),
  mk("Federal University of Technology, Owerri", "Imo", "university", "FUTO"),
  mk("Nnamdi Azikiwe University", "Anambra", "university", "UNIZIK"),
  mk("University of Calabar", "Cross River", "university", "UNICAL"),
  mk("University of Uyo", "Akwa Ibom", "university", "UNIUYO"),
  mk("University of Port Harcourt", "Rivers", "university", "UNIPORT"),
  mk("University of Maiduguri", "Borno", "university", "UNIMAID"),
  mk("Bayero University, Kano", "Kano", "university", "BUK"),
  mk("University of Jos", "Plateau", "university", "UNIJOS"),
  mk("Federal University of Agriculture, Abeokuta", "Ogun", "university", "FUNAAB"),
  mk("Olabisi Onabanjo University", "Ogun", "university", "OOU"),
  mk("Covenant University", "Ogun", "university", "CU"),
  mk("Babcock University", "Ogun", "university", "BABCOCK"),
  mk("Pan-Atlantic University", "Lagos", "university", "PAU"),
  mk("Adekunle Ajasin University, Akungba", "Ondo", "university", "AAUA"),
  mk("Ekiti State University", "Ekiti", "university", "EKSU"),
  mk("Ladoke Akintola University of Technology", "Oyo", "university", "LAUTECH"),
  mk("Delta State University", "Delta", "university", "DELSU"),
  mk("Ambrose Alli University, Ekpoma", "Edo", "university", "AAU"),
  mk("Rivers State University", "Rivers", "university", "RSU", ["RSUST"]),
  mk("Benue State University", "Benue", "university", "BSU"),
  mk("Nasarawa State University, Keffi", "Nasarawa", "university", "NSUK"),
  mk("Kogi State University, Anyigba", "Kogi", "university", "KSU"),
  mk("Abia State University, Uturu", "Abia", "university", "ABSU"),
  mk("Imo State University, Owerri", "Imo", "university", "IMSU"),
  mk("Chukwuemeka Odumegwu Ojukwu University", "Anambra", "university", "COOU"),
  mk("Enugu State University of Science and Technology", "Enugu", "university", "ESUT"),
  mk("Michael Okpara University of Agriculture, Umudike", "Abia", "university", "MOUAU"),
  mk("Federal University, Oye-Ekiti", "Ekiti", "university", "FUOYE"),
  mk("Federal University, Lafia", "Nasarawa", "university", "FULAFIA"),
  mk("Federal University, Lokoja", "Kogi", "university", "FULOKOJA"),
  mk("Usmanu Danfodiyo University, Sokoto", "Sokoto", "university", "UDUS", ["UDUSOK"]),
  mk("Kaduna State University", "Kaduna", "university", "KASU"),
  mk("Niger Delta University", "Bayelsa", "university", "NDU"),
  mk("Afe Babalola University, Ado-Ekiti", "Ekiti", "university", "ABUAD"),
  mk("Redeemer's University", "Osun", "university", "RUN"),
  mk("Ajayi Crowther University", "Oyo", "university", "ACU"),
  mk("Achievers University, Owo", "Ondo", "university", "ACHIEVERS"),
  mk("Lead City University", "Oyo", "university", "LCU"),
  mk("Kwara State University", "Kwara", "university", "KWASU"),
  mk("Taraba State University, Jalingo", "Taraba", "university", "TASU"),
  mk("Gombe State University", "Gombe", "university", "GSU"),
  mk("Sokoto State University", "Sokoto", "university", "SSU"),
  mk("University of Abuja", "Federal Capital Territory", "university", "UNIABUJA"),
  mk("National Open University of Nigeria", "Federal Capital Territory", "university", "NOUN"),
  mk("Abubakar Tafawa Balewa University", "Bauchi", "university", "ATBU"),
  mk("Modibbo Adama University, Yola", "Adamawa", "university", "MAUTECH", ["MAU"]),
  mk("Federal University of Petroleum Resources, Effurun", "Delta", "university", "FUPRE"),
  mk("Alex Ekwueme Federal University, Ndufu-Alike", "Ebonyi", "university", "FUNAI", ["AE-FUNAI", "AEFUNAI"]),
  mk("Federal University, Otuoke", "Bayelsa", "university", "FUOTUOKE"),
  mk("Federal University, Dutse", "Jigawa", "university", "FUD"),
  mk("Federal University, Dutsin-Ma", "Katsina", "university", "FUDMA"),
  mk("Federal University, Kashere", "Gombe", "university", "FUKASHERE"),
  mk("Federal University, Wukari", "Taraba", "university", "FUWUKARI"),
  mk("Federal University, Birnin Kebbi", "Kebbi", "university", "FUBK"),
  mk("Federal University, Gashua", "Yobe", "university", "FUGASHUA"),
  mk("Federal University, Gusau", "Zamfara", "university", "FUGUS"),
  mk("Joseph Sarwuan Tarka University, Makurdi", "Benue", "university", "JOSTUM", ["UAM", "FUAM"]),
  mk("Osun State University", "Osun", "university", "UNIOSUN"),
  mk("Ebonyi State University", "Ebonyi", "university", "EBSU"),
  mk("Akwa Ibom State University", "Akwa Ibom", "university", "AKSU"),
  mk("University of Cross River State", "Cross River", "university", "UNICROSS", ["CRUTECH"]),
  mk("Tai Solarin University of Education", "Ogun", "university", "TASUED"),
  mk("Lagos State University of Science and Technology", "Lagos", "university", "LASUSTECH"),
  mk("Landmark University", "Kwara", "university", "LANDMARK"),
  mk("Bowen University", "Osun", "university", "BOWEN"),
  mk("American University of Nigeria", "Adamawa", "university", "AUN"),
  mk("Nile University of Nigeria", "Federal Capital Territory", "university", "NILE"),
  mk("Veritas University", "Federal Capital Territory", "university", "VERITAS"),
  mk("Madonna University", "Anambra", "university", "MADONNA"),
  mk("Igbinedion University, Okada", "Edo", "university", "IUO"),
  mk("Caleb University", "Lagos", "university", "CALEB"),
  mk("Benson Idahosa University", "Edo", "university", "BIU"),
  mk("Yaba College of Technology", "Lagos", "polytechnic", "YABATECH"),
  mk("Federal Polytechnic, Ilaro", "Ogun", "polytechnic", "ILARO"),
  mk("Federal Polytechnic, Bida", "Niger", "polytechnic", "BIDA"),
  mk("Federal Polytechnic, Offa", "Kwara", "polytechnic", "OFFA"),
  mk("Federal Polytechnic, Auchi", "Edo", "polytechnic", "AUCHI"),
  mk("Federal Polytechnic, Nekede", "Imo", "polytechnic", "NEKEDE"),
  mk("Federal Polytechnic, Ado-Ekiti", "Ekiti", "polytechnic", "ADO POLY"),
  mk("Federal Polytechnic, Idah", "Kogi", "polytechnic", "IDAH"),
  mk("Kaduna Polytechnic", "Kaduna", "polytechnic", "KADPOLY"),
  mk("Kwara State Polytechnic, Ilorin", "Kwara", "polytechnic", "KWARAPOLY"),
  mk("Moshood Abiola Polytechnic", "Ogun", "polytechnic", "MAPOLY"),
  mk("Osun State Polytechnic, Iree", "Osun", "polytechnic", "OSPOLY"),
  mk("Rufus Giwa Polytechnic, Owo", "Ondo", "polytechnic", "RUGIPO"),
  mk("Petroleum Training Institute, Effurun", "Delta", "polytechnic", "PTI"),
  mk("Akanu Ibiam Federal Polytechnic, Unwana", "Ebonyi", "polytechnic", "UNWANA"),
  mk("The Polytechnic, Ibadan", "Oyo", "polytechnic", "IBADAN POLY"),
  mk("Federal Polytechnic, Ede", "Osun", "polytechnic", "EDE"),
  mk("Federal Polytechnic, Oko", "Anambra", "polytechnic", "OKO"),
  mk("Institute of Management and Technology, Enugu", "Enugu", "polytechnic", "IMT"),
  mk("Federal Polytechnic, Nasarawa", "Nasarawa", "polytechnic", "NASPOLY"),
  mk("Kano State Polytechnic", "Kano", "polytechnic", "KANOPOLY"),
  mk("Plateau State Polytechnic, Barkin Ladi", "Plateau", "polytechnic", "PLAPOLY"),
  mk("Adeyemi College of Education, Ondo", "Ondo", "college", "ADEYEMI"),
  mk("Alvan Ikoku Federal College of Education", "Imo", "college", "ALVAN"),
  mk("Federal College of Education, Kano", "Kano", "college", "FCE KANO"),
  mk("Federal College of Education (Technical), Akoka", "Lagos", "college", "FCET AKOKA"),
  mk("College of Education, Ikere-Ekiti", "Ekiti", "college", "COE IKERE"),
  mk("NCE Akamkpa", "Cross River", "college", "AKAMKPA"),
];

function searchTerms(s: School): string[] {
  return [s.name, s.acronym, s.state, ...(s.aliases ?? [])];
}

function searchScore(s: School, q: string): number {
  const acronym = s.acronym.toLowerCase();
  const aliases = (s.aliases ?? []).map((a) => a.toLowerCase());
  const name = s.name.toLowerCase();
  if (acronym === q || aliases.includes(q)) return 0;
  if (acronym.startsWith(q) || aliases.some((a) => a.startsWith(q))) return 1;
  if (name.startsWith(q)) return 2;
  if (searchTerms(s).some((t) => t.toLowerCase().includes(q))) return 3;
  return -1;
}

export function getSchool(id: string): School | undefined {
  return schools.find((s) => s.id === id);
}

export function schoolsForState(state: string): School[] {
  return schools
    .filter((s) => s.state === state)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function searchSchools(query: string, limit = 8, pool: School[] = schools): School[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return pool
    .map((s) => ({ school: s, score: searchScore(s, q) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => a.score - b.score || a.school.name.localeCompare(b.school.name))
    .slice(0, limit)
    .map((r) => r.school);
}
