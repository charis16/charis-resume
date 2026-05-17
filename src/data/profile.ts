export type ProfileLink = {
  label: string;
  href: string;
};

export type Experience = {
  company: string;
  role: string;
  start: string;
  end: string;
  current?: boolean;
  location: string;
  highlights: {
    id: string[];
    en: string[];
  };
};

export type Project = {
  title: string;
  description: string;
  stack: string[];
  href?: string;
};

export type Education = {
  school: string;
  major: string;
  start: string;
  end: string;
  note?: string;
};

export type Certification = {
  title: string;
  issuer?: string;
  date?: string;
  url?: string;
};

export type ProfileData = {
  name: string;
  headline: string;
  location: string;
  summary: { id: string; en: string };
  about: { id: string; en: string };
  avatarUrl?: string;
  links: ProfileLink[];
  highlights: { label: string; value: string }[];
  skills: string[];
  experience: Experience[];
  certifications: Certification[];
  projects: Project[];
  education: Education[];
};
