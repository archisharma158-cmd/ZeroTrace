import React from "react";
import "./about.css";

export default function About() {
  return (
    <main className="zt-about">

      <section className="about-hero">
        <span className="zt-eyebrow">ZEROTRACE / ABOUT</span>
        <h1>Building Trust in <span>AI.</span></h1>
        <p>
          ZeroTrace is an AI reliability and adversarial evaluation platform
          designed to test, analyze and understand how AI agents behave under
          challenging real-world scenarios.
        </p>
      </section>

      <section className="about-grid">

        <article>
          <span>01</span>
          <h2>What is ZeroTrace?</h2>
          <p>
            ZeroTrace provides a structured environment for evaluating AI
            systems through adversarial scenarios, behavioral analysis,
            reliability scoring and detailed reporting.
          </p>
        </article>

        <article>
          <span>02</span>
          <h2>Meet TRASY</h2>
          <p>
            TRASY is the autonomous evaluation engine of ZeroTrace. It helps
            identify weaknesses, inconsistent behavior and reliability risks
            across AI agents.
          </p>
        </article>

        <article>
          <span>03</span>
          <h2>Our Mission</h2>
          <p>
            Our mission is to make AI evaluation more accessible, transparent
            and practical for developers, researchers and organizations.
          </p>
        </article>

      </section>

      <section className="about-university">
        <span className="zt-eyebrow">TEAM / QUANTUM UNIVERSITY</span>
        <h2>Built by students. Designed for the future.</h2>
        <p>
          ZeroTrace is developed by a student team from Quantum University,
          Roorkee, combining cybersecurity, artificial intelligence and
          software development.
        </p>
      </section>

    </main>
  );
}
