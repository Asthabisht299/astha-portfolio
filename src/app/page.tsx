
"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Navbar from "../components/Navbar";
import "../components/Portfolio.css";
import {
  ArrowDown,
  ArrowUpRight,
  Mail,
  Sparkles,
  Download,
  Eye,
} from "lucide-react";

type Project = {
  id: number;
  title: string;
  description: string | null;
  tech_stack: string[] | string | null;
  image_url: string | null;
  github_url: string | null;
  project_url: string | null;
  category: string | null;
  is_published: boolean | number;
  sort_order: number;
};

type Skill = {
  id: number;
  name: string;
  category: string;
  proficiency: string | null;
  sort_order: number;
};

type Experience = {
  id: number;
  job_title: string;
  company: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | number;
  description: string | null;
  sort_order: number;
};

type Education = {
  id: number;
  degree: string;
  institution: string;
  location: string | null;
  start_year: number | string | null;
  end_year: number | string | null;
  grade: string | null;
  description: string | null;
  sort_order: number;
};

type Certificate = {
  id: number;
  title: string;
  issuer: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  certificate_url: string | null;
  issue_date: string | null;
  sort_order: number;
};

type Profile = {
  profile_name: string;
  profile_role: string;
  profile_location: string;
  profile_email: string;
  profile_intro: string;
  profile_about: string;
  profile_github: string;
  profile_linkedin: string;
  profile_leetcode: string;
  profile_image_url: string;
  profile_resume_url: string;
};

const defaultProfile: Profile = {
  profile_name: "Astha Bisht",
  profile_role: "Frontend Developer",
  profile_location: "Dehradun, Uttarakhand, India",
  profile_email: "bishtaastha123@gmail.com",
  profile_intro: "I build clean, responsive digital experiences with thoughtful design and modern web technologies.",
  profile_about: "I am a Computer Science and Engineering student interested in frontend development and software engineering. I enjoy turning ideas into clean, responsive and thoughtful digital experiences.",
  profile_github: "https://github.com/Asthabisht299",
  profile_linkedin: "https://www.linkedin.com/in/astha-bisht-s291105/",
  profile_leetcode: "https://leetcode.com/u/Astha_299/",
  profile_image_url: "",
  profile_resume_url: "/resume.pdf",
};



const reveal = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

