
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../../lib/auth";
export const instant = false;

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    redirect("/admin");
  }

  const session = await verifySession(token);

  if (!session || !session.sub) {
    redirect("/admin");
  }

  const username =
    typeof session.username === "string" ? session.username : "Admin";

  const sections = [
    {
      title: "Projects",
      description: "Add, edit and publish your projects.",
      href: "/admin/dashboard/projects",
      icon: "💻",
    },
    {
      title: "Skills",
      description: "Manage your technical skills.",
      href: "/admin/dashboard/skills",
      icon: "⚡",
    },
    {
      title: "Experience",
      description: "Manage internships and work experience.",
      href: "/admin/dashboard/experience",
      icon: "💼",
    },
    {
      title: "Education",
      description: "Update your academic details.",
      href: "/admin/dashboard/education",
      icon: "🎓",
    },
    {
      title: "Certificates",
      description: "Upload and manage certificates.",
      href: "/admin/dashboard/certificates",
      icon: "🏆",
    },
    {
      title: "Site Settings",
      description: "Manage profile details and resume.",
      href: "/admin/dashboard/settings",
      icon: "⚙️",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#334B3D]">
      <header className="border-b border-[#E7E3D9] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8A9B82]">
              Personal Portfolio
            </p>
            <h1 className="mt-1 font-serif text-2xl">Admin Studio</h1>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-xl border border-[#E5E3DA] px-4 py-2 text-sm font-semibold transition hover:bg-[#F7F5EF]"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="text-sm text-[#8A9B82]">Your workspace</p>
          <h2 className="mt-2 font-serif text-4xl">
            Welcome back, {username}.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#77766F]">
            Manage your portfolio content from one place. Changes will be
            reflected on your public website when published.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <a
              key={section.title}
              href={section.href}
              className="group rounded-2xl border border-[#E7E3D9] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#A5B69A] hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF1E9] text-2xl">
                {section.icon}
              </div>

              <h3 className="text-lg font-semibold">{section.title}</h3>

              <p className="mt-2 text-sm leading-6 text-[#85847C]">
                {section.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-[#82977C] transition group-hover:text-[#334B3D]">
                Manage section →
              </p>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#E7E3D9] bg-[#F0EEE6] p-6">
          <p className="text-sm font-semibold">Your public portfolio</p>
          <p className="mt-2 text-sm text-[#77766F]">
            Your public website remains separate from this private workspace.
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-[#526D55] underline underline-offset-4"
          >
            View website ↗
          </a>
        </div>
      </section>
    </main>
  );
}
