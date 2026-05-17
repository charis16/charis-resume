"use client";

import { Badge } from "@/components/ui/Badge";
import {
  type Certification,
  type Education,
  type Experience,
  type ProfileData,
} from "@/data/profile";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";

type AdminEditorProps = {
  initialProfile: ProfileData;
};

type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; savedAt: number }
  | { status: "error"; message: string };

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string };

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getEmailFromLinks(links: ProfileData["links"]): string {
  const item = links.find((l) => l.label.toLowerCase() === "email");
  if (!item) return "";
  if (item.href.toLowerCase().startsWith("mailto:"))
    return item.href.slice("mailto:".length);
  return item.href;
}

function getLinkedInFromLinks(links: ProfileData["links"]): string {
  return links.find((l) => l.label.toLowerCase() === "linkedin")?.href ?? "";
}

function upsertLink(
  links: ProfileData["links"],
  label: string,
  href: string,
): ProfileData["links"] {
  const normalized = href.trim();
  const next = [...links];
  const idx = next.findIndex(
    (l) => l.label.toLowerCase() === label.toLowerCase(),
  );

  if (!normalized) {
    if (idx >= 0) next.splice(idx, 1);
    return next;
  }

  if (idx >= 0) {
    next[idx] = { ...next[idx], href: normalized };
    return next;
  }

  return [{ label, href: normalized }, ...next];
}

function updateAt<T>(items: T[], index: number, nextValue: T): T[] {
  return items.map((x, i) => (i === index ? nextValue : x));
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index);
}

