import { readContent, safeHref } from "@/lib/content";

function pad(index: number) {
  return String(index).padStart(2, "0");
}

export default function Portfolio() {
  const content = readContent();
  const phoneHref = content.phone ? `tel:${content.phone.replace(/[^\d+]/g, "")}` : "";
  const resumeHref = safeHref(content.resumeHref);
  const year = new Date().getFullYear();
  const sections = [
    ["about", "About"],
    ["experience", "Experience"],
    ["work", "Selected work"],
    ["expertise", "Expertise"],
    ["approach", "How I work"],
    ["contact", "Contact"],
  ] as const;

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="shell">
        <header className="nav">
          <a className="brand" href="#top">
            <strong>{content.name}</strong>
            <span>{content.title}</span>
          </a>
          <nav>
            <ul className="nav-sections">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="nav-meta">
            <li>
              <a href={`mailto:${content.email}`}>Email</a>
            </li>
            {phoneHref ? (
              <li>
                <a href={phoneHref}>{content.phone}</a>
              </li>
            ) : null}
            {resumeHref ? (
              <li>
                <a href={resumeHref}>{content.resumeLabel}</a>
              </li>
            ) : null}
            {content.links.map((link) => {
              const href = safeHref(link.href);
              if (!href) return null;
              return (
                <li key={href}>
                  <a href={href}>{link.label}</a>
                </li>
              );
            })}
          </ul>
        </header>

        <main id="content">
          <section className="hero" id="top">
            <h1>{content.name}</h1>
            <p className="kicker">{content.title}</p>
            <p className="headline">{content.headline}</p>
            <p className="status">
              {content.location}
              {content.availability ? ` · ${content.availability}` : ""}
            </p>
          </section>

          <section className="section" id="about" aria-label="About">
            <p className="section-index">01</p>
            <h2>About</h2>
            <p className="lede">{content.aboutLead}</p>
            <div className="prose">
              {content.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {content.stats.length > 0 ? (
              <ul className="stats">
                {content.stats.map((stat) => (
                  <li key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="section" id="experience" aria-label="Experience">
            <p className="section-index">02</p>
            <h2>Experience</h2>
            <ol className="jobs">
              {content.experience.map((job) => (
                <li className="job" key={`${job.dates}-${job.company}-${job.role}`}>
                  <p className="dates">{job.dates}</p>
                  <div>
                    <h3>
                      {job.role}
                      {job.company ? ` · ${job.company}` : ""}
                    </h3>
                    {job.location ? <p className="meta">{job.location}</p> : null}
                    {job.summary ? <p className="summary">{job.summary}</p> : null}
                    {job.bullets.length > 0 ? (
                      <ul>
                        {job.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                    {job.tags.length > 0 ? (
                      <ul className="tags">
                        {job.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            {content.education.length > 0 ? (
              <div className="education">
                <h3>Education</h3>
                {content.education.map((item) => (
                  <article className="education-block" key={`${item.school}-${item.degree}`}>
                    <p className="dates">{item.dates}</p>
                    <div>
                      <h3>{item.degree}</h3>
                      <p>
                        {item.school}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                      {item.notes ? <p className="summary">{item.notes}</p> : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="section" id="work" aria-label="Selected work">
            <p className="section-index">03</p>
            <h2>Selected work</h2>
            <p className="lede">{content.projectsLead}</p>
            <ol className="projects">
              {content.projects.map((project, index) => (
                <li className="project" key={project.title}>
                  <span className="num">{pad(index + 1)}</span>
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    {project.result ? <p className="result">{project.result}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="section" id="expertise" aria-label="Expertise">
            <p className="section-index">04</p>
            <h2>Expertise</h2>
            <p className="lede">{content.expertiseLead}</p>
            <div className="groups">
              {content.expertise.map((group) => (
                <section className="group" key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>

          <section className="section" id="approach" aria-label="How I work">
            <p className="section-index">05</p>
            <h2>How I work</h2>
            <p className="lede">{content.principlesLead}</p>
            <ol className="principles">
              {content.principles.map((principle, index) => (
                <li className="principle" key={principle.title}>
                  <span className="num">{pad(index + 1)}</span>
                  <div>
                    <h3>{principle.title}</h3>
                    <p>{principle.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="section" id="contact" aria-label="Contact">
            <p className="section-index">06</p>
            <h2>Contact</h2>
            <p className="lede">{content.contactLead}</p>
            <div className="prose">
              {content.contact.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="contact-grid">
              <div>
                <span>Email</span>
                <a href={`mailto:${content.email}`}>{content.email}</a>
              </div>
              {phoneHref ? (
                <div>
                  <span>Phone</span>
                  <a href={phoneHref}>{content.phone}</a>
                </div>
              ) : null}
              <div>
                <span>Location</span>
                <p>{content.location}</p>
              </div>
              {resumeHref ? (
                <div>
                  <span>Resume</span>
                  <a href={resumeHref}>{content.resumeLabel}</a>
                </div>
              ) : null}
            </div>
            <footer className="footer">
              <p>
                © {year} {content.name}
                {content.location ? ` · ${content.location}` : ""}
              </p>
              <nav>
                {phoneHref ? <a href={phoneHref}>{content.phone}</a> : null}
                <a href={`mailto:${content.email}`}>Email</a>
              </nav>
            </footer>
          </section>
        </main>
      </div>
    </>
  );
}
