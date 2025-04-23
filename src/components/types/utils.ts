import { z } from "zod";

// Fix the enumToZod function for better type safety
export function enumToZod<T extends Record<string, string>>(enumObj: T) {
	// This creates a tuple type with all the string values from the enum
	type ValueTuple = [T[keyof T], ...T[keyof T][]];

	// Extract values in a type-safe way
	const values = Object.values(enumObj).filter(
		(v) => typeof v === "string"
	) as ValueTuple;

	return z.enum(values);
}

// Add a helper to unwrap wrapper types and check for ZodBoolean
function isBooleanSchema(schema: z.ZodTypeAny): boolean {
	let unwrapped = schema;
	// Unwrap common wrappers like ZodOptional and ZodNullable
	while (
		unwrapped instanceof z.ZodOptional ||
		unwrapped instanceof z.ZodNullable
	) {
		unwrapped = unwrapped._def.innerType;
	}
	return unwrapped instanceof z.ZodBoolean;
}

/**
 * Converts boolean values in a JavaScript object to strings based on the Zod schema
 *
 * @param schema A Zod object schema
 * @param data A JavaScript object to transform
 * @returns A new object with boolean values converted to strings where specified in the schema
 */
export function boolToString<T extends z.ZodObject<any>>(
	schema: T,
	data: Record<string, any>
): Record<string, any> {
	if (!data || typeof data !== "object" || data === null) {
		return data; // Return as is if not an object
	}

	const result: Record<string, any> = { ...data };
	const schemaShape = schema.shape;

	for (const [key, value] of Object.entries(data)) {
		const fieldSchema = schemaShape[key];

		if (!fieldSchema) continue; // Skip if field doesn't exist in schema

		// Use the generic solution to identify boolean schemas
		if (isBooleanSchema(fieldSchema) && typeof value === "boolean") {
			// Convert boolean to string
			result[key] = String(value); // Will be "true" or "false"
		} else if (
			fieldSchema instanceof z.ZodObject &&
			typeof value === "object" &&
			value !== null
		) {
			// Recursively handle nested objects
			result[key] = boolToString(fieldSchema, value);
		} else if (fieldSchema instanceof z.ZodArray && Array.isArray(value)) {
			// Handle arrays by processing each element if the array contains objects
			const arrayElementSchema = fieldSchema.element;
			if (arrayElementSchema instanceof z.ZodObject) {
				result[key] = value.map((item) =>
					typeof item === "object" && item !== null
						? boolToString(arrayElementSchema, item)
						: item
				);
			}
		}
	}

	return result;
}

/**
 * Converts string values in a JavaScript object to booleans based on the Zod schema
 *
 * @param schema A Zod object schema
 * @param data A JavaScript object to transform
 * @returns A new object with string values converted to booleans where specified in the schema
 */
export function stringToBool<T extends z.ZodObject<any>>(
	schema: T,
	data: Record<string, any>
): Record<string, any> {
	if (!data || typeof data !== "object" || data === null) {
		return data; // Return as is if not an object
	}

	const result: Record<string, any> = { ...data };
	const schemaShape = schema.shape;

	for (const [key, value] of Object.entries(data)) {
		const fieldSchema = schemaShape[key];

		if (!fieldSchema) continue; // Skip if field doesn't exist in schema

		// Use the generic solution to identify boolean schemas
		if (isBooleanSchema(fieldSchema) && typeof value === "string") {
			// Convert string to boolean
			result[key] = value.toLowerCase() === "true";
		} else if (
			fieldSchema instanceof z.ZodObject &&
			typeof value === "object" &&
			value !== null
		) {
			// Recursively handle nested objects
			result[key] = stringToBool(fieldSchema, value);
		} else if (fieldSchema instanceof z.ZodArray && Array.isArray(value)) {
			// Handle arrays by processing each element if the array contains objects
			const arrayElementSchema = fieldSchema.element;
			if (arrayElementSchema instanceof z.ZodObject) {
				result[key] = value.map((item) =>
					typeof item === "object" && item !== null
						? stringToBool(arrayElementSchema, item)
						: item
				);
			}
		}
	}

	return result;
}
