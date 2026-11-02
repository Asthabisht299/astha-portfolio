
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";

type Education = {
  id: number;
  degree: string;
  institution: string;
  location: string | null;
  start_year: number | string | null;
  end_year: number | string | null;
  grade: string | null;
  description: string | null;
  is_published: number | boolean;
  sort_order: number;
};

type EducationForm = {
  degree: string;
  institution: string;
  location: string;
  start_year: string;
  end_year: string;
  grade: string;
  description: string;
  is_published: boolean;
  sort_order: string;
};

const emptyForm: EducationForm = {
  degree: "",
  institution: "",
  location: "",
  start_year: "",
  end_year: "",
  grade: "",
  description: "",
  is_published: true,
  sort_order: "0",
};

export default function EducationManagementPage() {
  const [education, setEducation] = useState<Education[]>([]);
  const [form, setForm] = useState<EducationForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchEducation() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/education", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load education records.");
      }

      setEducation(data.education || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEducation();
  }, []);

  function updateField(
    field: keyof EducationForm,
    value: string | boolean
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(item: Education) {
    setEditingId(item.id);
    setForm({
      degree: item.degree || "",
      institution: item.institution || "",
      location: item.location || "",
      start_year: item.start_year?.toString() || "",
      end_year: item.end_year?.toString() || "",
      grade: item.grade || "",
      description: item.description || "",
      is_published: Boolean(item.is_published),
      sort_order: item.sort_order?.toString() || "0",
    });
    setMessage("");
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        start_year: form.start_year ? Number(form.start_year) : null,
        end_year: form.end_year ? Number(form.end_year) : null,
        sort_order: Number(form.sort_order) || 0,
        id: editingId,
      };

      const response = await fetch("/api/admin/education", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save education.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage(
        editingId
          ? "Education updated successfully."
          : "Education added successfully."
      );

      await fetchEducation();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this education record?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/education?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete education.");
      }

      setMessage("Education record deleted.");
      await fetchEducation();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  async function togglePublish(item: Education) {
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/education", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          id: item.id,
          is_published: !Boolean(item.is_published),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update publishing status.");
      }

      await fetchEducation();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  const publishedCount = education.filter(
    (item) => Boolean(item.is_published)
  ).length;

  return (
    <main className="min-h-screen bg-[#F7F5EF] px-5 py-10 text-[#334B3D] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#8A9A83]">
              Admin Studio / Content
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Education
              <span className="font-serif italic text-[#A5B69A]">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#718073]">
              Manage your academic background and qualifications displayed
              on your portfolio.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#334B3D] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#263B30]"
          >
            <Plus size={17} />
            Add Education
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E7E5DC] bg-white p-5">
            <div className="flex items-center gap-3 text-[#8A9A83]">
              <GraduationCap size={19} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Total Records
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold">{education.length}</p>
          </div>

          <div className="rounded-2xl border border-[#E7E5DC] bg-white p-5">
            <div className="flex items-center gap-3 text-[#8A9A83]">
              <Eye size={18} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Published
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold">{publishedCount}</p>
          </div>

          <div className="rounded-2xl border border-[#E7E5DC] bg-white p-5">
            <div className="flex items-center gap-3 text-[#8A9A83]">
              <BookOpen size={18} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Drafts
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold">
              {education.length - publishedCount}
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-[#C8D8C2] bg-[#EDF3E9] px-4 py-3 text-sm text-[#334B3D]">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-3xl border border-[#E7E5DC] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A5B69A]">
                  {editingId ? "Update record" : "New record"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {editingId ? "Edit Education" : "Add Education"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 transition hover:bg-[#F3F2EC]"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Degree / Qualification *
                  <input
                    required
                    value={form.degree}
                    onChange={(e) => updateField("degree", e.target.value)}
                    placeholder="e.g. B.Tech in Computer Science"
                    className="mt-2 w-full rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Institution *
                  <input
                    required
                    value={form.institution}
                    onChange={(e) => updateField("institution", e.target.value)}
                    placeholder="College or university name"
                    className="mt-2 w-full rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Location
                  <input
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. Dehradun, India"
                    className="mt-2 w-full rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Grade / Score
                  <input
                    value={form.grade}
                    onChange={(e) => updateField("grade", e.target.value)}
                    placeholder="e.g. CGPA: 7.0"
                    className="mt-2 w-full rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Start Year
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    value={form.start_year}
                    onChange={(e) => updateField("start_year", e.target.value)}
                    placeholder="e.g. 2023"
                    className="mt-2 w-full rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  End Year
                  <input
                    type="number"
                    min="1950"
                    max="2100"
                    value={form.end_year}
                    onChange={(e) => updateField("end_year", e.target.value)}
                    placeholder="e.g. 2027"
                    className="mt-2 w-full rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                </label>

                <label className="block text-sm font-medium sm:col-span-2">
                  Description
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Add a short description of your studies..."
                    className="mt-2 w-full resize-y rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Sort Order
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => updateField("sort_order", e.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#E5E5DC] bg-[#FCFBF8] px-4 py-3 font-normal outline-none transition focus:border-[#8A9A83]"
                  />
                  <span className="mt-1 block text-xs font-normal text-[#899487]">
                    Lower numbers appear first.
                  </span>
                </label>

                <div className="flex flex-col justify-center gap-3">
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) =>
                        updateField("is_published", e.target.checked)
                      }
                      className="h-4 w-4 accent-[#334B3D]"
                    />
                    Publish on portfolio
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[#EEEDE6] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#334B3D] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#263B30] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Education"
                      : "Save Education"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-[#E5E5DC] px-7 py-3 text-sm font-medium transition hover:bg-[#F7F5EF]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Education Records</h2>
            <span className="text-xs text-[#899487]">
              {education.length} record{education.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#E7E5DC] bg-white p-10 text-center text-sm text-[#899487]">
              Loading education records...
            </div>
          ) : education.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D9D8CE] bg-white p-12 text-center">
              <GraduationCap
                size={35}
                className="mx-auto mb-4 text-[#A5B69A]"
              />
              <h3 className="font-semibold">No education records yet</h3>
              <p className="mt-2 text-sm text-[#899487]">
                Add your academic details to display them on your portfolio.
              </p>
              <button
                onClick={openAddForm}
                className="mt-5 rounded-full bg-[#334B3D] px-6 py-2.5 text-sm text-white"
              >
                Add your first record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {education.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#E7E5DC] bg-white p-5 transition hover:shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1E9] text-[#536B50]">
                        <GraduationCap size={23} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {item.degree}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                              Boolean(item.is_published)
                                ? "bg-[#EAF1E6] text-[#536B50]"
                                : "bg-[#F1F0EB] text-[#858579]"
                            }`}
                          >
                            {Boolean(item.is_published)
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-[#718073]">
                          {item.institution}
                        </p>

                        <p className="mt-2 text-xs text-[#92988D]">
                          {[item.location, item.start_year, item.end_year]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {item.grade && (
                          <p className="mt-2 text-sm text-[#536B50]">
                            {item.grade}
                          </p>
                        )}

                        {item.description && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#81877D]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:self-start">
                      <button
                        onClick={() => togglePublish(item)}
                        title={
                          Boolean(item.is_published)
                            ? "Unpublish"
                            : "Publish"
                        }
                        className="rounded-xl border border-[#E7E5DC] p-2.5 transition hover:bg-[#F7F5EF]"
                      >
                        {Boolean(item.is_published) ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>

                      <button
                        onClick={() => openEditForm(item)}
                        title="Edit"
                        className="rounded-xl border border-[#E7E5DC] p-2.5 transition hover:bg-[#F7F5EF]"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        className="rounded-xl border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50"
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
