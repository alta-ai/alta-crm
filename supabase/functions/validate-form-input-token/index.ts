import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface DecodedToken {
	appointment_id: string;
	examination_id: string;
}

interface ValidateTokenRequest {
	token: string;
}

interface ValidateTokenResponse {
	success: boolean;
	data?: DecodedToken;
	error?: string;
}

// Helper function to verify HMAC signature
async function verifyTokenSignature(
	payloadBase64: string,
	signature: string,
	secretKey: string
): Promise<boolean> {
	try {
		// Import the secret key
		const key = await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(secretKey),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["verify"]
		);

		// Convert signature from base64 to ArrayBuffer
		const signatureBuffer = Uint8Array.from(atob(signature), (c) =>
			c.charCodeAt(0)
		);

		// Verify the signature
		const isValid = await crypto.subtle.verify(
			"HMAC",
			key,
			signatureBuffer,
			new TextEncoder().encode(payloadBase64)
		);

		return isValid;
	} catch (error) {
		console.error("Token verification error:", error);
		return false;
	}
}

// Helper function to verify and decode token
async function verifyAndDecodeToken(
	token: string,
	secretKey: string
): Promise<DecodedToken> {
	try {
		// Split token into payload and signature
		const [payloadBase64, signatureBase64] = token.split(".");

		if (!payloadBase64 || !signatureBase64) {
			throw new Error("Invalid token format");
		}

		// Verify the signature server-side
		const isValidSignature = await verifyTokenSignature(
			payloadBase64,
			signatureBase64,
			secretKey
		);

		if (!isValidSignature) {
			throw new Error("Invalid token signature");
		}

		// Decode the payload
		const payloadString = atob(payloadBase64);
		const payload = JSON.parse(payloadString);

		// Validate payload structure
		if (!payload.appointment_id || !payload.examination_id) {
			throw new Error("Invalid token payload - missing required fields");
		}

		// Check expiration if present
		if (payload.exp && Date.now() / 1000 > payload.exp) {
			throw new Error("Token has expired");
		}

		return {
			appointment_id: payload.appointment_id,
			examination_id: payload.examination_id,
		};
	} catch (err) {
		throw new Error(
			err instanceof Error ? err.message : "Token verification failed"
		);
	}
}

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

	try {
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

		// Get the secret key from environment variables
		const secretKey = Deno.env.get("SECRET_KEY");
		if (!secretKey) {
			console.error("SECRET_KEY environment variable not configured");
			return new Response(
				JSON.stringify({ success: false, error: "Server configuration error" }),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				}
			);
		}

		// Parse request body with error handling
		let body: ValidateTokenRequest;
		try {
			body = await req.json();
		} catch (parseError) {
			return new Response(
				JSON.stringify({ success: false, error: "Invalid JSON in request body" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				}
			);
		}

		if (!body.token) {
			return new Response(
				JSON.stringify({ success: false, error: "No token provided" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				}
			);
		}

		// Verify and decode the token
		const decodedData = await verifyAndDecodeToken(body.token, secretKey);

		const response: ValidateTokenResponse = {
			success: true,
			data: decodedData,
		};

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		console.error("Token validation error:", error);

		const response: ValidateTokenResponse = {
			success: false,
			error: error instanceof Error ? error.message : "Token validation failed",
		};

		return new Response(JSON.stringify(response), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
});
