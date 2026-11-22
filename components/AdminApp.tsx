"use client";

import { useEffect, useState } from "react";
import type { Content, Education, ExternalLink, Job, Principle, Project, SkillGroup, Stat } from "@/lib/types";

const emptyJob = (): Job => ({
  dates: "",
  role: "",
  company: "",
  website: "",
  location: "",
  summary: "",
  bullets: [],
  tags: [],
});

function AvatarField({ avatar, onChange }: { avatar: string; onChange: (avatar: string) => void }) {
  const [reading, setReading] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setReading(true);
    try {
      onChange(await compressImage(file));
    } finally {
      setReading(false);
    }
  }

  return (
    <div className="item avatar-field">
      <div className="avatar-preview">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" />
        ) : (
          <span>No photo</span>
        )}
      </div>
      <label>
        Upload avatar
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
      </label>
      {reading ? <p className="msg">Preparing image…</p> : null}
      {avatar ? (
        <button className="ghost" type="button" onClick={() => onChange("")}>
          Remove avatar
        </button>
      ) : null}
    </div>
  );
}

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const max = 640;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that image."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<Content | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then(async (session: { ok: boolean }) => {
        setAuthed(session.ok);
        if (session.ok) {
          const response = await fetch("/api/admin/content");
          setContent((await response.json()) as Content);
        }
      })
      .finally(() => setReady(true));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Could not sign in.");
      return;
    }
    const contentResponse = await fetch("/api/admin/content");
    setContent((await contentResponse.json()) as Content);
    setAuthed(true);
    setPassword("");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setContent(null);
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const body = (await response.json()) as { message?: string; error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(body.error ?? "Could not save.");
      return;
    }
    setMessage(body.message ?? "Saved.");
  }

  function patch(partial: Partial<Content>) {
    setContent((current) => (current ? { ...current, ...partial } : current));
  }

  if (!ready) {
    return (
      <main className="admin">
        <p className="admin-note">Loading…</p>
      </main>
    );
  }

  if (!authed || !content) {
    return (
      <main className="admin">
        <h1>Edit portfolio</h1>
        <p className="admin-note">Sign in to change the public page.</p>
        <form className="login-card" onSubmit={login}>
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          {error ? <p className="msg error">{error}</p> : null}
          <div className="actions">
            <button type="submit">Sign in</button>
            <a className="button ghost" href="/">
              Back to site
            </a>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="admin">
      <h1>Edit portfolio</h1>
      <p className="admin-note">
        Changes go live after you save. On Vercel, that save updates GitHub and starts a new deploy.
      </p>

      <section className="panel">
        <h2>Profile</h2>
        <div className="grid two">
          <Field label="Name" value={content.name} onChange={(name) => patch({ name })} />
          <Field label="Title" value={content.title} onChange={(title) => patch({ title })} />
          <Field label="Location" value={content.location} onChange={(location) => patch({ location })} />
          <Field label="Availability" value={content.availability} onChange={(availability) => patch({ availability })} />
          <Field label="Email" value={content.email} onChange={(email) => patch({ email })} />
          <Field label="Phone" value={content.phone} onChange={(phone) => patch({ phone })} />
          <Field label="Resume label" value={content.resumeLabel} onChange={(resumeLabel) => patch({ resumeLabel })} />
          <Field label="Resume link" value={content.resumeHref} onChange={(resumeHref) => patch({ resumeHref })} />
          <Field
            label="Avatar image URL"
            value={content.avatar.startsWith("data:") ? "" : content.avatar}
            onChange={(avatar) => patch({ avatar })}
          />
        </div>
        <AvatarField avatar={content.avatar} onChange={(avatar) => patch({ avatar })} />
        <div className="item">
          <Field label="Intro" value={content.headline} onChange={(headline) => patch({ headline })} multiline />
        </div>
      </section>

      <section className="panel">
        <h2>About</h2>
        <Field label="Lead" value={content.aboutLead} onChange={(aboutLead) => patch({ aboutLead })} />
        <div className="item">
          <Field
            label="Paragraphs, one per line"
            value={content.about.join("\n")}
            onChange={(value) => patch({ about: value.split("\n") })}
            multiline
          />
        </div>
        <ListEditor
          title="Stats"
          addLabel="Add stat"
          onAdd={() => patch({ stats: [...content.stats, { value: "", label: "" }] })}
        >
          {content.stats.map((stat, index) => (
            <StatFields
              key={index}
              stat={stat}
              onChange={(next) => patch({ stats: replace(content.stats, index, next) })}
              onRemove={() => patch({ stats: remove(content.stats, index) })}
            />
          ))}
        </ListEditor>
      </section>

      <section className="panel">
        <h2>Experience</h2>
        <ListEditor
          title=""
          addLabel="Add role"
          onAdd={() => patch({ experience: [...content.experience, emptyJob()] })}
        >
          {content.experience.map((job, index) => (
            <JobFields
              key={index}
              job={job}
              onChange={(next) => patch({ experience: replace(content.experience, index, next) })}
              onRemove={() => patch({ experience: remove(content.experience, index) })}
            />
          ))}
        </ListEditor>
      </section>

      <section className="panel">
        <h2>Education</h2>
        <ListEditor
          title=""
          addLabel="Add school"
          onAdd={() =>
            patch({
              education: [...content.education, { dates: "", degree: "", school: "", location: "", notes: "" }],
            })
          }
        >
          {content.education.map((item, index) => (
            <EducationFields
              key={index}
              item={item}
              onChange={(next) => patch({ education: replace(content.education, index, next) })}
              onRemove={() => patch({ education: remove(content.education, index) })}
            />
          ))}
        </ListEditor>
      </section>

      <section className="panel">
        <h2>Selected work</h2>
        <Field label="Lead" value={content.projectsLead} onChange={(projectsLead) => patch({ projectsLead })} multiline />
        <ListEditor
          title=""
          addLabel="Add project"
          onAdd={() => patch({ projects: [...content.projects, { title: "", summary: "", result: "" }] })}
        >
          {content.projects.map((project, index) => (
            <ProjectFields
              key={index}
              project={project}
              onChange={(next) => patch({ projects: replace(content.projects, index, next) })}
              onRemove={() => patch({ projects: remove(content.projects, index) })}
            />
          ))}
        </ListEditor>
      </section>

      <section className="panel">
        <h2>Expertise</h2>
        <Field label="Lead" value={content.expertiseLead} onChange={(expertiseLead) => patch({ expertiseLead })} />
        <ListEditor
          title=""
          addLabel="Add group"
          onAdd={() => patch({ expertise: [...content.expertise, { title: "", items: [] }] })}
        >
          {content.expertise.map((group, index) => (
            <GroupFields
              key={index}
              group={group}
              onChange={(next) => patch({ expertise: replace(content.expertise, index, next) })}
              onRemove={() => patch({ expertise: remove(content.expertise, index) })}
            />
          ))}
        </ListEditor>
      </section>

      <section className="panel">
        <h2>How I work</h2>
        <Field label="Lead" value={content.principlesLead} onChange={(principlesLead) => patch({ principlesLead })} />
        <ListEditor
          title=""
          addLabel="Add principle"
          onAdd={() => patch({ principles: [...content.principles, { title: "", body: "" }] })}
        >
          {content.principles.map((principle, index) => (
            <PrincipleFields
              key={index}
              principle={principle}
              onChange={(next) => patch({ principles: replace(content.principles, index, next) })}
              onRemove={() => patch({ principles: remove(content.principles, index) })}
            />
          ))}
        </ListEditor>
      </section>

      <section className="panel">
        <h2>Contact</h2>
        <Field label="Lead" value={content.contactLead} onChange={(contactLead) => patch({ contactLead })} />
        <div className="item">
          <Field
            label="Paragraphs, one per line"
            value={content.contact.join("\n")}
            onChange={(value) => patch({ contact: value.split("\n") })}
            multiline
          />
        </div>
        <ListEditor
          title="Extra links"
          addLabel="Add link"
          onAdd={() => patch({ links: [...content.links, { label: "", href: "" }] })}
        >
          {content.links.map((link, index) => (
            <LinkFields
              key={index}
              link={link}
              onChange={(next) => patch({ links: replace(content.links, index, next) })}
              onRemove={() => patch({ links: remove(content.links, index) })}
            />
          ))}
        </ListEditor>
      </section>

      <div className="savebar">
        <p className={error ? "msg error" : "msg"}>{error || message || "Unsaved changes stay in this browser until you save."}</p>
        <div className="row-actions">
          <button className="ghost" type="button" onClick={logout}>
            Sign out
          </button>
          <a className="button ghost" href="/">
            View site
          </a>
          <button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
}

function replace<T>(items: T[], index: number, next: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? next : item));
}
function remove<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function ListEditor({
  title,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title ? <h2>{title}</h2> : null}
      {children}
      <div className="item">
        <button className="ghost" type="button" onClick={onAdd}>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function StatFields({ stat, onChange, onRemove }: { stat: Stat; onChange: (stat: Stat) => void; onRemove: () => void }) {
  return (
    <div className="item">
      <div className="grid two">
        <Field label="Value" value={stat.value} onChange={(value) => onChange({ ...stat, value })} />
        <Field label="Label" value={stat.label} onChange={(label) => onChange({ ...stat, label })} />
      </div>
      <button className="ghost" type="button" onClick={onRemove}>
        Remove stat
      </button>
    </div>
  );
}

function JobFields({ job, onChange, onRemove }: { job: Job; onChange: (job: Job) => void; onRemove: () => void }) {
  return (
    <div className="item">
      <div className="grid two">
        <Field label="Dates" value={job.dates} onChange={(dates) => onChange({ ...job, dates })} />
        <Field label="Location" value={job.location} onChange={(location) => onChange({ ...job, location })} />
        <Field label="Role" value={job.role} onChange={(role) => onChange({ ...job, role })} />
        <Field label="Company" value={job.company} onChange={(company) => onChange({ ...job, company })} />
        <Field label="Company website" value={job.website} onChange={(website) => onChange({ ...job, website })} />
      </div>
      <Field label="Summary" value={job.summary} onChange={(summary) => onChange({ ...job, summary })} multiline />
      <Field
        label="Bullets, one per line"
        value={job.bullets.join("\n")}
        onChange={(value) => onChange({ ...job, bullets: value.split("\n") })}
        multiline
      />
      <Field
        label="Tags, comma separated"
        value={job.tags.join(", ")}
        onChange={(value) => onChange({ ...job, tags: value.split(",").map((tag) => tag.trim()) })}
      />
      <button className="ghost" type="button" onClick={onRemove}>
        Remove role
      </button>
    </div>
  );
}

function EducationFields({
  item,
  onChange,
  onRemove,
}: {
  item: Education;
  onChange: (item: Education) => void;
  onRemove: () => void;
}) {
  return (
    <div className="item">
      <div className="grid two">
        <Field label="Dates" value={item.dates} onChange={(dates) => onChange({ ...item, dates })} />
        <Field label="Location" value={item.location} onChange={(location) => onChange({ ...item, location })} />
        <Field label="Degree" value={item.degree} onChange={(degree) => onChange({ ...item, degree })} />
        <Field label="School" value={item.school} onChange={(school) => onChange({ ...item, school })} />
      </div>
      <Field label="Notes" value={item.notes} onChange={(notes) => onChange({ ...item, notes })} multiline />
      <button className="ghost" type="button" onClick={onRemove}>
        Remove school
      </button>
    </div>
  );
}

function ProjectFields({
  project,
  onChange,
  onRemove,
}: {
  project: Project;
  onChange: (project: Project) => void;
  onRemove: () => void;
}) {
  return (
    <div className="item">
      <Field label="Title" value={project.title} onChange={(title) => onChange({ ...project, title })} />
      <Field label="Summary" value={project.summary} onChange={(summary) => onChange({ ...project, summary })} multiline />
      <Field label="Result" value={project.result} onChange={(result) => onChange({ ...project, result })} />
      <button className="ghost" type="button" onClick={onRemove}>
        Remove project
      </button>
    </div>
  );
}

function GroupFields({
  group,
  onChange,
  onRemove,
}: {
  group: SkillGroup;
  onChange: (group: SkillGroup) => void;
  onRemove: () => void;
}) {
  return (
    <div className="item">
      <Field label="Group" value={group.title} onChange={(title) => onChange({ ...group, title })} />
      <Field
        label="Items, one per line"
        value={group.items.join("\n")}
        onChange={(value) => onChange({ ...group, items: value.split("\n") })}
        multiline
      />
      <button className="ghost" type="button" onClick={onRemove}>
        Remove group
      </button>
    </div>
  );
}

function PrincipleFields({
  principle,
  onChange,
  onRemove,
}: {
  principle: Principle;
  onChange: (principle: Principle) => void;
  onRemove: () => void;
}) {
  return (
    <div className="item">
      <Field label="Title" value={principle.title} onChange={(title) => onChange({ ...principle, title })} />
      <Field label="Body" value={principle.body} onChange={(body) => onChange({ ...principle, body })} multiline />
      <button className="ghost" type="button" onClick={onRemove}>
        Remove principle
      </button>
    </div>
  );
}

function LinkFields({
  link,
  onChange,
  onRemove,
}: {
  link: ExternalLink;
  onChange: (link: ExternalLink) => void;
  onRemove: () => void;
}) {
  return (
    <div className="item">
      <div className="grid two">
        <Field label="Label" value={link.label} onChange={(label) => onChange({ ...link, label })} />
        <Field label="URL" value={link.href} onChange={(href) => onChange({ ...link, href })} />
      </div>
      <button className="ghost" type="button" onClick={onRemove}>
        Remove link
      </button>
    </div>
  );
}
