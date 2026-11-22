export type Stat = {
  value: string;
  label: string;
};

export type Job = {
  dates: string;
  role: string;
  company: string;
  location: string;
  summary: string;
  bullets: string[];
  tags: string[];
};

export type Education = {
  dates: string;
  degree: string;
  school: string;
  location: string;
  notes: string;
};

export type Project = {
  title: string;
  summary: string;
  result: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type Principle = {
  title: string;
  body: string;
};

export type ExternalLink = {
  label: string;
  href: string;
};

export type Content = {
  name: string;
  title: string;
  headline: string;
  location: string;
  availability: string;
  email: string;
  phone: string;
  resumeLabel: string;
  resumeHref: string;
  links: ExternalLink[];
  aboutLead: string;
  about: string[];
  stats: Stat[];
  experience: Job[];
  education: Education[];
  projectsLead: string;
  projects: Project[];
  expertiseLead: string;
  expertise: SkillGroup[];
  principlesLead: string;
  principles: Principle[];
  contactLead: string;
  contact: string[];
};
