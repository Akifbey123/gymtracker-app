const getBaseUrl = () => {
    // If explicitly set in env, use it
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // Otherwise, construct from current hostname but port 5001
    // This assumes the API runs on the same host but port 5001
    return `${window.location.protocol}//${window.location.hostname}:5001`;
};

const BASE_URL = getBaseUrl();

type RequestConfig = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: HeadersInit;
    body?: any;
};

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const { method = 'GET', headers = {}, body } = config;

        const isFormData = body instanceof FormData;

        const finalHeaders = new Headers(headers);
        if (!isFormData && !finalHeaders.has('Content-Type')) {
            finalHeaders.set('Content-Type', 'application/json');
        }

        const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body: isFormData ? body : JSON.stringify(body),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                if (errorData.message) throw new Error(errorData.message);
                if (errorData.error) throw new Error(errorData.error);
            } catch (e) {
                if (e instanceof Error && e.message !== `API Error: ${response.status} ${response.statusText}` && !e.message.startsWith("Unexpected token")) {
                    throw e; // Rethrow if it's the message we just parsed
                }
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    get<T>(endpoint: string, headers?: HeadersInit) {
        return this.request<T>(endpoint, { method: 'GET', headers });
    }

    post<T>(endpoint: string, body: any, headers?: HeadersInit) {
        return this.request<T>(endpoint, { method: 'POST', body, headers });
    }

    put<T>(endpoint: string, body: any, headers?: HeadersInit) {
        return this.request<T>(endpoint, { method: 'PUT', body, headers });
    }

    delete<T>(endpoint: string, body?: any, headers?: HeadersInit) {
        return this.request<T>(endpoint, { method: 'DELETE', body, headers });
    }
}

export const apiClient = new ApiClient(BASE_URL);
