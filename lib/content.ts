import fs from "fs";
import path from "path";
import type { Content } from "./types";

const contentPath = path.join(process.cwd(), "data", "content.json");

export function readContent(): Content {
  const raw = fs.readFileSync(contentPath, "utf8");
  return JSON.parse(raw) as Content;
}

export function writeContent(content: Content) {
  fs.writeFileSync(contentPath, JSON.stringify(content, null, 2) + "\n", "utf8");
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item)).filter(Boolean);
}

export function sanitizeContent(input: unknown): Content {
  if (!input || typeof input !== "object") {
    throw new Error("Content must be an object.");
  }
  const source = input as Record<string, unknown>;
  const name = asString(source.name);
  const title = asString(source.title);
  const email = asString(source.email);
  if (!name || !title || !email) {
    throw new Error("Name, title, and email are required.");
  }

  const experience = Array.isArray(source.experience)
    ? source.experience.map((item) => {
        const job = (item ?? {}) as Record<string, unknown>;
        return {
          dates: asString(job.dates),
          role: asString(job.role),
          company: asString(job.company),
          website: asString(job.website),
          location: asString(job.location),
          summary: asString(job.summary),
          bullets: asStringList(job.bullets),
          tags: asStringList(job.tags),
        };
      })
    : [];

  const education = Array.isArray(source.education)
    ? source.education.map((item) => {
        const school = (item ?? {}) as Record<string, unknown>;
        return {
          dates: asString(school.dates),
          degree: asString(school.degree),
          school: asString(school.school),
          location: asString(school.location),
          notes: asString(school.notes),
        };
      })
    : [];

  const projects = Array.isArray(source.projects)
    ? source.projects.map((item) => {
        const project = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(project.title),
          summary: asString(project.summary),
          result: asString(project.result),
        };
      })
    : [];

  const expertise = Array.isArray(source.expertise)
    ? source.expertise.map((item) => {
        const group = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(group.title),
          items: asStringList(group.items),
        };
      })
    : [];

  const principles = Array.isArray(source.principles)
    ? source.principles.map((item) => {
        const principle = (item ?? {}) as Record<string, unknown>;
        return {
          title: asString(principle.title),
          body: asString(principle.body),
        };
      })
    : [];

  const stats = Array.isArray(source.stats)
    ? source.stats.map((item) => {
        const stat = (item ?? {}) as Record<string, unknown>;
        return { value: asString(stat.value), label: asString(stat.label) };
      })
    : [];

  const links = Array.isArray(source.links)
    ? source.links
        .map((item) => {
          const link = (item ?? {}) as Record<string, unknown>;
          return { label: asString(link.label), href: asString(link.href) };
        })
        .filter((link) => link.label && link.href)
    : [];

  const content: Content = {
    name,
    title,
    headline: asString(source.headline),
    location: asString(source.location),
    availability: asString(source.availability),
    email,
    phone: asString(source.phone),
    resumeLabel: asString(source.resumeLabel, "Resume (PDF)"),
    resumeHref: asString(source.resumeHref),
    avatar: safeAvatar(asString(source.avatar)),
    links,
    aboutLead: asString(source.aboutLead),
    about: asStringList(source.about),
    stats: stats.filter((stat) => stat.value && stat.label),
    experience: experience.filter((job) => job.role || job.company),
    education: education.filter((item) => item.degree || item.school),
    projectsLead: asString(source.projectsLead),
    projects: projects.filter((project) => project.title),
    expertiseLead: asString(source.expertiseLead),
    expertise: expertise.filter((group) => group.title),
    principlesLead: asString(source.principlesLead),
    principles: principles.filter((principle) => principle.title),
    contactLead: asString(source.contactLead),
    contact: asStringList(source.contact),
  };

  if (JSON.stringify(content).length > 500_000) {
    throw new Error("Content is too large. Use a smaller avatar image.");
  }
  return content;
}

function safeAvatar(value: string) {
  if (!value) return "";
  if (value.startsWith("data:image/jpeg;base64,") || value.startsWith("data:image/png;base64,") || value.startsWith("data:image/webp;base64,")) {
    return value.length < 450_000 ? value : "";
  }
  return safeHref(value);
}

export function safeHref(href: string) {
  const value = href.trim();
  if (value.startsWith("/") || value.startsWith("mailto:") || value.startsWith("tel:")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return "";
  }
  return "";
}
