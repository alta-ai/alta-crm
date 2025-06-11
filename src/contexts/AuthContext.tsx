import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { supabase } from "../lib/supabase";
import { UserProfile } from "@components/types";

interface AuthContextType {
	userData: UserProfile | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [userData, setUserData] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const loadUserData = async (authUser: any) => {
		try {
			// Decode JWT to get user_profile from claims
			const jwt = jwtDecode(authUser.access_token || "");
			const userProfile = (jwt as any).user_profile;

			if (userProfile) {
				// Use the enhanced user_profile from JWT claims
				setUserData({
					...userProfile,
					// Ensure we have fallback values
					email: userProfile.email || authUser.email,
					role: userProfile.role || "user",
					default_route: userProfile.default_route || "/home",
				} as UserProfile);
			} else {
				// Fallback: create basic user data from auth user
				setUserData({
					user_id: authUser.id,
					email: authUser.email,
					first_name: authUser.user_metadata?.first_name || "",
					last_name: authUser.user_metadata?.last_name || "",
					role: "user",
					default_route: "/home",
				} as unknown as UserProfile);
			}
		} catch (error) {
			console.error("❌ Error loading user data:", error);
			// Create minimal user data on error
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error("[AuthContext] Error getting session:", error);
					setUserData(null);
					return;
				}

				if (session?.user) {
					try {
						await loadUserData(session);
					} catch (error) {
						console.error(
							"[AuthContext] Error loading user data on session check:",
							error
						);
						setUserData(null);
					}
				} else {
					setUserData(null);
				}
			} catch (error) {
				console.error(
					"[AuthContext] Unexpected error during auth initialization:",
					error
				);
				setUserData(null);
			} finally {
				setIsLoading(false);
			}
		};

		initializeAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (session?.user) {
				try {
					await loadUserData(session);
				} catch (error) {
					console.error("[AuthContext] Error in auth state change:", error);
					setUserData(null);
				}
			} else {
				setUserData(null);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const login = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error(
					"[AuthContext] login: Error from Supabase:",
					error.message
				);
				throw error;
			}

			if (data?.session?.user) {
				// User data will be loaded automatically by the auth state change listener
			} else if (data && !data.user && !error) {
				console.warn(
					"[AuthContext] login: Supabase signInWithPassword returned no user and no error."
				);
				throw new Error("Supabase login returned no user and no error.");
			} else if (!data && !error) {
				console.warn(
					"[AuthContext] login: Supabase signInWithPassword returned no data and no error."
				);
				throw new Error("Supabase login returned no data and no error.");
			}
		} catch (e: any) {
			console.error(
				"[AuthContext] login: CATCH BLOCK TRIGGERED. Error message:",
				e.message
			);
			console.error("[AuthContext] login: Full error object:", e);
			throw e;
		} finally {
			setIsLoading(false);
		}
	};

	const changePassword = async (newPassword: string) => {
		try {
			const { error: authError } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (authError) {
				console.error("❌ Error changing password in Auth:", authError);
				throw authError;
			}
		} catch (error) {
			console.error("❌ Password change failed:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await supabase.auth.signOut();
			setUserData(null);
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
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
