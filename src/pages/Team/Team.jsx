import { Code2, BriefcaseBusiness, Mail, Network } from "lucide-react";
import "../../styles/team.css";

const TEAM_LINKS = {
  parth: {
    github: "https://github.com/goyalparth61-netizen",
    linkedin: "https://www.linkedin.com/in/parth-goyal-215231385/",
    email: "goyalparth61@gmail.com",
  },
  archi: {
    github: "https://github.com/archisharma158-cmd",
    linkedin: "https://www.linkedin.com/in/archisharma158/",
    email: "archisharma158@gmail.com",
  },
  annu: {
    github: "https://github.com/annusharma14oct-ai",
    linkedin: "https://www.linkedin.com/in/annu-sharma-41425b383/",
    email: "annusharma14oct@gmail.com",
  },
};

const members = [
  {
    key: "parth",
    initials: "PG",
    name: "Parth Goyal",
    role: "Frontend / Product / Cybersecurity",
    bio: "Shapes the ZeroTrace product experience, frontend systems and security-first evaluation workflows.",
  },
  {
    key: "archi",
    initials: "AS",
    name: "Archi Sharma",
    role: "Backend / AI-ML / Engineering",
    bio: "Builds the engineering foundation that turns AI-agent traces into structured reliability signals.",
  },
  {
    key: "annu",
    initials: "AS",
    name: "Annu Sharma",
    role: "AI / Research / Engineering",
    bio: "Explores evaluation methods and translates AI reliability research into practical testing capabilities.",
  },
];

function ContactButton({ type, value, memberName }) {
  const Icon = type === "github" ? Code2 : type === "linkedin" ? BriefcaseBusiness : Mail;
  const isExternal = type !== "email";
  const href = type === "email" ? `mailto:${value}` : value;
  const label = type === "email" ? `Email ${memberName}` : `${memberName} ${type === "github" ? "GitHub" : "LinkedIn"}`;

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
      <span>{type}</span>
    </a>
  );
}

function Team() {
  return (
    <div className="team-page zt-subpage">
      <section className="zt-page-hero">
        <span>ZEROTRACE / PEOPLE</span>
        <h1>
          Meet the <em>ZeroTrace Team</em>
        </h1>
        <p>Three builders focused on AI reliability, cybersecurity and emerging technology.</p>
      </section>

      <section className="team-grid">
        {members.map((member, index) => (
          <article className="team-card" key={member.key}>
            <div className="team-card-top">
              <div className="team-avatar">{member.initials}</div>
              <span>0{index + 1}</span>
            </div>
            <h2>{member.name}</h2>
            <strong>{member.role}</strong>
            <p>{member.bio}</p>
            <small>Quantum University, Roorkee</small>
            <div className="team-links">
              {Object.entries(TEAM_LINKS[member.key]).map(([type, value]) => (
                <ContactButton key={type} type={type} value={value} memberName={member.name} />
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="team-collab">
        <Network />
        <div>
          <span>COLLABORATION / 2026</span>
          <h2>Built at Quantum University</h2>
          <p>
            A multidisciplinary student team combining product thinking, security, AI research and engineering.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Team;
