
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  UserRound,
  Camera,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";

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

const initialProfile: Profile = {
  profile_name: "",
  profile_role: "",
  profile_location: "",
  profile_email: "",
  profile_intro: "",
  profile_about: "",
  profile_github: "",
  profile_linkedin: "",
  profile_leetcode: "",
  profile_image_url: "",
  profile_resume_url: "",
};

const fields: {
  key: keyof Profile;
  label: string;
  placeholder: string;
  type?: string;
  multiline?: boolean;
}[] = [
  { key: "profile_name", label: "Full name", placeholder: "Your name" },
  { key: "profile_role", label: "Professional role", placeholder: "Frontend Developer" },
  { key: "profile_location", label: "Location", placeholder: "City, Country" },
  { key: "profile_email", label: "Email address", placeholder: "you@example.com", type: "email" },
  { key: "profile_intro", label: "Short introduction", placeholder: "A short line about yourself...", multiline: true },
  { key: "profile_about", label: "About me", placeholder: "Write about your background, interests and goals...", multiline: true },
  { key: "profile_github", label: "GitHub URL", placeholder: "https://github.com/username", type: "url" },
  { key: "profile_linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username", type: "url" },
  { key: "profile_leetcode", label: "LeetCode URL", placeholder: "https://leetcode.com/u/username", type: "url" },
  { key: "profile_resume_url", label: "Resume URL", placeholder: "/resume.pdf" },
];

export default function ProfileManagementPage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/admin/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load profile.");
        }

        setProfile({
          ...initialProfile,
          ...data.profile,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function updateField(key: keyof Profile, value: string) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Image upload failed.");
      }

      setProfile((current) => ({
        ...current,
        profile_image_url: data.imageUrl,
      }));

      setMessage("Photo uploaded! Click Save Changes to publish it.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const reason = data?.message || `Save failed (HTTP ${response.status}).`;
        throw new Error(reason);
      }

      setMessage("Your profile has been saved successfully. Your homepage will now use these details.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#e4e1d9] bg-white px-4 py-3 text-sm text-[#334b3d] outline-none transition focus:border-[#718b70] focus:ring-2 focus:ring-[#718b70]/10";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#536b58]">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-8 text-[#334b3d] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#82917e]">
            <UserRound size={16} />
            Admin Studio / Profile
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl">
            Profile Management
          </h1>

          <p className="mt-2 text-sm text-[#778174]">
            Manage the personal information visitors see on your portfolio.
          </p>
        </div>

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile photo */}
          <section className="rounded-2xl border border-[#e8e4da] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <h2 className="font-serif text-xl">Profile photograph</h2>
              <p className="mt-1 text-sm text-[#879084]">
                This photo will appear in the hero section of your portfolio.
              </p>
            </div>

            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#e8eddf] bg-[#f0eee6]">
                {profile.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={48} className="text-[#9aa895]" />
                )}
              </div>

              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#334b3d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#263c30]">
                  {uploading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Camera size={17} />
                  )}
                  {uploading ? "Uploading..." : "Upload / Change Photo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <p className="mt-3 text-xs text-[#92988e]">
                  JPG, PNG or WEBP · Maximum size 5 MB
                </p>

                {profile.profile_image_url && (
                  <button
                    type="button"
                    onClick={() => updateField("profile_image_url", "")}
                    className="mt-3 text-xs text-red-600 hover:underline"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Personal information */}
          <section className="rounded-2xl border border-[#e8e4da] bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 font-serif text-xl">
              Personal information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className={field.multiline ? "sm:col-span-2" : ""}
                >
                  <label className="mb-2 block text-sm font-medium text-[#52634f]">
                    {field.label}
                  </label>

                  {field.multiline ? (
                    <textarea
                      value={profile[field.key]}
                      onChange={(e) =>
                        updateField(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      rows={field.key === "profile_about" ? 5 : 3}
                      className={inputClass + " resize-y"}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={profile[field.key]}
                      onChange={(e) =>
                        updateField(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Save */}
          <div className="flex flex-col gap-3 border-t border-[#e5e1d7] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#92988e]">
              Remember to save your changes before leaving this page.
            </p>

            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#334b3d] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#263c30] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
