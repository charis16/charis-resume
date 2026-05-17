import { type Locale } from "@/i18n/locale";

export type Messages = typeof messages.en;
export type MessageKey = keyof Messages;

export const messages = {
  en: {
    navExperience: "Experience",
    navSkills: "Skills",
    hireMe: "Hire Me",
    downloadResume: "Download Resume",
    navAbout: "About",
    navCertifications: "Certifications",
    navEducation: "Education",
    aboutMePrefix: "About",
    aboutMeHighlight: "Me",
    professionalPrefix: "Professional",
    experienceHighlight: "Experience",
    skillsPrefix: "Skills &",
    proficiencyHighlight: "Proficiency",
    certifications: "Certifications",
    education: "Education",
    technicalProficiency: "Technical Proficiency",
    contactEmail: "Email",
    contactLinkedIn: "LinkedIn",
    certPlaceholder: "Add your certifications here.",
    projects: "Projects",
    contact: "Contact",
    home: "Home",
    expShort: "Exp",
    certShort: "Cert",
    present: "Present",
  },
  id: {
    navExperience: "Pengalaman",
    navSkills: "Skill",
    hireMe: "Hubungi",
    downloadResume: "Unduh CV",
    navAbout: "Tentang",
    navCertifications: "Sertifikasi",
    navEducation: "Pendidikan",
    aboutMePrefix: "Tentang",
    aboutMeHighlight: "Saya",
    professionalPrefix: "Pengalaman",
    experienceHighlight: "Kerja",
    skillsPrefix: "Skill &",
    proficiencyHighlight: "Kemampuan",
    certifications: "Sertifikasi",
    education: "Pendidikan",
    technicalProficiency: "Keahlian Teknis",
    contactEmail: "Email",
    contactLinkedIn: "LinkedIn",
    certPlaceholder: "Tambahkan daftar sertifikasi kamu di sini.",
    projects: "Proyek",
    contact: "Kontak",
    home: "Beranda",
    expShort: "Exp",
    certShort: "Sert",
    present: "Sekarang",
  },
} as const;

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