function getTechStack(value: Project["tech_stack"]): string[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }

      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function formatMonthYear(value: string | null): string {
  if (!value) return "";

  const datePart = value.slice(0, 10);
  const date = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

function formatExperienceDate(item: Experience): string {
  const start = formatMonthYear(item.start_date);
  const end = item.is_current
    ? "PRESENT"
    : formatMonthYear(item.end_date);

  if (start && end) return `${start} — ${end}`;
  return start || end || "";
}

export default function Home() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  const socialLinks = [
    { label: "GitHub", short: "GH", href: profile.profile_github },
    { label: "LinkedIn", short: "in", href: profile.profile_linkedin },
    { label: "LeetCode", short: "LC", href: profile.profile_leetcode },
  ].filter((item) => Boolean(item.href));

  useEffect(() => {
    let active = true;
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.success && data.profile && active) {
          setProfile({ ...defaultProfile, ...data.profile });
        }
      } catch (error) {
        console.error("Profile loading error:", error);
      }
    }
    fetchProfile();
    return () => { active = false; };
  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState("");

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [experienceLoading, setExperienceLoading] = useState(true);
  const [experienceError, setExperienceError] = useState("");

  const [education, setEducation] = useState<Education[]>([]);
  const [educationLoading, setEducationLoading] = useState(true);
  const [educationError, setEducationError] = useState("");

  // CERTIFICATES STATE
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [certificatesError, setCertificatesError] = useState("");

  // FETCH PROJECTS FROM MYSQL
  useEffect(() => {
    async function fetchProjects() {
      try {
        setProjectsLoading(true);
        setProjectsError("");

        const response = await fetch("/api/projects", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load projects.");
        }

        setProjects(data.projects || []);
      } catch (error) {
        console.error("Projects loading error:", error);
        setProjectsError(
          "Projects could not be loaded right now. Please check back soon."
        );
      } finally {
        setProjectsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // FETCH SKILLS FROM MYSQL
  useEffect(() => {
    async function fetchSkills() {
      try {
        setSkillsLoading(true);
        setSkillsError("");

        const response = await fetch("/api/skills", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load skills.");
        }

        setSkills(data.skills || []);
      } catch (error) {
        console.error("Skills loading error:", error);
        setSkillsError("Skills could not be loaded right now.");
      } finally {
        setSkillsLoading(false);
      }
    }

    fetchSkills();
  }, []);

  // FETCH EXPERIENCE FROM MYSQL
  useEffect(() => {
    async function fetchExperience() {
      try {
        setExperienceLoading(true);
        setExperienceError("");

        const response = await fetch("/api/experience", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load experience.");
        }

        setExperiences(data.experience || []);
      } catch (error) {
        console.error("Experience loading error:", error);
        setExperienceError(
          "Experience details could not be loaded right now."
        );
      } finally {
        setExperienceLoading(false);
      }
    }

    fetchExperience();
  }, []);

  // FETCH EDUCATION FROM MYSQL
  useEffect(() => {
    async function fetchEducation() {
      try {
        setEducationLoading(true);
        setEducationError("");

        const response = await fetch("/api/education", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load education.");
        }

        setEducation(data.education || []);
      } catch (error) {
        console.error("Education loading error:", error);
        setEducationError(
          "Education details could not be loaded right now."
        );
      } finally {
        setEducationLoading(false);
      }
    }

    fetchEducation();
  }, []);

  // FETCH CERTIFICATES FROM MYSQL
  useEffect(() => {
    async function fetchCertificates() {
      try {
        setCertificatesLoading(true);
        setCertificatesError("");

        const response = await fetch("/api/certificates", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load certificates.");
        }

        setCertificates(data.certificates || []);
      } catch (error) {
        console.error("Certificates loading error:", error);
        setCertificatesError(
          "Certificates could not be loaded right now."
        );
      } finally {
        setCertificatesLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  // GROUP SKILLS BY CATEGORY
  const groupedSkills = skills.reduce<Record<string, Skill[]>>(
    (groups, skill) => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }

      groups[skill.category].push(skill);
      return groups;
    },
    {}
  );

  const skillGroups = Object.entries(groupedSkills);

  return (
    <main className="portfolio-main">
      <a className="skip-to-content" href="#about">Skip to content</a>
      {/* AMBIENT BACKGROUND */}
      <div className="ambient-background" aria-hidden="true">
        <span className="ambient-orb orb-one" />
        <span className="ambient-orb orb-two" />
        <span className="ambient-orb orb-three" />
        <span className="ambient-grid" />
      </div>

      <div className="site-shell">
        {/* NAVIGATION */}
        <Navbar />

        {/* HERO */}
        <section className="hero" id="home">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              {(profile.profile_role || "FRONTEND DEVELOPER").toUpperCase()} · {(profile.profile_location || "INDIA").toUpperCase()}
            </div>

            <h1>
              Hello,
              <br />
              I&apos;m <em>{(profile.profile_name || "Astha Bisht").split(" ")[0]}.</em>
              <br />
              I build for
              <br />
              the web.
            </h1>

            <p className="hero-description">
              {profile.profile_intro}
            </p>

            <div className="hero-actions">
              <a href="#projects" className="primary-button">
                Explore my work <ArrowUpRight size={15} />
              </a>

              <a href="#about" className="text-link">
                A little about me <ArrowDown size={14} />
              </a>
            </div>

            <div className="hero-socials">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label} <ArrowUpRight size={12} />
                </a>
              ))}
            </div>

            <div className="hero-resume">
              <a href={profile.profile_resume_url || "/resume.pdf"} download>
                Download Resume <ArrowUpRight size={16} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero-art"
            initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
           <div className="art-circle">
  <div className="art-center">
    {profile.profile_image_url ? (
      <img
        src={profile.profile_image_url}
        alt={profile.profile_name || "Portfolio profile"}
        className="art-profile-image"
      />
    ) : (
      <div>
        <span>
          {(profile.profile_name || "Astha Bisht")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
          .
        </span>
        <small>Curious by nature</small>
      </div>
    )}
  </div>
</div>

<span className="art-star star-one">✳</span>
<span className="art-star star-two">✦</span>
<div className="art-note">creating with intention ♡</div>
          </motion.div>
        </section>

        {/* ABOUT */}
        <motion.section
          className="section"
          id="about"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          transition={{ duration: 0.7 }}
        >
          <div className="section-heading">
            <div>
              <div className="section-kicker">01 / A LITTLE INTRODUCTION</div>
              <h2>
                More than just
                <br />
                writing code.
              </h2>
            </div>

            <p className="section-side-note">
              A curious mind, a love for technology, and attention to the
              details that make digital experiences feel special.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-stamp">
              <Sparkles size={42} strokeWidth={1} />
            </div>

            <div className="about-copy">
              <p>
                I&apos;m <strong>{profile.profile_name || "Astha Bisht"}</strong>. {profile.profile_about || defaultProfile.profile_about}
              </p>

              <p>
                I enjoy creating clean, responsive and accessible interfaces.
                I believe good development is not only about making something
                work, but also about making it intuitive and enjoyable to use.
              </p>

              <p>
                I&apos;m continuously improving my programming fundamentals,
                experimenting with technologies and learning through
                practical projects.
              </p>

              <div className="about-signature">{profile.profile_name || "Astha Bisht"}.</div>
            </div>
          </div>
        </motion.section>

        {/* DYNAMIC SKILLS FROM MYSQL */}
        <motion.section
          className="section"
          id="skills"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          transition={{ duration: 0.7 }}
        >
          <div className="section-heading">
            <div>
              <div className="section-kicker">02 / MY TOOLKIT</div>
              <h2>Things I work with.</h2>
            </div>

            <p className="section-side-note">
              Technologies I&apos;ve worked with and concepts I&apos;m
              continuously improving.
            </p>
          </div>

          {skillsLoading ? (
            <div className="projects-note">Loading skills...</div>
          ) : skillsError ? (
            <div className="projects-note" role="status">
              {skillsError}
            </div>
          ) : skillGroups.length === 0 ? (
            <div className="projects-note">
              Skills are currently being updated. Check back soon.
            </div>
          ) : (
            <div className="skills-grid">
              {skillGroups.map(([category, categorySkills], index) => (
                <article className="skill-card" key={category}>
                  <div className="skill-card-heading">
                    <span className="skill-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="skill-card-count">
                      {String(categorySkills.length).padStart(2, "0")} skills
                    </span>
                  </div>

                  <h3>{category}</h3>

                  <ul className="skill-list" aria-label={`${category} skills`}>
                    {categorySkills.map((skill) => (
                      <li key={skill.id}>
                        <span>{skill.name}</span>
                        {skill.proficiency && (
                          <small>{skill.proficiency}</small>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </motion.section>

        {/* DYNAMIC EXPERIENCE & EDUCATION */}
        <motion.section
          className="section"
          id="experience"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          transition={{ duration: 0.7 }}
        >
          <div className="section-heading">
            <div>
              <div className="section-kicker">03 / THE JOURNEY SO FAR</div>
              <h2>Learning by doing.</h2>
            </div>

            <p className="section-side-note">
              Every experience is another opportunity to learn, grow and
              understand the craft a little better.
            </p>
          </div>

          {/* EXPERIENCE */}
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-date">EXPERIENCE</div>

              <div>
                <h3>Where I&apos;ve worked.</h3>
                {experienceLoading ? (
                  <p>Loading experience...</p>
                ) : experienceError ? (
                  <p role="status">{experienceError}</p>
                ) : experiences.length === 0 ? (
                  <p>Experience details are being updated.</p>
                ) : (
                  <div className="space-y-8">
                    {experiences.map((item) => (
                      <div key={item.id}>
                        <div className="timeline-date">
                          {formatExperienceDate(item)}
                        </div>

                        <h3>{item.job_title}</h3>
                        <p>
                          {item.company}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>

                        {item.description && <p>{item.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* EDUCATION */}
            <div className="timeline-item">
              <div className="timeline-date">EDUCATION</div>

              <div>
                <h3>Where I&apos;m learning.</h3>

                {educationLoading ? (
                  <p>Loading education...</p>
                ) : educationError ? (
                  <p role="status">{educationError}</p>
                ) : education.length === 0 ? (
                  <p>Education details are being updated.</p>
                ) : (
                  <div className="space-y-8">
                    {education.map((item) => (
                      <div key={item.id}>
                        <div className="timeline-date">
                          {item.start_year || ""}
                          {item.start_year && item.end_year ? " — " : ""}
                          {item.end_year || ""}
                          {item.end_year &&
                          Number(item.end_year) >= new Date().getFullYear()
                            ? " (EXPECTED)"
                            : ""}
                        </div>

                        <h3>{item.degree}</h3>
                        <p>
                          {item.institution}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>

                        {item.grade && <p>{item.grade}</p>}
                        {item.description && <p>{item.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* DYNAMIC PROJECTS FROM MYSQL */}
        <motion.section
          className="section"
          id="projects"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          transition={{ duration: 0.7 }}
        >
          <div className="section-heading">
            <div>
              <div className="section-kicker">04 / SELECTED WORK</div>
              <h2>Made with curiosity.</h2>
            </div>

            <p className="section-side-note">
              A selection of practical work, experiments and ideas brought
              to life through code.
            </p>
          </div>

          {projectsLoading ? (
            <div className="projects-note">Loading projects...</div>
          ) : projectsError ? (
            <div className="projects-note" role="status">
              {projectsError}
            </div>
          ) : projects.length === 0 ? (
            <div className="projects-note">
              New projects are currently in the making. Check back soon.
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project, index) => {
                const technologies = getTechStack(project.tech_stack);
                const projectNumber = String(index + 1).padStart(2, "0");

                return (
                  <article className="project-card" key={project.id}>
                    <div
                      className={`project-art ${
                        index % 2 === 0 ? "one" : "two"
                      }`}
                    >
                      {project.image_url ? (
                        <div className="project-screenshot">
                          <img
                            src={project.image_url}
                            alt={`${project.title} screenshot`}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="project-art-number">
                            {projectNumber}
                          </span>
                          <div className="project-art-decoration">✳</div>
                          <span>{project.title}</span>
                        </>
                      )}
                    </div>

                    <div className="project-info">
                      <div className="project-meta">
                        <small>{project.category || "PROJECT"}</small>

                        <span className="project-status">
                          PUBLISHED PROJECT
                        </span>
                      </div>

                      <h3>{project.title}</h3>

                      <p>
                        {project.description ||
                          "A project built with curiosity and a focus on creating useful digital experiences."}
                      </p>

                      <div className="project-stack">
                        {technologies.map((tech, techIndex) => (
                          <span key={`${tech}-${techIndex}`}>{tech}</span>
                        ))}
                      </div>

                      <div className="project-actions">
                        {!project.github_url && !project.project_url && (
                          <span className="project-links-pending">
                            Project links coming soon
                          </span>
                        )}
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="project-link"
                          >
                            View source code <ArrowUpRight size={15} />
                          </a>
                        )}

                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="project-link project-live-link"
                          >
                            Live demo <ArrowUpRight size={15} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="projects-note">
            Every project is a new opportunity to learn and build something
            meaningful.
          </p>
        </motion.section>

        {/* DYNAMIC CERTIFICATES FROM MYSQL */}
        <motion.section
          className="section"
          id="certifications"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          transition={{ duration: 0.7 }}
        >
          <div className="section-heading">
            <div>
              <div className="section-kicker">05 / MILESTONES</div>
              <h2>Little achievements.</h2>
            </div>

            <p className="section-side-note">
              Learning never really stops. These are a couple of milestones
              along the way.
            </p>
          </div>

          {certificatesLoading ? (
            <div className="projects-note">Loading certificates...</div>
          ) : certificatesError ? (
            <div className="projects-note" role="status">
              {certificatesError}
            </div>
          ) : certificates.length === 0 ? (
            <div className="projects-note">
              New certificates are currently being added. Check back soon.
            </div>
          ) : (
            <div className="certificate-grid">
              {certificates.map((certificate, index) => (
                <motion.article
                  className="certificate-card"
                  key={certificate.id}
                  whileHover={{ y: -7 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="certificate-preview">
                    {certificate.image_url ? (
                      <img
                        src={certificate.image_url}
                        alt={`${certificate.issuer || ""} ${certificate.title} certificate`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="projects-note">
                        Certificate preview unavailable
                      </div>
                    )}

                    {certificate.certificate_url && (
                      <div className="certificate-preview-overlay">
                        <a
                          href={certificate.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Preview ${certificate.title} certificate`}
                        >
                          <Eye size={17} />
                          View certificate
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="certificate-card-info">
                    <div className="certificate-card-top">
                      <small>
                        {certificate.category || "CERTIFICATION"}
                      </small>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <h3>{certificate.title}</h3>
                    <p>{certificate.issuer || "Certificate issuer"}</p>

                    {certificate.description && (
                      <p className="certificate-description">
                        {certificate.description}
                      </p>
                    )}

                    {certificate.issue_date && (
                      <p className="certificate-description">
                        Issued: {certificate.issue_date.slice(0, 10)}
                      </p>
                    )}

                    {certificate.certificate_url ? (
                      <div className="certificate-actions">
                        <a
                          href={certificate.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Certificate <ArrowUpRight size={15} />
                        </a>

                        <a href={certificate.certificate_url} download>
                          <Download size={15} />
                          Download
                        </a>
                      </div>
                    ) : (
                      <p className="certificate-unavailable">
                        Certificate file will be available soon.
                      </p>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <div className="site-shell contact-inner">
          <div>
            <div className="section-kicker">06 / YOUR TURN</div>

            <h2>
              Have an idea?
              <br />
              Let&apos;s make it real.
            </h2>

            <p>
              I&apos;m open to connecting, learning from others and exploring
              internship and entry-level opportunities in software and
              frontend development.
            </p>
          </div>

          <a
            href={`mailto:${profile.profile_email || defaultProfile.profile_email}`}
            className="contact-button"
          >
            Say hello <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-shell footer">
        <div>
          <span>© 2026 Astha Bisht</span>
          <p>Designed with curiosity. Built with care.</p>
        </div>

        <div className="footer-links">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              title={social.label}
            >
              <span>{social.short}</span>
            </a>
          ))}

          <a
            href={`mailto:${profile.profile_email || defaultProfile.profile_email}`}
            aria-label="Email"
            title="Email"
          >
            <Mail size={16} />
          </a>

          <a
            href="/admin"
            className="admin-access"
            aria-label="Admin login"
            title="Admin login"
          >
            <span>Admin Access</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>
    </main>
  );
}
