import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Scale } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      await login(
        form.email.trim().toLowerCase(),
        form.password,
      );

      navigate(from, { replace: true });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
        {/* Subtle background decoration */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-slate-800/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-slate-800/30 blur-3xl" />

        <div className="relative z-10 p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-white shadow-lg">
              <Scale size={24} strokeWidth={2} />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              LegalFlow AI
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl px-10 pb-16 xl:px-14">
          <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-slate-400">
            LEGAL WORKFLOW INTELLIGENCE
          </p>

          <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">
            Work smarter.
            <br />
            Keep human judgment
            <br />
            at the center.
          </h1>

          <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
            Prepare matters, organize legal work, and use AI
            to handle repetitive tasks while lawyers remain in
            control of important decisions.
          </p>

          <div className="mt-10 border-l-2 border-slate-600 pl-5">
            <span className="block text-sm text-slate-400">
              AI prepares.
            </span>

            <strong className="mt-1 block text-base font-semibold text-white">
              Humans decide.
            </strong>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-8 xl:px-14">
          <p className="text-xs text-slate-600">
            Secure legal workflow management
          </p>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Scale size={22} strokeWidth={2} />
            </div>

            <span className="text-lg font-semibold tracking-tight text-slate-900">
              LegalFlow AI
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-slate-500">
              WELCOME BACK
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Sign in to your workspace
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your credentials to access your legal
              workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@lawfirm.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-400">
            LegalFlow AI · Secure legal workflow management
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;