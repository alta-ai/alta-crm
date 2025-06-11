export interface UserProfile {
	id: string;
	user_id: string;
	title?: string;
	first_name: string;
	last_name: string;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: "admin" | "doctor";
}
