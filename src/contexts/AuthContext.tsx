import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { User } from "@components/types";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	needsPasswordChange: boolean;
	doctorSpecialtyId: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
	const [doctorSpecialtyId, setDoctorSpecialtyId] = useState<string | null>(
		null
	);

	console.log(
		"[AuthContext] AuthProvider MOUNTED/UPDATED. Current user:",
		user?.email,
		"isLoading:",
		isLoading
	);

	const loadUserData = async (authUser: any) => {
		try {
			console.log("📊 Lade User-Daten für:", authUser.email);

			// Verwende erstmal nur die Auth-Metadaten ohne DB-Abfrage
			const displayName =
				authUser.user_metadata.display_name ||
				authUser.user_metadata.name ||
				`${authUser.user_metadata.first_name || ""} ${
					authUser.user_metadata.last_name || ""
				}`.trim() ||
				authUser.email;

			const role = authUser.user_metadata.role || "admin";

			console.log("✅ User-Daten gesetzt:", { displayName, role });

			setUser({
				id: authUser.id,
				email: authUser.email!,
				name: displayName,
				role: role,
			});
		} catch (error) {
			console.error("❌ Fehler beim Laden der Benutzerdaten:", error);

			// Fallback: Minimale User-Daten setzen
			setUser({
				id: authUser.id,
				email: authUser.email!,
				name: authUser.email,
				role: "admin",
			});
		}
	};

	useEffect(() => {
		console.log(
			"[AuthContext] useEffect for session and auth listener RUNNING"
		);

		const initializeAuth = async () => {
			try {
				// Check current auth session
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error("[AuthContext] Error getting session:", error);
					setUser(null);
					return;
				}

				console.log("[AuthContext] getSession initial result:", session);

				if (session?.user) {
					try {
						await loadUserData(session.user);
						console.log(
							"[AuthContext] User set from initial getSession:",
							session.user.email
						);
					} catch (error) {
						console.error(
							"[AuthContext] Error loading user data on session check:",
							error
						);
						// Set user to null if we can't load user data
						setUser(null);
					}
				} else {
					// No session, make sure user is null
					setUser(null);
				}
			} catch (error) {
				console.error(
					"[AuthContext] Unexpected error during auth initialization:",
					error
				);
				setUser(null);
			} finally {
				setIsLoading(false);
				console.log("[AuthContext] Initial isLoading set to false");
			}
		};

		initializeAuth();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			console.log(
				"[AuthContext] onAuthStateChange EVENT:",
				_event,
				"SESSION:",
				session
			);

			try {
				if (session?.user) {
					console.log(
						"[AuthContext] User BEFORE loadUserData in onAuthStateChange:",
						session.user.email
					);
					await loadUserData(session.user);
					console.log(
						"[AuthContext] User AFTER loadUserData in onAuthStateChange:",
						session.user.email
					);
				} else {
					setUser(null);
					console.log("[AuthContext] User set to NULL in onAuthStateChange");
					setNeedsPasswordChange(false);
					setDoctorSpecialtyId(null);
				}
			} catch (error) {
				console.error("[AuthContext] Error in onAuthStateChange:", error);
				// If there's an error loading user data, still clear the user
				setUser(null);
				setNeedsPasswordChange(false);
				setDoctorSpecialtyId(null);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const login = async (email: string, password: string) => {
		console.log("[AuthContext] login: Setting isLoading to true.");
		setIsLoading(true);
		try {
			console.log(
				`[AuthContext] login: Calling supabase.auth.signInWithPassword for ${email}.`
			);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			console.log(
				"[AuthContext] login: supabase.auth.signInWithPassword call completed."
			);
			console.log("[AuthContext] login: Response Data:", data);
			console.log("[AuthContext] login: Response Error:", error);

			if (error) {
				console.error(
					"[AuthContext] login: Error from Supabase:",
					error.message
				);
				throw error;
			}

			if (data && data.user) {
				console.log(
					"[AuthContext] login: Supabase signInWithPassword successful for user:",
					data.user.email
				);
				// Der onAuthStateChange Handler sollte den Benutzer setzen und weitere Logik ausführen.
				// setIsLoading(false) wird im finally-Block gesetzt.
			} else if (data && !data.user && !error) {
				console.warn(
					"[AuthContext] login: Supabase signInWithPassword returned no user and no error. This is unexpected."
				);
				throw new Error("Supabase login returned no user and no error.");
			} else if (!data && !error) {
				// Dieser Fall sollte eigentlich nicht eintreten, wenn die Funktion normal zurückkehrt
				console.warn(
					"[AuthContext] login: Supabase signInWithPassword returned no data and no error."
				);
				throw new Error("Supabase login returned no data and no error.");
			}
			// Wenn wir hier sind und kein Fehler geworfen wurde, war der Aufruf an sich erfolgreich
			// oder zumindest nicht fehlerhaft im Sinne einer Exception.
			console.log(
				"[AuthContext] login: try block finished without throwing an error itself."
			);
		} catch (e: any) {
			console.error(
				"[AuthContext] login: CATCH BLOCK TRIGGERED. Error message:",
				e.message
			);
			console.error("[AuthContext] login: Full error object:", e);
			// setIsLoading(false); // Wird im finally behandelt
			throw e; // Fehler weiterwerfen, damit Login.tsx ihn behandeln kann
		} finally {
			console.log(
				"[AuthContext] login: FINALLY BLOCK. Setting isLoading to false."
			);
			setIsLoading(false);
		}
	};

	const changePassword = async (newPassword: string) => {
		try {
			console.log("🔐 Starte Passwort-Änderung...");

			// 1. Passwort in Supabase Auth ändern
			const { error: authError } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (authError) {
				console.error(
					"❌ Fehler beim Ändern des Passworts in Auth:",
					authError
				);
				throw authError;
			}

			console.log("✅ Passwort in Auth erfolgreich geändert");

			// 2. needs_password_change Flag aktualisieren
			if (user) {
				console.log("🔄 Aktualisiere needs_password_change Flag...");

				// Versuche zuerst die RPC-Funktion
				try {
					const { data: rpcResult, error: rpcError } = await supabase.rpc(
						"update_doctor_password_flag"
					);

					if (rpcError) {
						console.error("❌ RPC-Fehler:", rpcError);
						throw rpcError;
					}

					console.log("📊 RPC-Ergebnis:", rpcResult);

					if (rpcResult && rpcResult.success) {
						console.log("✅ RPC-Update erfolgreich");
					} else {
						console.warn(
							"⚠️ RPC-Update nicht erfolgreich, versuche direktes Update..."
						);
						throw new Error("RPC failed");
					}
				} catch (rpcError) {
					console.log("🔄 RPC fehlgeschlagen, versuche direktes Update...");

					// Fallback: Direktes Update
					const { error: directUpdateError } = await supabase
						.from("doctors")
						.update({
							needs_password_change: false,
							updated_at: new Date().toISOString(),
						})
						.eq("id", user.id);

					if (directUpdateError) {
						console.error(
							"❌ Direktes Update fehlgeschlagen:",
							directUpdateError
						);
						// Trotzdem lokalen State setzen
					} else {
						console.log("✅ Direktes Update erfolgreich");
					}
				}

				// Lokalen State immer aktualisieren
				setNeedsPasswordChange(false);
				console.log("✅ Lokaler State aktualisiert");
			}

			console.log("🎉 Passwort-Änderung abgeschlossen");
		} catch (error) {
			console.error("❌ Passwort-Änderung fehlgeschlagen:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await supabase.auth.signOut();
			setUser(null);
			setNeedsPasswordChange(false);
			setDoctorSpecialtyId(null);
			console.log("[AuthContext] Logout: User set to null and flags reset");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	console.log(
		"[AuthContext] AuthProvider rendering. User:",
		user?.email,
		"isLoading:",
		isLoading
	);

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				needsPasswordChange,
				doctorSpecialtyId,
				login,
				logout,
				changePassword,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
