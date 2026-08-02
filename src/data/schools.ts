import type { School, SchoolType } from "@/lib/types";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const mk = (name: string, state: string, type: SchoolType): School => ({
  id: slug(name),
  name,
  state,
  type,
});

export const schools: School[] = [
  mk("University of Lagos", "Lagos", "university"),
  mk("University of Ibadan", "Oyo", "university"),
  mk("Obafemi Awolowo University", "Osun", "university"),
  mk("University of Nigeria, Nsukka", "Enugu", "university"),
  mk("Ahmadu Bello University", "Kaduna", "university"),
  mk("University of Benin", "Edo", "university"),
  mk("University of Ilorin", "Kwara", "university"),
  mk("Lagos State University", "Lagos", "university"),
  mk("Federal University of Technology, Akure", "Ondo", "university"),
  mk("Federal University of Technology, Minna", "Niger", "university"),
  mk("Federal University of Technology, Owerri", "Imo", "university"),
  mk("Nnamdi Azikiwe University", "Anambra", "university"),
  mk("University of Calabar", "Cross River", "university"),
  mk("University of Uyo", "Akwa Ibom", "university"),
  mk("University of Port Harcourt", "Rivers", "university"),
  mk("University of Maiduguri", "Borno", "university"),
  mk("Bayero University, Kano", "Kano", "university"),
  mk("University of Jos", "Plateau", "university"),
  mk("Federal University of Agriculture, Abeokuta", "Ogun", "university"),
  mk("Olabisi Onabanjo University", "Ogun", "university"),
  mk("Covenant University", "Ogun", "university"),
  mk("Babcock University", "Ogun", "university"),
  mk("Pan-Atlantic University", "Lagos", "university"),
  mk("Adekunle Ajasin University, Akungba", "Ondo", "university"),
  mk("Ekiti State University", "Ekiti", "university"),
  mk("Ladoke Akintola University of Technology", "Oyo", "university"),
  mk("Delta State University", "Delta", "university"),
  mk("Ambrose Alli University, Ekpoma", "Edo", "university"),
  mk("Rivers State University", "Rivers", "university"),
  mk("Benue State University", "Benue", "university"),
  mk("Nasarawa State University, Keffi", "Nasarawa", "university"),
  mk("Kogi State University, Anyigba", "Kogi", "university"),
  mk("Abia State University, Uturu", "Abia", "university"),
  mk("Imo State University, Owerri", "Imo", "university"),
  mk("Chukwuemeka Odumegwu Ojukwu University", "Anambra", "university"),
  mk("Enugu State University of Science and Technology", "Enugu", "university"),
  mk("Michael Okpara University of Agriculture, Umudike", "Abia", "university"),
  mk("Federal University, Oye-Ekiti", "Ekiti", "university"),
  mk("Federal University, Lafia", "Nasarawa", "university"),
  mk("Federal University, Lokoja", "Kogi", "university"),
  mk("Usmanu Danfodiyo University, Sokoto", "Sokoto", "university"),
  mk("Kaduna State University", "Kaduna", "university"),
  mk("Niger Delta University", "Bayelsa", "university"),
  mk("Afe Babalola University, Ado-Ekiti", "Ekiti", "university"),
  mk("Redeemer's University", "Osun", "university"),
  mk("Ajayi Crowther University", "Oyo", "university"),
  mk("Achievers University, Owo", "Ondo", "university"),
  mk("Lead City University", "Oyo", "university"),
  mk("Kwara State University", "Kwara", "university"),
  mk("Taraba State University, Jalingo", "Taraba", "university"),
  mk("Gombe State University", "Gombe", "university"),
  mk("Sokoto State University", "Sokoto", "university"),
  mk("Yaba College of Technology", "Lagos", "polytechnic"),
  mk("Federal Polytechnic, Ilaro", "Ogun", "polytechnic"),
  mk("Federal Polytechnic, Bida", "Niger", "polytechnic"),
  mk("Federal Polytechnic, Offa", "Kwara", "polytechnic"),
  mk("Federal Polytechnic, Auchi", "Edo", "polytechnic"),
  mk("Federal Polytechnic, Nekede", "Imo", "polytechnic"),
  mk("Federal Polytechnic, Ado-Ekiti", "Ekiti", "polytechnic"),
  mk("Federal Polytechnic, Idah", "Kogi", "polytechnic"),
  mk("Kaduna Polytechnic", "Kaduna", "polytechnic"),
  mk("Kwara State Polytechnic, Ilorin", "Kwara", "polytechnic"),
  mk("Moshood Abiola Polytechnic", "Ogun", "polytechnic"),
  mk("Osun State Polytechnic, Iree", "Osun", "polytechnic"),
  mk("Rufus Giwa Polytechnic, Owo", "Ondo", "polytechnic"),
  mk("Petroleum Training Institute, Effurun", "Delta", "polytechnic"),
  mk("Akanu Ibiam Federal Polytechnic, Unwana", "Ebonyi", "polytechnic"),
  mk("Adeyemi College of Education, Ondo", "Ondo", "college"),
  mk("Alvan Ikoku Federal College of Education", "Imo", "college"),
  mk("Federal College of Education, Kano", "Kano", "college"),
  mk("Federal College of Education (Technical), Akoka", "Lagos", "college"),
  mk("College of Education, Ikere-Ekiti", "Ekiti", "college"),
  mk("NCE Akamkpa", "Cross River", "college"),
];

export function getSchool(id: string): School | undefined {
  return schools.find((s) => s.id === id);
}

export function searchSchools(query: string, limit = 8): School[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return schools
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
