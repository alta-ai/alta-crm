import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface RequestBody {
	token: string;
	table_name: string;
}

interface DecodedToken {
	appointment_id: string;
	examination_id: string;
}

interface ValidateTokenResponse {
	success: boolean;
	data?: DecodedToken;
	error?: string;
}

interface DataResponse {
	success: boolean;
	data?: any;
	error?: string;
}

// Helper function to validate table name for security
function isValidTableName(tableName: string): boolean {
	// Only allow alphanumeric characters and underscores
	const validTableNameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
	const allowedTables = ["appointments", "examinations", "patients"]; // Add your allowed tables here
	return (
		validTableNameRegex.test(tableName) && allowedTables.includes(tableName)
	);
}

// Helper function to call the validate-form-input-token function
async function validateToken(token: string): Promise<DecodedToken> {
	const supabaseUrl = Deno.env.get("SUPABASE_URL");
	const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

	if (!supabaseUrl || !supabaseServiceKey) {
		throw new Error("Missing Supabase environment variables");
	}

	const supabase = createClient(supabaseUrl, supabaseServiceKey);

	try {
		const { data, error } = await supabase.functions.invoke(
			"validate-form-input-token",
			{
				body: { token },
			}
		);

		if (error) {
			throw new Error(`Token validation failed: ${error.message}`);
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

// Helper function to retrieve data from the specified table
async function getDataFromTable(
	tableName: string,
	appointmentId: string
): Promise<any> {
	const supabaseUrl = Deno.env.get("SUPABASE_URL");
	const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

	if (!supabaseUrl || !supabaseServiceKey) {
		throw new Error("Missing Supabase environment variables");
	}

	const supabase = createClient(supabaseUrl, supabaseServiceKey);

	try {
		const { data, error } = await supabase
			.from(tableName)
			.select("*")
			.eq("id", appointmentId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("No data found for the given appointment_id");
			}
			throw new Error(`Database query failed: ${error.message}`);
		}

		return data;
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Database query failed"
		);
	}
}

serve(async (req) => {
	// Set CORS headers
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
	};

	// Handle CORS preflight requests
	if (req.method === "OPTIONS") {
		return new Response(null, { status: 200, headers: corsHeaders });
	}

	// Only allow POST requests
	if (req.method !== "POST") {
		return new Response(
			JSON.stringify({
				success: false,
				error: "Method not allowed",
			}),
			{
				status: 405,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	}

	try {
		// Parse request body
		const body: RequestBody = await req.json();

		// Validate required fields
		if (!body.token || !body.table_name) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Missing required fields: token and table_name",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// Validate table name for security
		if (!isValidTableName(body.table_name)) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Invalid table name",
				}),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				}
			);
		}

		// Validate the token first
		const decodedToken = await validateToken(body.token);

		// Retrieve data from the specified table
		const data = await getDataFromTable(
			body.table_name,
			decodedToken.appointment_id
		);

		return new Response(
			JSON.stringify({
				success: true,
				data: data,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error in anon-read-data-from-table:", error);

		return new Response(
			JSON.stringify({
				success: true,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			}
		);
	}
});
