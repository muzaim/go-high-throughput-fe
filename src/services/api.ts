import { APIErrorResponse } from "../types/inventory";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export class ApiError extends Error {
	code: string;
	statusCode: number;
	details?: Record<string, unknown> | null;

	constructor(
		message: string,
		code: string,
		statusCode: number,
		details?: Record<string, unknown> | null
	) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
	}
}

export async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `${BASE_URL}${endpoint}`;

	const defaultHeaders: HeadersInit = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};

	const config: RequestInit = {
		...options,
		headers: {
			...defaultHeaders,
			...options.headers,
		},
	};

	try {
		const response = await fetch(url, config);

		if (!response.ok) {
			let errorData: APIErrorResponse | null = null;
			try {
				errorData = await response.json();
			} catch {
				// Fallback if response body is not valid JSON
			}

			const errorMessage =
				errorData?.message || `HTTP error! status: ${response.status}`;
			const errorCode = errorData?.code || "UNKNOWN_ERROR";

			console.error(
				`[API Error] ${config.method || "GET"} ${url} (${
					response.status
				}):`,
				errorData || errorMessage
			);

			throw new ApiError(
				errorMessage,
				errorCode,
				response.status,
				errorData?.details
			);
		}

		return (await response.json()) as T;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		console.error(
			`[Network Error] ${config.method || "GET"} ${url}:`,
			error
		);
		throw new ApiError(
			"Unable to connect to backend server. Please ensure the server is running.",
			"NETWORK_ERROR",
			0
		);
	}
}
