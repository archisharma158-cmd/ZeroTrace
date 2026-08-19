import { Code2, BriefcaseBusiness, Mail, Network } from "lucide-react";
import "../../styles/team.css";

const TEAM_LINKS = {
  parth: { github: "ADD_GITHUB_URL", linkedin: "ADD_LINKEDIN_URL", email: "ADD_EMAIL" },
  archi: { github: "ADD_GITHUB_URL", linkedin: "ADD_LINKEDIN_URL", email: "ADD_EMAIL" },
  annu: { github: "ADD_GITHUB_URL", linkedin: "ADD_LINKEDIN_URL", email: "ADD_EMAIL" },
};
const members = [
  { key: "parth", initials: "PG", name: "Parth Goyal", role: "Frontend / Product / Cybersecurity", bio: "Shapes the ZeroTrace product experience, frontend systems and security-first evaluation workflows." },
  { key: "archi", initials: "AS", name: "Archi Sharma", role: "Backend / AI-ML / Engineering", bio: "Builds the engineering foundation that turns AI-agent traces into structured reliability signals." },
  { key: "annu", initials: "AS", name: "Annu Sharma", role: "AI / Research / Engineering", bio: "Explores evaluation methods and translates AI reliability research into practical testing capabilities." },
];
function ContactButton({ type, value }) {
  const Icon = type === "github" ? Code2 : type === "linkedin" ? BriefcaseBusiness : Mail;
  const ready = !value.startsWith("ADD_");
  return <a className={!ready ? "is-placeholder" : ""} href={ready ? (type === "email" ? `mailto:${value}` : value) : undefined} aria-disabled={!ready} title={!ready ? "Add team link in TEAM_LINKS" : type}><Icon size={16} /><span>{type}</span></a>;
}
function Team() { return <div className="team-page zt-subpage">
  <section className="zt-page-hero"><span>ZEROTRACE / PEOPLE</span><h1>Meet the <em>ZeroTrace Team</em></h1><p>Three builders focused on AI reliability, cybersecurity and emerging technology.</p></section>
  <section className="team-grid">{members.map((member, index) => <article className="team-card" key={member.key}><div className="team-card-top"><div className="team-avatar">{member.initials}</div><span>0{index + 1}</span></div><h2>{member.name}</h2><strong>{member.role}</strong><p>{member.bio}</p><small>Quantum University, Roorkee</small><div className="team-links">{Object.entries(TEAM_LINKS[member.key]).map(([type, value]) => <ContactButton key={type} type={type} value={value} />)}</div></article>)}</section>
  <section className="team-collab"><Network /><div><span>COLLABORATION / 2026</span><h2>Built at Quantum University</h2><p>A multidisciplinary student team combining product thinking, security, AI research and engineering.</p></div></section>
</div>; }
export default Team;
