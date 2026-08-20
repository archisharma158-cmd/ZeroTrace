<p align="center">
  <img src="./assets/zerotrace-logo.png" alt="ZeroTrace Logo" width="150" />
</p>

<h1 align="center">ZeroTrace</h1>

<p align="center">
  <strong>Making Autonomous AI Agents Reliable, Explainable & Predictable</strong>
</p>

<p align="center">
  ZeroTrace evaluates how autonomous agents reason, use tools, recover from errors, and complete tasks—not merely what they say at the end.
</p>

<p align="center">
  <a href="<LIVE_DEMO_URL>">Live Demo</a>
  ·
  <a href="#-how-zerotrace-works">Architecture</a>
  ·
  <a href="#-getting-started">Getting Started</a>
  ·
  <a href="#-api-overview">API</a>
  ·
  <a href="#-meet-the-team">Team</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ZeroTrace-Agent_Reliability-FF6A00?style=for-the-badge&labelColor=080706" alt="ZeroTrace" />
  <img src="https://img.shields.io/badge/Python-Backend-E85D04?style=for-the-badge&logo=python&logoColor=white&labelColor=080706" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-API-FF6A00?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=080706" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-Frontend-E85D04?style=for-the-badge&logo=react&logoColor=white&labelColor=080706" alt="React" />
  <img src="https://img.shields.io/badge/Hackathon-2026-FF8C32?style=for-the-badge&labelColor=080706" alt="Hackathon 2026" />
</p>

<p align="center">
  <img
    src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&pause=900&color=FF6A00&center=true&vCenter=true&width=650&lines=Tracing+agent+execution...;Generating+adversarial+scenarios...;Detecting+failure+modes...;Calculating+reliability...;Predicting+failure+risk...;Meet+Trasey."
    alt="ZeroTrace evaluation process"
  />
</p>

> **Agents should fail inside the test environment—not for the first time in front of users.**

<p align="center">
  <img src="./assets/dashboard.png" alt="ZeroTrace Dashboard Preview" width="900" />
</p>

> [!NOTE]
> Replace image, deployment, repository, technology, and developer placeholders before submission. The metrics and terminal output below are illustrative unless connected to actual evaluation results.

---

## Quick Navigation

- [The Problem](#-the-problem)
- [Introducing ZeroTrace](#-introducing-zerotrace)
- [Meet Trasey](#-meet-trasey)
- [How It Works](#-how-zerotrace-works)
- [Key Features](#-key-features)
- [Failure Modes](#-failure-modes)
- [Reliability Report](#-reliability-report)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [API Overview](#-api-overview)
- [Roadmap](#-roadmap)
- [Meet the Team](#-meet-the-team)

---

## ◈ The Problem

Autonomous AI agents do more than generate text. They plan multi-step tasks, select tools, call external APIs, modify systems, and make decisions with real consequences.

Traditional tests often inspect only the final answer:

```text
Prompt → Agent → Final Answer → Pass / Fail
