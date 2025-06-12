import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for token validation
export interface DecodedToken {
	appointment_id: string;
	examination_id: string;
}

export interface ValidateTokenResponse {
	success: boolean;
	data?: DecodedToken;
	error?: string;
}

// Utility function to validate form input token via Edge Function
export async function validateFormInputToken(
	token: string
): Promise<DecodedToken> {
	try {
		const { data, error } = await supabase.functions.invoke(
			"validate-form-input-token",
			{
				body: { token },
			}
		);

		if (error) {
			throw new Error(`Edge Function error: ${error.message}`);
		}

		const response = data as ValidateTokenResponse;

		if (!response.success) {
			throw new Error(response.error || "Token validation failed");
		}

		if (!response.data) {
			throw new Error("Invalid response from token validation");
		}

		return response.data;
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Token validation failed"
		);
	}
}

// Types for token generation
export interface GenerateTokenRequest {
	appointment_id: string;
	examination_id: string;
	expiration_hours: number;
}

export interface GenerateTokenResponse {
	success: boolean;
	token?: string;
	error?: string;
}

// Utility function to generate form input token via Edge Function
export async function generateFormInputToken(
	requestData: GenerateTokenRequest
): Promise<string> {
	try {
		const { data, error } = await supabase.functions.invoke(
			"encode-form-input-token",
			{
				body: requestData,
			}
		);

		if (error) {
			throw new Error(`Edge Function error: ${error.message}`);
		}

		const response = data as GenerateTokenResponse;

		if (!response.success) {
			throw new Error(response.error || "Token generation failed");
		}

		if (!response.token) {
			throw new Error("No token received from server");
		}

		return response.token;
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Token generation failed"
		);
	}
}
