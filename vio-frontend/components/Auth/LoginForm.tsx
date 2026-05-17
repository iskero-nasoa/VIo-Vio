"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LoginPayload, ValidationErrors } from "@/types/auth";
import { validateLoginForm } from "@/utils/validation";
import { Eye, EyeOff, MessageCircle, AlertCircle, Loader2 } from "lucide-react";

export default function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginPayload>({ email: "", password: "" });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateLoginForm(formData);
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }
    setValidationErrors({});
    try { await login(formData); } catch {}
  };

  const baseInput: React.CSSProperties = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, background 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    color: "#ffffff",
    marginBottom: "10px",
    letterSpacing: "0.3px",
  };

  return (
    <>
      {/* Glass card */}
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "2px solid rgba(255,255,255,0.25)",
          borderRadius: "28px",
          padding: "48px 40px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Logo icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(79,70,229,0.4)",
            }}
          >
            <MessageCircle size={36} color="#ffffff" fill="#ffffff" />
          </div>
        </div>

        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            margin: "0 0 36px",
          }}
        >
          Sign in to continue to VioApp
        </p>

        <form onSubmit={handleSubmit}>
          {/* API error */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: "14px",
                padding: "12px 16px",
                marginBottom: "20px",
                color: "#fca5a5",
                fontSize: "14px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="email" style={labelStyle}>Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              autoComplete="email"
              style={{
                ...baseInput,
                borderColor: validationErrors.email ? "rgba(239,68,68,0.65)" : "rgba(255,255,255,0.3)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                e.currentTarget.style.background = "rgba(255,255,255,0.22)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = validationErrors.email
                  ? "rgba(239,68,68,0.65)"
                  : "rgba(255,255,255,0.3)";
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              }}
            />
            {validationErrors.email && (
              <p style={{ color: "#fca5a5", fontSize: "12px", marginTop: "6px" }}>{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px" }}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  ...baseInput,
                  paddingRight: "52px",
                  borderColor: validationErrors.password ? "rgba(239,68,68,0.65)" : "rgba(255,255,255,0.3)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.22)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.password
                    ? "rgba(239,68,68,0.65)"
                    : "rgba(255,255,255,0.3)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: "4px",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <p style={{ color: "#fca5a5", fontSize: "12px", marginTop: "6px" }}>{validationErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 24px",
              borderRadius: "14px",
              border: "none",
              background: "#ffffff",
              color: "#7c3aed",
              fontSize: "18px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
              opacity: isLoading ? 0.75 : 1,
              transition: "background 0.2s, transform 0.1s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.18)"; } }}
            onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.12)"; } }}
            onMouseDown={(e) => { if (!isLoading) e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* Sign up link */}
          <p style={{ textAlign: "center", fontSize: "15px", margin: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>New to VioApp? </span>
            <Link
              href="/auth/register"
              style={{ color: "#ffffff", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>

      <style>{`input::placeholder { color: rgba(255,255,255,0.5); }`}</style>
    </>
  );
}
