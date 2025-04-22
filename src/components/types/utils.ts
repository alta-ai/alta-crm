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
