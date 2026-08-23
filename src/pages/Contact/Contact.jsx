import { useState } from "react";
import { Code2, GraduationCap, BriefcaseBusiness, Mail, Send, Loader2 } from "lucide-react";
import "../../styles/contact.css";

const CONTACT_LINKS = {
  email: "zerotrace347489@gmail.com",
  github: "https://github.com/archisharma158-cmd/ZeroTrace",
  linkedin: "https://linkedin.com/company/zerotrace",
  university: "Quantum University, Roorkee"
};

const cards = [
  ["Email", Mail, "email"],
  ["GitHub", Code2, "github"],
  ["LinkedIn", BriefcaseBusiness, "linkedin"],
  ["Quantum University", GraduationCap, "university"]
];

const faqs = [
  ["What is ZeroTrace?", "An AI reliability and security platform for stress-testing autonomous AI agents."],
  ["What is TRASY?", "The Autonomous AI Reliability Engine at the core of ZeroTrace."],
  ["Who built ZeroTrace?", "Parth Goyal, Archi Sharma and Annu Sharma."],
  ["Where is the team based academically?", "Quantum University, Roorkee."]
];

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const next = {};
    const nameTrim = formData.name.trim();
    const emailTrim = formData.email.trim();
    const subjectTrim = formData.subject.trim();
    const messageTrim = formData.message.trim();

    if (!nameTrim) {
      next.name = "Name is required.";
    } else if (nameTrim.length > 100) {
      next.name = "Name must be 100 characters or fewer.";
    }

    if (!emailTrim) {
      next.email = "Enter a valid email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      next.email = "Enter a valid email address.";
    }

    if (!subjectTrim) {
      next.subject = "Subject is required.";
    } else if (subjectTrim.length > 200) {
      next.subject = "Subject must be 200 characters or fewer.";
    }

    if (!messageTrim) {
      next.message = "Message is required.";
    } else if (messageTrim.length < 10) {
      next.message = "Please enter at least 10 characters.";
    } else if (messageTrim.length > 5000) {
      next.message = "Message must be 5000 characters or fewer.";
    }

    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setSuccessMessage("");
    setErrorMessage("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };

      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        setSuccessMessage(result.message || "Message sent successfully. We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setErrors({});
      } else {
        const errorDetail = result.detail || result.message || "Unable to send your message. Please try again.";
        setErrorMessage(errorDetail);
      }
    } catch {
      setErrorMessage("Unable to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page zt-subpage">
      <section className="zt-page-hero">
        <span>ZEROTRACE / CONTACT</span>
        <h1>Let&apos;s <em>Connect</em></h1>
        <p>Have a question, collaboration idea, research opportunity or AI reliability challenge?</p>
      </section>

      <section className="contact-cards">
        {cards.map(([label, Icon, key]) => {
          const isEmail = key === "email";
          const isLink = key !== "university";
          const href = isEmail ? `mailto:${CONTACT_LINKS[key]}` : CONTACT_LINKS[key];
          const isExternal = !isEmail && isLink;
          const ariaLabel = isEmail
            ? "Email ZeroTrace"
            : key === "github"
            ? "Open ZeroTrace GitHub repository"
            : key === "linkedin"
            ? "Open ZeroTrace LinkedIn page"
            : undefined;

          return (
            <article key={key}>
              {isLink ? (
                <a
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-label={ariaLabel}
                  style={{ display: "block", color: "inherit", textDecoration: "none" }}
                >
                  <Icon />
                  <span>{label}</span>
                  <small>{CONTACT_LINKS[key]}</small>
                </a>
              ) : (
                <>
                  <Icon />
                  <span>{label}</span>
                  <small>{CONTACT_LINKS[key]}</small>
                </>
              )}
            </article>
          );
        })}
      </section>

      <section className="contact-layout">
        <div>
          <span className="zt-kicker">START A CONVERSATION</span>
          <h2>Bring us your hardest AI reliability question.</h2>
          <p>
            Share the context and intended use. Our engineering team reviews all inquiries and will follow up with you.
          </p>
        </div>

        <form onSubmit={submit} noValidate>
          <label>
            Name
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              maxLength={100}
              aria-invalid={Boolean(errors.name)}
              disabled={loading}
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              maxLength={255}
              aria-invalid={Boolean(errors.email)}
              disabled={loading}
            />
            {errors.email && <small>{errors.email}</small>}
          </label>

          <label>
            Subject
            <input
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What would you like to discuss?"
              maxLength={200}
              aria-invalid={Boolean(errors.subject)}
              disabled={loading}
            />
            {errors.subject && <small>{errors.subject}</small>}
          </label>

          <label>
            Message
            <textarea
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us more about your AI agent, evaluation requirements, or questions..."
              maxLength={5000}
              aria-invalid={Boolean(errors.message)}
              disabled={loading}
            />
            {errors.message && <small>{errors.message}</small>}
          </label>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                Sending... <Loader2 size={16} className="zt-spin" />
              </>
            ) : (
              <>
                Send Message <Send size={16} />
              </>
            )}
          </button>

          {successMessage && (
            <p className="form-success" role="status">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </section>

      <section className="faq-section">
        <span className="zt-kicker">FAQ / QUICK ANSWERS</span>
        <h2>Frequently asked questions</h2>
        <div>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Contact;
