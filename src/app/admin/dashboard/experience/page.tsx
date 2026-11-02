
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react";

type Experience = {
  id: number;
  job_title: string;
  company: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | number;
  description: string | null;
  is_published: boolean | number;
  sort_order: number;
};

type ExperienceForm = {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  is_published: boolean;
  sort_order: number;
};

const emptyForm: ExperienceForm = {
  job_title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  is_published: true,
  sort_order: 0,
};

function formatDate(value: string | null) {
  if (!value) return "Not specified";

  const date = value.slice(0, 10);
  const [year, month] = date.split("-");

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${monthNames[Number(month) - 1] || ""} ${year}`;
}

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default function ExperienceManagement() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [form, setForm] = useState<ExperienceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchExperiences() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/experience", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load experience.");
      }

      setExperiences(data.experience || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load experience records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExperiences();
  }, []);

  function updateField<K extends keyof ExperienceForm>(
    field: K,
    value: ExperienceForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(item: Experience) {
    setEditingId(item.id);

    setForm({
      job_title: item.job_title,
      company: item.company,
      location: item.location || "",
      start_date: dateInputValue(item.start_date),
      end_date: dateInputValue(item.end_date),
      is_current: Boolean(item.is_current),
      description: item.description || "",
      is_published: Boolean(item.is_published),
      sort_order: item.sort_order ?? 0,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/experience", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          id: editingId,
          end_date: form.is_current ? null : form.end_date || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save experience.");
      }

      setMessage(data.message || "Experience saved successfully.");
      closeForm();
      await fetchExperiences();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/experience?id=${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete experience.");
      }

      setMessage("Experience deleted successfully.");
      await fetchExperiences();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete experience."
      );
    }
  }

  async function togglePublish(item: Experience) {
    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/experience", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          job_title: item.job_title,
          company: item.company,
          location: item.location || "",
          start_date: dateInputValue(item.start_date) || null,
          end_date: item.is_current
            ? null
            : dateInputValue(item.end_date) || null,
          is_current: Boolean(item.is_current),
          description: item.description || "",
          is_published: !Boolean(item.is_published),
          sort_order: item.sort_order,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update publishing status.");
      }

      setMessage(
        item.is_published
          ? "Experience unpublished."
          : "Experience published."
      );

      await fetchExperiences();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    }
  }

  const publishedCount = experiences.filter(
    (item) => Boolean(item.is_published)
  ).length;

  return (
    <main className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#334B3D] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#82917E]">
              <BriefcaseBusiness size={15} />
              Admin Studio / Experience
            </div>

            <h1 className="font-serif text-4xl">
              Experience
            </h1>

            <p className="mt-2 text-sm text-[#748174]">
              Manage your internships, work experience and professional journey.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-full bg-[#334B3D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24372C]"
          >
            <Plus size={17} />
            Add Experience
          </button>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E2D8] bg-white p-5">
            <p className="text-sm text-[#82917E]">Total Experience</p>
            <p className="mt-2 text-3xl font-semibold">{experiences.length}</p>
          </div>

          <div className="rounded-2xl border border-[#E5E2D8] bg-white p-5">
            <p className="text-sm text-[#82917E]">Published</p>
            <p className="mt-2 text-3xl font-semibold">{publishedCount}</p>
          </div>

          <div className="rounded-2xl border border-[#E5E2D8] bg-white p-5">
            <p className="text-sm text-[#82917E]">Drafts</p>
            <p className="mt-2 text-3xl font-semibold">
              {experiences.length - publishedCount}
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-[#C9D9C5] bg-[#EDF4E9] p-4 text-sm text-[#334B3D]">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl border border-[#E5E2D8] bg-white p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl">
                  {editingId ? "Edit Experience" : "Add Experience"}
                </h2>
                <p className="mt-1 text-sm text-[#82917E]">
                  Enter your experience details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 transition hover:bg-[#F1F0E9]"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Job Title *
                  <input
                    required
                    value={form.job_title}
                    onChange={(e) =>
                      updateField("job_title", e.target.value)
                    }
                    placeholder="Web Development Intern"
                    className="mt-2 w-full rounded-xl border border-[#DEDCD2] bg-[#FCFBF8] px-4 py-3 outline-none focus:border-[#82917E]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Company *
                  <input
                    required
                    value={form.company}
                    onChange={(e) =>
                      updateField("company", e.target.value)
                    }
                    placeholder="Agratas Academy"
                    className="mt-2 w-full rounded-xl border border-[#DEDCD2] bg-[#FCFBF8] px-4 py-3 outline-none focus:border-[#82917E]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Location
                  <input
                    value={form.location}
                    onChange={(e) =>
                      updateField("location", e.target.value)
                    }
                    placeholder="Dehradun, India"
                    className="mt-2 w-full rounded-xl border border-[#DEDCD2] bg-[#FCFBF8] px-4 py-3 outline-none focus:border-[#82917E]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Sort Order
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      updateField("sort_order", Number(e.target.value))
                    }
                    className="mt-2 w-full rounded-xl border border-[#DEDCD2] bg-[#FCFBF8] px-4 py-3 outline-none focus:border-[#82917E]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Start Date
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      updateField("start_date", e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[#DEDCD2] bg-[#FCFBF8] px-4 py-3 outline-none focus:border-[#82917E]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  End Date
                  <input
                    type="date"
                    value={form.end_date}
                    disabled={form.is_current}
                    onChange={(e) =>
                      updateField("end_date", e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[#DEDCD2] bg-[#FCFBF8] px-4 py-3 outline-none focus:border-[#82917E] disabled:opacity-40"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_current}
                  onChange={(e) => {
                    updateField("is_current", e.target.checked);
                    if (e.target.checked) {
                      updateField("end_date", "");
                    }
                  }}
                  className="h-4 w-4 accent-[#334B3D]"
                />
                I currently work here
              </label>

              <label className="block text-sm font-medium">
                Description
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Describe your responsibilities, work and what you learned..."
                  className="mt-2 w-full rounded-xl border border-[#DEDCD2] bg-[#FCFBF8] px-4 py-3 outline-none focus:border-[#82917E]"
                />
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    updateField("is_published", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#334B3D]"
                />
                Publish this experience on my portfolio
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#334B3D] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#24372C] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Add Experience"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-[#DEDCD2] px-6 py-3 text-sm transition hover:bg-[#F7F5EF]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Your Experience</h2>
            <span className="text-sm text-[#82917E]">
              {experiences.length} records
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#E5E2D8] bg-white p-10 text-center text-sm text-[#82917E]">
              Loading experience...
            </div>
          ) : experiences.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D5D3C9] bg-white p-12 text-center">
              <BriefcaseBusiness
                size={34}
                className="mx-auto mb-4 text-[#82917E]"
              />
              <h3 className="font-serif text-xl">No experience added yet</h3>
              <p className="mt-2 text-sm text-[#82917E]">
                Add your internship or work experience to get started.
              </p>
              <button
                onClick={openAddForm}
                className="mt-5 rounded-full bg-[#334B3D] px-5 py-3 text-sm text-white"
              >
                Add your first experience
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E5E2D8] bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1E9] text-[#334B3D]">
                        <BriefcaseBusiness size={21} />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.job_title}
                        </h3>
                        <p className="mt-1 text-sm text-[#647563]">
                          {item.company}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#82917E]">
                          <CalendarDays size={14} />
                          {formatDate(item.start_date)} —{" "}
                          {Boolean(item.is_current)
                            ? "Present"
                            : formatDate(item.end_date)}
                        </div>

                        {item.description && (
                          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[#718071]">
                            {item.description}
                          </p>
                        )}

                        <span
                          className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs ${
                            item.is_published
                              ? "bg-[#EDF4E9] text-[#456344]"
                              : "bg-[#F2EFE8] text-[#827B69]"
                          }`}
                        >
                          {item.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-2">
                      <button
                        onClick={() => togglePublish(item)}
                        title={
                          item.is_published ? "Unpublish" : "Publish"
                        }
                        className="rounded-xl border border-[#E5E2D8] p-3 transition hover:bg-[#F7F5EF]"
                      >
                        {item.is_published ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>

                      <button
                        onClick={() => openEditForm(item)}
                        title="Edit"
                        className="rounded-xl border border-[#E5E2D8] p-3 transition hover:bg-[#F7F5EF]"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        className="rounded-xl border border-red-100 p-3 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
