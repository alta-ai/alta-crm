import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

interface TokenRequest {
	appointment_id: string;
	examination_id: string;
	expiration_hours: number;
}

interface TokenResponse {
	success: boolean;
	token?: string;
	error?: string;
}

// Generate HMAC signature using Web Crypto API
const generateHmacSignature = async (
	data: string,
	secretKey: string
): Promise<string> => {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secretKey),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);

	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(data)
	);

	// Convert ArrayBuffer to base64
	const signatureArray = new Uint8Array(signature);
	return btoa(String.fromCharCode(...signatureArray));
};

serve(async (req) => {
	// Handle CORS
	if (req.method === "OPTIONS") {
		return new Response("ok", {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST",
				"Access-Control-Allow-Headers":
					"authorization, x-client-info, apikey, content-type",
			},
		});
	}

	// Only allow POST requests
	if (req.method !== "POST") {
		return new Response(
			JSON.stringify({ success: false, error: "Method not allowed" }),
			{
				status: 405,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			}
		);
	}

	try {
		const secretKey = Deno.env.get("SECRET_KEY");

		if (!secretKey) {
			return new Response(
				JSON.stringify({ success: false, error: "Secret key not configured" }),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				}
			);
		}

		const body: TokenRequest = await req.json();

		// Validate input
		if (!body.appointment_id?.trim() || !body.examination_id?.trim()) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Both Appointment ID and Examination ID are required",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				}
			);
		}

		if (
			!body.expiration_hours ||
			body.expiration_hours < 1 ||
			body.expiration_hours > 168
		) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Expiration hours must be between 1 and 168",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				}
			);
		}

		// Create payload
		const payload = {
			appointment_id: body.appointment_id.trim(),
			examination_id: body.examination_id.trim(),
			exp: Math.floor(Date.now() / 1000) + body.expiration_hours * 3600,
			iat: Math.floor(Date.now() / 1000),
		};

		// Encode payload as base64
		const payloadBase64 = btoa(JSON.stringify(payload));

		// Generate HMAC signature
		const signature = await generateHmacSignature(payloadBase64, secretKey);

		// Combine payload and signature
		const token = `${payloadBase64}.${signature}`;

		const response: TokenResponse = {
			success: true,
			token,
		};

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		console.error("Token generation error:", error);

		return new Response(
			JSON.stringify({
				success: false,
				error: "Failed to generate token",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			}
		);
	}
});
