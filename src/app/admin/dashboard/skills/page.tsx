
"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Code2 } from "lucide-react";

type Skill = {
  id: number;
  name: string;
  category: string;
  proficiency: string | null;
  is_published: boolean | number;
  sort_order: number;
};

const categories = [
  "Frontend Development",
  "Programming",
  "Backend Development",
  "Database",
  "Tools & Platforms",
  "Currently Exploring",
  "Other",
];

const emptyForm = {
  name: "",
  category: "Frontend Development",
  proficiency: "",
  sort_order: 0,
  is_published: true,
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  async function loadSkills() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/skills", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load skills.");
      }

      setSkills(data.skills || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(skill: Skill) {
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency || "",
      sort_order: skill.sort_order,
      is_published: Boolean(skill.is_published),
    });
    setEditingId(skill.id);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/skills", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editingId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save skill.");
      }

      setMessage(data.message || "Skill saved successfully.");
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadSkills();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`/api/admin/skills?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete skill.");
      }

      setMessage("Skill deleted successfully.");
      await loadSkills();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  async function togglePublish(skill: Skill) {
    try {
      setError("");
      const response = await fetch("/api/admin/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...skill,
          is_published: !Boolean(skill.is_published),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update skill.");
      }

      setMessage("Skill visibility updated.");
      await loadSkills();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  const publishedCount = skills.filter(
    (skill) => Boolean(skill.is_published)
  ).length;

  const categoriesInUse = new Set(
    skills.map((skill) => skill.category)
  ).size;

  const visibleSkills =
    filter === "All"
      ? skills
      : filter === "Published"
        ? skills.filter((skill) => Boolean(skill.is_published))
        : filter === "Drafts"
          ? skills.filter((skill) => !Boolean(skill.is_published))
          : skills.filter((skill) => skill.category === filter);

  const filters = [
    "All",
    "Published",
    "Drafts",
    ...Array.from(new Set(skills.map((skill) => skill.category))),
  ];

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-[#334b3d] md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#899889]">
              ADMIN STUDIO / CONTENT
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Skills Management
            </h1>
            <p className="mt-2 text-sm text-[#788579]">
              Organize and manage the skills displayed on your portfolio.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-full bg-[#334b3d] px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#263b2f]"
          >
            <Plus size={17} />
            Add New Skill
          </button>
        </div>

        {/* NOTIFICATIONS */}
        {message && (
          <div className="mb-5 rounded-xl border border-[#b8cbb5] bg-[#edf4e9] p-4 text-sm text-[#334b3d]">
            {message}
            <button
              onClick={() => setMessage("")}
              className="float-right"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8e5dc] bg-white p-5">
            <p className="text-sm text-[#899889]">Total Skills</p>
            <h2 className="mt-2 text-3xl font-semibold">{skills.length}</h2>
          </div>

          <div className="rounded-2xl border border-[#e8e5dc] bg-white p-5">
            <p className="text-sm text-[#899889]">Published Skills</p>
            <h2 className="mt-2 text-3xl font-semibold">{publishedCount}</h2>
          </div>

          <div className="rounded-2xl border border-[#e8e5dc] bg-white p-5">
            <p className="text-sm text-[#899889]">Categories</p>
            <h2 className="mt-2 text-3xl font-semibold">{categoriesInUse}</h2>
          </div>
        </div>

        {/* ADD / EDIT FORM */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingId ? "Edit Skill" : "Add New Skill"}
                </h2>
                <p className="mt-1 text-sm text-[#899889]">
                  Enter the skill details below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 transition hover:bg-[#f2f0e9]"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Skill Name *
                </label>
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. React"
                  className="w-full rounded-xl border border-[#e5e3da] bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#78917b]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#e5e3da] bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#78917b]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Proficiency (Optional)
                </label>
                <select
                  value={form.proficiency}
                  onChange={(e) =>
                    setForm({ ...form, proficiency: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#e5e3da] bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#78917b]"
                >
                  <option value="">Not specified</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sort_order: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-[#e5e3da] bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#78917b]"
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  id="skill-published"
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_published: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#334b3d]"
                />
                <label htmlFor="skill-published" className="text-sm">
                  Publish this skill on my portfolio
                </label>
              </div>

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full bg-[#334b3d] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#263b2f] disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Skill"
                      : "Save Skill"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-[#dedbd1] px-6 py-3 text-sm transition hover:bg-[#f7f5ef]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FILTERS */}
        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                filter === item
                  ? "bg-[#334b3d] text-white"
                  : "border border-[#e5e3da] bg-white text-[#68776a] hover:border-[#334b3d]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* SKILLS LIST */}
        <div className="overflow-hidden rounded-2xl border border-[#e8e5dc] bg-white">
          <div className="border-b border-[#eeeae1] px-6 py-5">
            <h2 className="font-semibold">Your Skills</h2>
            <p className="mt-1 text-xs text-[#899889]">
              {visibleSkills.length} skills shown
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#899889]">
              Loading skills...
            </div>
          ) : visibleSkills.length === 0 ? (
            <div className="p-12 text-center">
              <Code2 size={32} className="mx-auto mb-3 text-[#a5b69a]" />
              <h3 className="font-medium">No skills found</h3>
              <p className="mt-2 text-sm text-[#899889]">
                Add your first skill to get started.
              </p>
              <button
                onClick={openAddForm}
                className="mt-5 rounded-full bg-[#334b3d] px-5 py-2.5 text-sm text-white"
              >
                Add a Skill
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#eeeae1]">
              {visibleSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-[#fbfaf7]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf1e9]">
                      <Code2 size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-medium">{skill.name}</h3>
                      <p className="mt-1 text-xs text-[#899889]">
                        {skill.category}
                        {skill.proficiency
                          ? ` · ${skill.proficiency}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => togglePublish(skill)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        Boolean(skill.is_published)
                          ? "bg-[#edf4e9] text-[#486b4d]"
                          : "bg-[#f3f0e9] text-[#8c806b]"
                      }`}
                    >
                      {Boolean(skill.is_published) ? "Published" : "Draft"}
                    </button>

                    <button
                      onClick={() => openEditForm(skill)}
                      title="Edit skill"
                      className="rounded-lg border border-[#e5e3da] p-2 transition hover:bg-[#edf1e9]"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(skill.id)}
                      title="Delete skill"
                      className="rounded-lg border border-[#e5e3da] p-2 text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/admin/dashboard"
            className="text-sm text-[#718171] underline underline-offset-4"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
