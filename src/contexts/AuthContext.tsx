import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { supabase } from "../lib/supabase";
import { User, UserProfile } from "@components/types";

interface AuthContextType {
	user: User | null;
	userData: UserProfile | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [userData, setUserData] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	console.log(
		"[AuthContext] AuthProvider MOUNTED/UPDATED. Current user:",
		user?.email,
		"isLoading:",
		isLoading
	);

	const loadUserData = async (authUser: any) => {
		try {
			console.log("📊 Lade User-Daten für:", authUser.user_metadata);

			// Verwende erstmal nur die Auth-Metadaten ohne DB-Abfrage
			const displayName = userData
				? `${userData.title ? userData.title + " " : ""}${
						userData.first_name
				  } ${userData.last_name}`.trim()
				: authUser.user_metadata.display_name ||
				  authUser.user_metadata.name ||
				  `${authUser.user_metadata.first_name || ""} ${
						authUser.user_metadata.last_name || ""
				  }`.trim() ||
				  authUser.email;

			const role = authUser.user_metadata.role || "admin";

			console.log("✅ User-Daten gesetzt:", {
				displayName,
				role,
				hasProfile: !!userData,
			});

			setUser({
				id: authUser.id,
				email: authUser.email!,
				name: displayName,
				role: role,
			});
		} catch (error) {
			console.error("❌ Fehler beim Laden der Benutzerdaten:", error);

			// Fallback: Minimale User-Daten setzen
			setUserData(null);
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
						setUserData(null);
					}
				} else {
					// No session, make sure user is null
					setUser(null);
					setUserData(null);
				}
			} catch (error) {
				console.error(
					"[AuthContext] Unexpected error during auth initialization:",
					error
				);
				setUser(null);
				setUserData(null);
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

			if (session) {
				const jwt = jwtDecode(session.access_token);
				setUserData(jwt.user_profile as UserProfile);
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
			setUserData(null);
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
				userData,
				isLoading,
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