export function AdminEditor({ initialProfile }: AdminEditorProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [contactEmail, setContactEmail] = useState(() =>
    getEmailFromLinks(initialProfile.links),
  );
  const [contactLinkedIn, setContactLinkedIn] = useState(() =>
    getLinkedInFromLinks(initialProfile.links),
  );
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [skillDraft, setSkillDraft] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
  });

  const addSkill = useCallback((raw: string) => {
    const nextValue = raw.trim();
    if (!nextValue) return;
    setProfile((prev) => {
      if (prev.skills.includes(nextValue)) return prev;
      return { ...prev, skills: [...prev.skills, nextValue] };
    });
  }, []);

  const removeSkill = useCallback((value: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== value),
    }));
  }, []);

  const setAbout = useCallback((field: "id" | "en", value: string) => {
    setProfile((prev) => ({
      ...prev,
      about: { ...prev.about, [field]: value },
    }));
  }, []);

  const commitSkillDraft = useCallback(() => {
    const value = skillDraft.trim();
    if (!value) return;
    addSkill(value);
    setSkillDraft("");
  }, [addSkill, skillDraft]);

  const addExperience = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          role: "",
          start: "",
          end: "",
          current: false,
          location: "",
          highlights: { id: [], en: [] },
        },
      ],
    }));
  }, []);

  const updateExperience = useCallback(
    (index: number, nextItem: Experience) => {
      setProfile((prev) => ({
        ...prev,
        experience: updateAt(prev.experience, index, nextItem),
      }));
    },
    [],
  );

  const removeExperience = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      experience: removeAt(prev.experience, index),
    }));
  }, []);

  const addCertification = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { title: "", issuer: "", date: "", url: "" },
      ],
    }));
  }, []);

  const updateCertification = useCallback(
    (index: number, nextItem: Certification) => {
      setProfile((prev) => ({
        ...prev,
        certifications: updateAt(prev.certifications, index, nextItem),
      }));
    },
    [],
  );

  const removeCertification = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      certifications: removeAt(prev.certifications, index),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: "", major: "", start: "", end: "", note: "" },
      ],
    }));
  }, []);

  const updateEducation = useCallback((index: number, nextItem: Education) => {
    setProfile((prev) => ({
      ...prev,
      education: updateAt(prev.education, index, nextItem),
    }));
  }, []);

  const removeEducation = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      education: removeAt(prev.education, index),
    }));
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setUploadState({ status: "uploading" });
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/admin/avatar", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        avatarUrl?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok || !data.avatarUrl) {
        throw new Error(data?.error ?? `Gagal upload (HTTP ${res.status})`);
      }
      setProfile((prev) => ({ ...prev, avatarUrl: data.avatarUrl! }));
      setUploadState({ status: "idle" });
    } catch (e) {
      setUploadState({
        status: "error",
        message: e instanceof Error ? e.message : "Gagal upload",
      });
    }
  }, []);

  const save = useCallback(async () => {
    setSaveState({ status: "saving" });

    const nextLinks = (() => {
      let links = profile.links;
      links = upsertLink(
        links,
        "Email",
        contactEmail ? `mailto:${contactEmail}` : "",
      );
      links = upsertLink(links, "LinkedIn", contactLinkedIn);
      return links;
    })();

    const payload: ProfileData = { ...profile, links: nextLinks };

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(msg?.error ?? `Gagal menyimpan (HTTP ${res.status})`);
      }

      setProfile(payload);
      setSaveState({ status: "saved", savedAt: Date.now() });
    } catch (e) {
      setSaveState({
        status: "error",
        message: e instanceof Error ? e.message : "Gagal menyimpan",
      });
    }
  }, [contactEmail, contactLinkedIn, profile]);

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-sm font-bold tracking-wider text-on-surface'>
            Foto Profile
          </h2>
          <p className='text-sm text-on-surface-variant'>
            Upload gambar untuk foto profil.
          </p>
        </div>

        <div className='mt-4 flex flex-col gap-4 md:flex-row md:items-center'>
          <div className='h-16 w-16 overflow-hidden rounded-full border border-outline-variant/30 bg-surface-container-lowest'>
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt='Avatar'
                width={64}
                height={64}
                unoptimized
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-xs font-semibold text-on-surface-variant'>
                -
              </div>
            )}
          </div>

          <div className='flex flex-1 flex-col gap-2'>
            <input
              type='file'
              accept='image/*'
              className='block w-full text-sm'
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                e.currentTarget.value = "";
                if (f) uploadAvatar(f);
              }}
              disabled={uploadState.status === "uploading"}
            />
            {uploadState.status === "uploading" ? (
              <p className='text-sm text-on-surface-variant'>Mengupload...</p>
            ) : uploadState.status === "error" ? (
              <p className='text-sm text-error'>{uploadState.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section
        id='contact'
        className='rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-sm font-bold tracking-wider text-on-surface'>
            Kontak
          </h2>
          <p className='text-sm text-on-surface-variant'>Email dan LinkedIn.</p>
        </div>
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          <label className='flex flex-col gap-2'>
            <span className='text-xs font-semibold text-on-surface-variant'>
              Email
            </span>
            <input
              className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder='nama@domain.com'
            />
          </label>
          <label className='flex flex-col gap-2'>
            <span className='text-xs font-semibold text-on-surface-variant'>
              LinkedIn
            </span>
            <input
              className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
              value={contactLinkedIn}
              onChange={(e) => setContactLinkedIn(e.target.value)}
              placeholder='https://www.linkedin.com/in/...'
            />
          </label>
        </div>
      </section>

      <section
        id='about'
        className='rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-sm font-bold tracking-wider text-on-surface'>
            About Me
          </h2>
          <p className='text-sm text-on-surface-variant'>
            Isi bilingual (ID & EN).
          </p>
        </div>
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          <label className='flex flex-col gap-2'>
            <span className='text-xs font-semibold text-on-surface-variant'>
              Bahasa Indonesia
            </span>
            <textarea
              className='min-h-[140px] resize-y rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm leading-6 outline-none focus:border-primary-container'
              value={profile.about.id}
              onChange={(e) => setAbout("id", e.target.value)}
            />
          </label>
          <label className='flex flex-col gap-2'>
            <span className='text-xs font-semibold text-on-surface-variant'>
              English
            </span>
            <textarea
              className='min-h-[140px] resize-y rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm leading-6 outline-none focus:border-primary-container'
              value={profile.about.en}
              onChange={(e) => setAbout("en", e.target.value)}
            />
          </label>
        </div>
      </section>

      <section
        id='skills'
        className='rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-sm font-bold tracking-wider text-on-surface'>
              Skills & Proficiency
            </h2>
            <p className='text-sm text-on-surface-variant'>
              Tekan Enter untuk menambah, klik chip untuk hapus.
            </p>
          </div>
        </div>
        <div className='mt-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 focus-within:border-primary-container'>
          <div className='flex flex-wrap items-center gap-2'>
            {profile.skills.map((s) => (
              <Badge
                key={s}
                className='gap-2 pr-2'>
                <span className='max-w-[220px] truncate'>{s}</span>
                <button
                  type='button'
                  aria-label={`Hapus ${s}`}
                  onClick={() => removeSkill(s)}
                  className='inline-flex h-5 w-5 items-center justify-center rounded-full border border-outline-variant/40 bg-white/70 text-on-surface-variant hover:bg-white'>
                  <X className='h-3.5 w-3.5' />
                </button>
              </Badge>
            ))}

            <input
              className='h-9 min-w-[180px] flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-on-surface-variant/60'
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  commitSkillDraft();
                }
                if (
                  e.key === "Backspace" &&
                  !skillDraft &&
                  profile.skills.length > 0
                ) {
                  removeSkill(profile.skills[profile.skills.length - 1] ?? "");
                }
              }}
              onBlur={commitSkillDraft}
              placeholder={profile.skills.length === 0 ? "Tambah skill..." : ""}
            />
          </div>
        </div>
      </section>

      <section
        id='experience'
        className='rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-sm font-bold tracking-wider text-on-surface'>
              Professional Experience
            </h2>
            <p className='text-sm text-on-surface-variant'>
              Highlight: satu poin per baris (ID & EN).
            </p>
          </div>
          <button
            type='button'
            onClick={addExperience}
            className='h-10 shrink-0 rounded-xl bg-primary-container px-4 text-sm font-bold text-white shadow-sm'>
            + Tambah
          </button>
        </div>

        <div className='mt-4 space-y-4'>
          {profile.experience.map((item, index) => (
            <div
              key={`exp-${index}`}
              className='rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-bold text-on-surface'>
                  {item.company || "Experience baru"}
                </p>
                <button
                  type='button'
                  onClick={() => removeExperience(index)}
                  className='h-9 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 text-xs font-bold text-on-surface-variant hover:border-error hover:text-error'>
                  Hapus
                </button>
              </div>

              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Company
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={item.company}
                    onChange={(e) =>
                      updateExperience(index, {
                        ...item,
                        company: e.target.value,
                      })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Role
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={item.role}
                    onChange={(e) =>
                      updateExperience(index, { ...item, role: e.target.value })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Start
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={item.start}
                    onChange={(e) =>
                      updateExperience(index, {
                        ...item,
                        start: e.target.value,
                      })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    End
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={item.current ? "" : item.end}
                    disabled={Boolean(item.current)}
                    onChange={(e) =>
                      updateExperience(index, { ...item, end: e.target.value })
                    }
                  />
                </label>
                <label className='flex items-center gap-2 md:col-span-2'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 accent-[var(--primary-container)]'
                    checked={Boolean(item.current) || !item.end}
                    onChange={(e) => {
                      const next = e.target.checked;
                      updateExperience(index, {
                        ...item,
                        current: next,
                        end: next ? "" : item.end,
                      });
                    }}
                  />
                  <span className='text-sm font-semibold text-on-surface-variant'>
                    Masih bekerja (Current)
                  </span>
                </label>
                <label className='flex flex-col gap-2 md:col-span-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Location
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={item.location}
                    onChange={(e) =>
                      updateExperience(index, {
                        ...item,
                        location: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Highlights (ID)
                  </span>
                  <textarea
                    className='min-h-[120px] resize-y rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm leading-6 outline-none focus:border-primary-container'
                    value={item.highlights.id.join("\n")}
                    onChange={(e) =>
                      updateExperience(index, {
                        ...item,
                        highlights: {
                          ...item.highlights,
                          id: parseLines(e.target.value),
                        },
                      })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Highlights (EN)
                  </span>
                  <textarea
                    className='min-h-[120px] resize-y rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm leading-6 outline-none focus:border-primary-container'
                    value={item.highlights.en.join("\n")}
                    onChange={(e) =>
                      updateExperience(index, {
                        ...item,
                        highlights: {
                          ...item.highlights,
                          en: parseLines(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id='certifications'
        className='rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-sm font-bold tracking-wider text-on-surface'>
              Certifications
            </h2>
            <p className='text-sm text-on-surface-variant'>
              Tambah / edit sertifikasi.
            </p>
          </div>
          <button
            type='button'
            onClick={addCertification}
            className='h-10 shrink-0 rounded-xl bg-primary-container px-4 text-sm font-bold text-white shadow-sm'>
            + Tambah
          </button>
        </div>

        <div className='mt-4 space-y-4'>
          {profile.certifications.map((c, index) => (
            <div
              key={`cert-${index}`}
              className='rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-bold text-on-surface'>
                  {c.title || "Certification baru"}
                </p>
                <button
                  type='button'
                  onClick={() => removeCertification(index)}
                  className='h-9 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 text-xs font-bold text-on-surface-variant hover:border-error hover:text-error'>
                  Hapus
                </button>
              </div>

              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <label className='flex flex-col gap-2 md:col-span-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Title
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={c.title}
                    onChange={(e) =>
                      updateCertification(index, {
                        ...c,
                        title: e.target.value,
                      })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Issuer
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={c.issuer ?? ""}
                    onChange={(e) =>
                      updateCertification(index, {
                        ...c,
                        issuer: e.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Date
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={c.date ?? ""}
                    onChange={(e) =>
                      updateCertification(index, {
                        ...c,
                        date: e.target.value || undefined,
                      })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2 md:col-span-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    URL
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={c.url ?? ""}
                    onChange={(e) =>
                      updateCertification(index, {
                        ...c,
                        url: e.target.value || undefined,
                      })
                    }
                    placeholder='https://...'
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id='education'
        className='rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-sm font-bold tracking-wider text-on-surface'>
              Education
            </h2>
            <p className='text-sm text-on-surface-variant'>
              Tambah / edit pendidikan.
            </p>
          </div>
          <button
            type='button'
            onClick={addEducation}
            className='h-10 shrink-0 rounded-xl bg-primary-container px-4 text-sm font-bold text-white shadow-sm'>
            + Tambah
          </button>
        </div>

        <div className='mt-4 space-y-4'>
          {profile.education.map((ed, index) => (
            <div
              key={`edu-${index}`}
              className='rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-bold text-on-surface'>
                  {ed.school || "Education baru"}
                </p>
                <button
                  type='button'
                  onClick={() => removeEducation(index)}
                  className='h-9 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 text-xs font-bold text-on-surface-variant hover:border-error hover:text-error'>
                  Hapus
                </button>
              </div>

              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <label className='flex flex-col gap-2 md:col-span-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    School
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={ed.school}
                    onChange={(e) =>
                      updateEducation(index, { ...ed, school: e.target.value })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2 md:col-span-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Major
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={ed.major}
                    onChange={(e) =>
                      updateEducation(index, { ...ed, major: e.target.value })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Start
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={ed.start}
                    onChange={(e) =>
                      updateEducation(index, { ...ed, start: e.target.value })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    End
                  </span>
                  <input
                    className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
                    value={ed.end}
                    onChange={(e) =>
                      updateEducation(index, { ...ed, end: e.target.value })
                    }
                  />
                </label>
                <label className='flex flex-col gap-2 md:col-span-2'>
                  <span className='text-xs font-semibold text-on-surface-variant'>
                    Note
                  </span>
                  <textarea
                    className='min-h-[90px] resize-y rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm leading-6 outline-none focus:border-primary-container'
                    value={ed.note ?? ""}
                    onChange={(e) =>
                      updateEducation(index, {
                        ...ed,
                        note: e.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={save}
          disabled={saveState.status === "saving"}
          className={[
            "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-container px-5 text-sm font-bold text-white shadow-sm",
            saveState.status === "saving" ? "opacity-60" : "",
          ].join(" ")}>
          {saveState.status === "saving" ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>

        {saveState.status === "saved" ? (
          <p className='text-sm font-semibold text-primary-container'>
            Tersimpan • {new Date(saveState.savedAt).toLocaleTimeString()}
          </p>
        ) : null}
        {saveState.status === "error" ? (
          <p className='text-sm font-semibold text-error'>
            {saveState.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
