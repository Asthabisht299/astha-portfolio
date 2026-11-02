
"use client";

import { useEffect, useState, type FormEvent } from "react";

type Certificate = {
  id: number;
  title: string;
  issuer: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  certificate_url: string | null;
  issue_date: string | null;
  is_published: number;
  sort_order: number;
};

type CertificateForm = {
  title: string;
  issuer: string;
  description: string;
  category: string;
  image_url: string;
  certificate_url: string;
  issue_date: string;
  is_published: boolean;
  sort_order: number;
};

const emptyForm: CertificateForm = {
  title: "",
  issuer: "",
  description: "",
  category: "",
  image_url: "",
  certificate_url: "",
  issue_date: "",
  is_published: true,
  sort_order: 1,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #deded8",
  borderRadius: "9px",
  background: "#fff",
  color: "#26352b",
  fontSize: "14px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#465449",
};

export default function CertificatesManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [form, setForm] = useState<CertificateForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCertificates() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/certificates", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load certificates.");
      }

      setCertificates(data.certificates || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCertificates();
  }, []);

  function updateField(
    field: keyof CertificateForm,
    value: string | boolean | number
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      sort_order: certificates.length + 1,
    });
    setEditingId(null);
  }

  function editCertificate(certificate: Certificate) {
    setEditingId(certificate.id);

    setForm({
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      description: certificate.description || "",
      category: certificate.category || "",
      image_url: certificate.image_url || "",
      certificate_url: certificate.certificate_url || "",
      issue_date: certificate.issue_date
        ? String(certificate.issue_date).slice(0, 10)
        : "",
      is_published: Boolean(certificate.is_published),
      sort_order: certificate.sort_order ?? 0,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/certificates", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          id: editingId,
          issue_date: form.issue_date || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save certificate.");
      }

      setMessage(data.message || "Certificate saved successfully.");
      resetForm();
      await loadCertificates();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCertificate(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certificate? This cannot be undone."
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/certificates?id=${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete certificate.");
      }

      setMessage("Certificate deleted successfully.");

      if (editingId === id) resetForm();

      await loadCertificates();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f5ef",
        padding: "clamp(20px, 4vw, 48px)",
        color: "#26352b",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "30px" }}>
          <p
            style={{
              color: "#71816f",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Admin Studio / Content
          </p>

          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 700,
              margin: "10px 0",
            }}
          >
            Certificates Management
          </h1>

          <p style={{ color: "#718078", fontSize: "14px" }}>
            Add, edit, publish, and organize your certificates.
          </p>
        </div>

        {message && (
          <div
            style={{
              padding: "13px 16px",
              background: "#e5f2e6",
              color: "#315c39",
              borderRadius: "9px",
              marginBottom: "18px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "13px 16px",
              background: "#fce8e6",
              color: "#a13c32",
              borderRadius: "9px",
              marginBottom: "18px",
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: "#fff",
            border: "1px solid #e8e5dc",
            borderRadius: "16px",
            padding: "clamp(18px, 3vw, 30px)",
            marginBottom: "32px",
            boxShadow: "0 8px 30px rgba(40, 55, 43, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
              {editingId ? "Edit Certificate" : "Add New Certificate"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  border: "1px solid #d8ded6",
                  background: "#fff",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "18px",
              }}
            >
              <div>
                <label style={labelStyle}>Certificate Title *</label>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Web Development"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Issuing Organization</label>
                <input
                  style={inputStyle}
                  value={form.issuer}
                  onChange={(e) => updateField("issuer", e.target.value)}
                  placeholder="e.g. Agratas Academy"
                />
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <input
                  style={inputStyle}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="e.g. WEB TECHNOLOGY"
                />
              </div>

              <div>
                <label style={labelStyle}>Issue Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={form.issue_date}
                  onChange={(e) => updateField("issue_date", e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Certificate Image Path</label>
                <input
                  style={inputStyle}
                  value={form.image_url}
                  onChange={(e) => updateField("image_url", e.target.value)}
                  placeholder="/certificates/your-image.png"
                />
              </div>

              <div>
                <label style={labelStyle}>Certificate PDF Path</label>
                <input
                  style={inputStyle}
                  value={form.certificate_url}
                  onChange={(e) =>
                    updateField("certificate_url", e.target.value)
                  }
                  placeholder="/certificates/your-certificate.pdf"
                />
              </div>

              <div>
                <label style={labelStyle}>Display Order</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={form.sort_order}
                  onChange={(e) =>
                    updateField("sort_order", Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <input
                  style={inputStyle}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Short certificate description"
                />
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "22px",
                fontSize: "14px",
                color: "#465449",
              }}
            >
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  updateField("is_published", e.target.checked)
                }
              />
              Publish this certificate on my portfolio
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: "24px",
                padding: "13px 22px",
                background: "#334b3d",
                color: "#fff",
                border: "none",
                borderRadius: "9px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Certificate"
                  : "Add Certificate"}
            </button>
          </form>
        </section>

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <h2 style={{ fontSize: "21px", fontWeight: 700 }}>
              Your Certificates ({certificates.length})
            </h2>

            <button
              onClick={loadCertificates}
              style={{
                padding: "9px 14px",
                border: "1px solid #d8ded6",
                background: "#fff",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p style={{ color: "#718078" }}>Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e5dc",
                borderRadius: "14px",
                padding: "30px",
                textAlign: "center",
                color: "#718078",
              }}
            >
              No certificates added yet. Use the form above to add your first
              certificate.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {certificates.map((certificate) => (
                <article
                  key={certificate.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    flexWrap: "wrap",
                    background: "#fff",
                    border: "1px solid #e8e5dc",
                    borderRadius: "14px",
                    padding: "18px",
                  }}
                >
                  {certificate.image_url ? (
                    <img
                      src={certificate.image_url}
                      alt={certificate.title}
                      style={{
                        width: "110px",
                        height: "82px",
                        objectFit: "contain",
                        background: "#f7f5ef",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "110px",
                        height: "82px",
                        background: "#f0eee7",
                        borderRadius: "8px",
                        display: "grid",
                        placeItems: "center",
                        color: "#718078",
                        fontSize: "12px",
                      }}
                    >
                      No image
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: 700 }}>
                      {certificate.title}
                    </h3>

                    <p
                      style={{
                        color: "#718078",
                        fontSize: "13px",
                        marginTop: "5px",
                      }}
                    >
                      {certificate.issuer || "No issuer"} ·{" "}
                      {certificate.category || "Uncategorized"}
                    </p>

                    <p
                      style={{
                        color: certificate.is_published ? "#397448" : "#a36b35",
                        fontSize: "12px",
                        fontWeight: 600,
                        marginTop: "8px",
                      }}
                    >
                      {certificate.is_published ? "Published" : "Draft"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "9px" }}>
                    <button
                      onClick={() => editCertificate(certificate)}
                      style={{
                        padding: "9px 14px",
                        border: "1px solid #d8ded6",
                        background: "#fff",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteCertificate(certificate.id)}
                      style={{
                        padding: "9px 14px",
                        border: "1px solid #efd5d1",
                        background: "#fff5f3",
                        color: "#a13c32",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
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
