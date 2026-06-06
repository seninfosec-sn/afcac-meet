"use client";
import { useState, useRef, useEffect } from "react";
import { Loader2, Mail, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

type Step = "email" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) { const data = await res.json(); setError(data.error); return; }
    const data = await res.json();
    if (data.dev_otp) setDevOtp(data.dev_otp);
    setStep("otp");
    setResendCooldown(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = otp.join("");
    if (code.length < 6) { setError("Veuillez entrer le code à 6 chiffres."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }
    window.location.replace("/");
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (value && index === 5 && next.every(d => d)) submitOtpCode(next.join(""));
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }

  async function submitOtpCode(code: string) {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }
    window.location.replace("/");
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError(null);
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) { const data = await res.json(); setError(data.error); return; }
    const data = await res.json();
    if (data.dev_otp) setDevOtp(data.dev_otp);
    setResendCooldown(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  return (
    <div className="min-h-screen flex">

      {/* Gauche — bannière plein format */}
      <div className="hidden lg:flex flex-col relative flex-1 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner-expo.png"
          alt="AFCAC Expo"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-white/75 text-xs font-semibold tracking-widest uppercase mb-2">
            15 – 19 juin 2026 · Dakar
          </p>
          <h2 className="text-white text-3xl font-bold leading-snug">
            AFCAC Expo 2026
          </h2>
          <p className="text-white/60 text-sm mt-2">
            Plateforme de gestion des réservations bilatérales
          </p>
        </div>
      </div>

      {/* Droite — formulaire */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[460px] shrink-0 bg-background px-10 py-12">
        {/* Logo centré */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-border shadow-md p-2 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/afcac_logo.png"
              alt="AFCAC"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Afcac-expo-meet</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion de réservations</p>
        </div>

        <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-8 shadow-sm">
          {step === "email" ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground">Connexion</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Entrez votre adresse email pour recevoir un code de connexion.
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Adresse email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="vous@exemple.com"
                      required
                      autoFocus
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-brand text-white h-11 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Recevoir le code <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-brand" />
                  <h2 className="text-lg font-bold text-foreground">Code envoyé</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Entrez le code à 6 chiffres envoyé à{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                </p>
              </div>

              {devOtp && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-300 text-sm text-amber-800">
                  <span className="font-semibold">Mode développement</span> — Code :{" "}
                  <span className="font-mono font-bold tracking-widest text-base">{devOtp}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 rounded-xl border-2 border-input bg-background text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.some(d => !d)}
                  className="flex items-center justify-center gap-2 w-full bg-brand text-white h-11 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vérifier le code"}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => { setStep("email"); setError(null); setOtp(["","","","","",""]); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Changer d'email
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1.5 text-brand hover:text-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Connexion sécurisée · Sans mot de passe
        </p>
      </div>
    </div>
  );
}
