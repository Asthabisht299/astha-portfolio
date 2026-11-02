
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  FolderKanban,
  Code2,
  ExternalLink,
  X,
  LoaderCircle,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Save,
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

const emptyForm = {
  title: "",
  description: "",
  category: "",
  tech_stack: "",
  image_url: "",
  github_url: "",
  project_url: "",
  is_published: false,
};

function getTechStack(value: Project["tech_stack"]): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProjects() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/projects");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load projects.");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  function openEditForm(project: Project) {
    setEditingId(project.id);

    setForm({
      title: project.title || "",
      description: project.description || "",
      category: project.category || "",
      tech_stack: getTechStack(project.tech_stack).join(", "),
      image_url: project.image_url || "",
      github_url: project.github_url || "",
      project_url: project.project_url || "",
      is_published: Boolean(project.is_published),
    });

    setShowForm(true);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const techStack = form.tech_stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/admin/projects", {
        method: editingId !== null ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingId !== null ? { id: editingId } : {}),
          title: form.title,
          description: form.description,
          category: form.category,
          tech_stack: techStack,
          image_url: form.image_url,
          github_url: form.github_url,
          project_url: form.project_url,
          is_published: form.is_published,
          sort_order:
            projects.find((project) => project.id === editingId)
              ?.sort_order || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save project.");
      }

      setMessage(
        editingId !== null
          ? "Project updated successfully."
          : "Your project has been added successfully."
      );

      closeForm();
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(project: Project) {
    const published = Boolean(project.is_published);
    const action = published ? "unpublish" : "publish";

    setActionId(project.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: project.id,
          title: project.title,
          description: project.description || "",
          category: project.category || "",
          tech_stack: getTechStack(project.tech_stack),
          image_url: project.image_url || "",
          github_url: project.github_url || "",
          project_url: project.project_url || "",
          is_published: !published,
          sort_order: project.sort_order || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Could not ${action} project.`);
      }

      setMessage(
        published
          ? "Project moved to drafts."
          : "Project published successfully."
      );

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionId(project.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/projects?id=${project.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete project.");
      }

      setMessage("Project deleted successfully.");
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="cms-page">
      <div className="cms-container">
        <header className="cms-topbar">
          <Link href="/admin/dashboard" className="cms-back-link">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <span className="cms-brand">
            astha<span>.</span> <small>ADMIN STUDIO</small>
          </span>
        </header>

        <section className="cms-heading">
          <div>
            <div className="cms-eyebrow">
              <FolderKanban size={15} />
              CONTENT MANAGEMENT
            </div>

            <h1>
              Your <em>projects.</em>
            </h1>

            <p>
              Manage the work you want visitors to discover on your portfolio.
            </p>
          </div>

          <button
            className="cms-primary-button"
            onClick={openAddForm}
          >
            <Plus size={17} />
            Add project
          </button>
        </section>

        <div className="cms-stats">
          <div className="cms-stat-card">
            <span>Total projects</span>
            <strong>{projects.length}</strong>
          </div>

          <div className="cms-stat-card">
            <span>Published</span>
            <strong>
              {
                projects.filter((project) =>
                  Boolean(project.is_published)
                ).length
              }
            </strong>
          </div>

          <div className="cms-stat-card">
            <span>Drafts</span>
            <strong>
              {
                projects.filter(
                  (project) => !Boolean(project.is_published)
                ).length
              }
            </strong>
          </div>
        </div>

        {message && <div className="cms-success">{message}</div>}
        {error && <div className="cms-error">{error}</div>}

        {showForm && (
          <section className="cms-form-card">
            <div className="cms-form-heading">
              <div>
                <span className="cms-eyebrow">
                  {editingId !== null ? "EDIT PROJECT" : "NEW ADDITION"}
                </span>
                <h2>
                  {editingId !== null ? "Update project" : "Add a project"}
                </h2>
              </div>

              <button
                className="cms-close-button"
                onClick={closeForm}
                aria-label="Close form"
                type="button"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="cms-form">
              <label>
                Project title *
                <input
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="e.g. Café Website"
                />
              </label>

              <label>
                Category
                <input
                  maxLength={100}
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="e.g. FRONTEND DEVELOPMENT"
                />
              </label>

              <label className="cms-full-field">
                Description
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Briefly describe what you built..."
                />
              </label>

              <label className="cms-full-field">
                Technologies
                <input
                  value={form.tech_stack}
                  onChange={(event) =>
                    updateField("tech_stack", event.target.value)
                  }
                  placeholder="React, JavaScript, CSS"
                />
                <small>Separate each technology with a comma.</small>
              </label>

              <label className="cms-full-field">
                Project image URL
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(event) =>
                    updateField("image_url", event.target.value)
                  }
                  placeholder="https://example.com/project-image.png"
                />
              </label>

              <label>
                GitHub URL
                <input
                  type="url"
                  value={form.github_url}
                  onChange={(event) =>
                    updateField("github_url", event.target.value)
                  }
                  placeholder="https://github.com/..."
                />
              </label>

              <label>
                Live project URL
                <input
                  type="url"
                  value={form.project_url}
                  onChange={(event) =>
                    updateField("project_url", event.target.value)
                  }
                  placeholder="https://..."
                />
              </label>

              <label className="cms-publish-toggle">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    updateField("is_published", event.target.checked)
                  }
                />

                <span>
                  Publish this project immediately
                  <small>
                    Published projects can appear on your public portfolio
                    once we connect the public page.
                  </small>
                </span>
              </label>

              <div className="cms-form-actions">
                <button
                  type="button"
                  className="cms-secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="cms-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingId !== null ? (
                        <Save size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                      {editingId !== null ? "Save changes" : "Save project"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="cms-project-section">
          <div className="cms-list-heading">
            <div>
              <span className="cms-eyebrow">YOUR COLLECTION</span>
              <h2>All projects</h2>
            </div>

            <span className="cms-count">
              {projects.length}{" "}
              {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          {loading ? (
            <div className="cms-empty-state">
              <LoaderCircle className="cms-spin" size={25} />
              <p>Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="cms-empty-state">
              <FolderKanban size={34} strokeWidth={1.3} />

              <h3>Your project collection starts here.</h3>

              <p>
                Add your first project and it will appear in this space.
              </p>

              <button
                className="cms-primary-button"
                onClick={openAddForm}
              >
                <Plus size={16} />
                Add your first project
              </button>
            </div>
          ) : (
            <div className="cms-project-list">
              {projects.map((project) => {
                const technologies = getTechStack(project.tech_stack);
                const published = Boolean(project.is_published);
                const busy = actionId === project.id;

                return (
                  <article
                    className="cms-project-card"
                    key={project.id}
                  >
                    <div className="cms-project-image">
                      {project.image_url ? (
                        <img src={project.image_url} alt="" />
                      ) : (
                        <FolderKanban size={30} strokeWidth={1.2} />
                      )}
                    </div>

                    <div className="cms-project-content">
                      <div className="cms-project-meta">
                        <span>{project.category || "PROJECT"}</span>

                        <span
                          className={
                            published
                              ? "cms-status cms-status-published"
                              : "cms-status cms-status-draft"
                          }
                        >
                          {published ? (
                            <Eye size={12} />
                          ) : (
                            <EyeOff size={12} />
                          )}

                          {published ? "Published" : "Draft"}
                        </span>
                      </div>

                      <h3>{project.title}</h3>

                      <p>
                        {project.description ||
                          "No description added yet."}
                      </p>

                      <div className="cms-tech-list">
                        {technologies.map((tech) => (
                          <span key={tech}>{tech}</span>
                        ))}
                      </div>

                      <div className="cms-card-links">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Code2 size={14} />
                            GitHub
                            <ArrowUpRight size={12} />
                          </a>
                        )}

                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={14} />
                            Live site
                            <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>

                      <div
                        className="cms-form-actions"
                        style={{ marginTop: "18px", flexWrap: "wrap" }}
                      >
                        <button
                          type="button"
                          className="cms-secondary-button"
                          onClick={() => openEditForm(project)}
                          disabled={busy || saving}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="cms-secondary-button"
                          onClick={() => togglePublish(project)}
                          disabled={busy || saving}
                        >
                          {busy ? (
                            <LoaderCircle className="cms-spin" size={14} />
                          ) : published ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                          {published ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          className="cms-secondary-button"
                          onClick={() => deleteProject(project)}
                          disabled={busy || saving}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
