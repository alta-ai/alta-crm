import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Key, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

type LoginMode = "login" | "reset-password" | "magic-link";

function Login() {
	const [mode, setMode] = useState<LoginMode>("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const auth = useAuth();

	// Prüfe auf Erfolgsmeldungen aus dem Router-State
	useEffect(() => {
		const state = location.state as any;
		if (state?.message) {
			setSuccess(state.message);
			// Entferne die Nachricht aus dem State
			navigate(location.pathname, { replace: true, state: {} });
		}
		if (state?.error) {
			setError(state.error);
			// Entferne die Nachricht aus dem State
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location.state, navigate, location.pathname]);

	// Effekt für die Weiterleitung, wenn der Benutzer bereits authentifiziert ist (z.B. nach Seiten-Reload)
	useEffect(() => {
		console.log(
			"[Login Page] useEffect for redirect CHECKING. Auth user:",
			auth.user?.email,
			"isLoading:",
			auth.isLoading
		);
		if (auth.user && !auth.isLoading && auth.user.role) {
			const path = getRedirectPath(auth.user.role);
			console.log(
				"[Login Page] USER AUTHENTICATED (isLoading is false). Redirecting to:",
				path
			);
			navigate(path, { replace: true });
		} else if (!auth.user && !auth.isLoading) {
			console.log("[Login Page] User NOT authenticated (isLoading is false).");
		} else if (auth.isLoading) {
			console.log("[Login Page] Auth is LOADING...");
		}
	}, [auth.user, auth.isLoading, navigate]);

	const getRedirectPath = (role: string) => {
		const from = (location.state as any)?.from?.pathname;
		if (from) return from;
		return role === "admin" ? "/admin" : "/doctor";
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		try {
			console.log("[Login Page] Calling auth.login...");
			await auth.login(email.trim(), password);
			console.log(
				"[Login Page] auth.login call FINISHED (no error thrown here)."
			);
		} catch (err: any) {
			console.error("[Login Page] Error caught from auth.login:", err);
			if (err.message === "Invalid login credentials") {
				setError(
					"E-Mail oder Passwort ist falsch. Bitte überprüfen Sie Ihre Eingaben."
				);
			} else if (err.message && err.message.includes("Email not confirmed")) {
				setError(
					"Ihre E-Mail-Adresse wurde noch nicht bestätigt. Bitte überprüfen Sie Ihr Postfach."
				);
			} else {
				setError(
					"Ein Fehler ist aufgetreten: " + (err.message || "Unbekannter Fehler")
				);
			}
		}
	};

	const handlePasswordReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
			});

			if (error) throw error;

			setSuccess(
				"Eine E-Mail zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet."
			);
			setEmail("");
		} catch (err: any) {
			setError("Fehler beim Senden der Passwort-Reset-E-Mail: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMagicLink = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);

		try {
			const { error } = await supabase.auth.signInWithOtp({
				email: email,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) throw error;

			setSuccess(
				"Ein Magic Link wurde an Ihre E-Mail-Adresse gesendet. Klicken Sie auf den Link, um sich anzumelden."
			);
			setEmail("");
		} catch (err: any) {
			setError("Fehler beim Senden des Magic Links: " + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setEmail("");
		setPassword("");
		setError("");
		setSuccess("");
	};

	const switchMode = (newMode: LoginMode) => {
		setMode(newMode);
		resetForm();
	};

	return (
		<div className="card animate-fade-in">
			{/* Header mit Zurück-Button */}
			{mode !== "login" && (
				<div className="flex items-center mb-4">
					<button
						onClick={() => switchMode("login")}
						className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Zurück zur Anmeldung
					</button>
				</div>
			)}

			{/* Titel */}
			<h2 className="text-2xl font-bold text-center mb-6">
				{mode === "login" && "Anmelden"}
				{mode === "reset-password" && "Passwort zurücksetzen"}
				{mode === "magic-link" && "Magic Link anfordern"}
			</h2>

			{/* Fehlermeldungen */}
			{error && (
				<div className="bg-error/10 border border-error/30 text-error rounded-md p-3 mb-4 text-sm">
					{error}
				</div>
			)}

			{/* Erfolgsmeldungen */}
			{success && (
				<div className="bg-success/10 border border-success/30 text-success rounded-md p-3 mb-4 text-sm">
					{success}
				</div>
			)}

			{/* Login Form */}
			{mode === "login" && (
				<form onSubmit={handleLogin} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-foreground mb-1"
						>
							E-Mail
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="input"
							required
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-foreground mb-1"
						>
							Passwort
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="input"
							required
						/>
					</div>

					<button
						type="submit"
						className="btn btn-primary w-full"
						disabled={isLoading}
					>
						{isLoading ? (
							<span className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Anmelden...
							</span>
						) : (
							"Anmelden"
						)}
					</button>

					{/* Alternative Anmelde-Optionen */}
					<div className="mt-6 space-y-3">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-background text-muted-foreground">
									Oder
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-3">
							<button
								type="button"
								onClick={() => switchMode("reset-password")}
								className="flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors"
							>
								<Key className="h-4 w-4 mr-2" />
								Passwort zurücksetzen
							</button>

							<button
								type="button"
								onClick={() => switchMode("magic-link")}
								className="flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted transition-colors"
							>
								<Mail className="h-4 w-4 mr-2" />
								Magic Link anfordern
							</button>
						</div>
					</div>
				</form>
			)}

			{/* Passwort Reset Form */}
			{mode === "reset-password" && (
				<form onSubmit={handlePasswordReset} className="space-y-4">
					<div className="text-sm text-muted-foreground mb-4">
						Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link
						zum Zurücksetzen Ihres Passworts.
					</div>

					<div>
						<label
							htmlFor="reset-email"
							className="block text-sm font-medium text-foreground mb-1"
						>
							E-Mail
						</label>
						<input
							id="reset-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="input"
							placeholder="ihre.email@beispiel.de"
							required
						/>
					</div>

					<button
						type="submit"
						className="btn btn-primary w-full"
						disabled={isLoading || !email}
					>
						{isLoading ? (
							<span className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Senden...
							</span>
						) : (
							<>
								<Mail className="h-4 w-4 mr-2" />
								Passwort-Reset senden
							</>
						)}
					</button>
				</form>
			)}

			{/* Magic Link Form */}
			{mode === "magic-link" && (
				<form onSubmit={handleMagicLink} className="space-y-4">
					<div className="text-sm text-muted-foreground mb-4">
						Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Magic
						Link für die passwortlose Anmeldung.
					</div>

					<div>
						<label
							htmlFor="magic-email"
							className="block text-sm font-medium text-foreground mb-1"
						>
							E-Mail
						</label>
						<input
							id="magic-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="input"
							placeholder="ihre.email@beispiel.de"
							required
						/>
					</div>

					<button
						type="submit"
						className="btn btn-primary w-full"
						disabled={isLoading || !email}
					>
						{isLoading ? (
							<span className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Senden...
							</span>
						) : (
							<>
								<Mail className="h-4 w-4 mr-2" />
								Magic Link senden
							</>
						)}
					</button>
				</form>
			)}

			{/* Impressum und Datenschutz Links */}
			<div className="mt-6 pt-4 border-t border-border">
				<div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
					<Link
						to="/impressum"
						className="hover:text-primary transition-colors"
					>
						Impressum
					</Link>
					<span>|</span>
					<Link
						to="/datenschutz"
						className="hover:text-primary transition-colors"
					>
						Datenschutz
					</Link>
				</div>
			</div>
		</div>
	);
}

export default Login;
