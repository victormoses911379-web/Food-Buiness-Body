/**
 * Client-Side API Utility
 * Safely parses responses, handles network issues, and guarantees
 * that HTML responses (e.g., <!DOCTYPE html>) NEVER cause "Unexpected token '<'" errors.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status: number;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';

    // If server responded with JSON
    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        if (!res.ok) {
          return {
            success: false,
            message: data?.message || data?.error || `Request failed with status ${res.status}`,
            error: data?.error || data?.message || `Request failed with status ${res.status}`,
            data,
            status: res.status,
          };
        }
        return {
          success: data?.success !== undefined ? Boolean(data.success) : true,
          message: data?.message,
          data,
          status: res.status,
        };
      } catch (jsonErr) {
        console.warn('[safeFetchJson] Failed parsing expected JSON body:', jsonErr);
        return {
          success: false,
          message: 'Received an invalid response from the server. Please try again.',
          error: 'Invalid JSON payload from server.',
          status: res.status,
        };
      }
    }

    // If server responded with non-JSON (e.g. HTML error page or fallback)
    const rawText = await res.text();
    console.warn(`[safeFetchJson] Expected JSON, received ${contentType || 'text/html'} (Status ${res.status}):`, rawText.slice(0, 300));

    let userFriendlyMessage = 'The server returned an unexpected response format. Please try again.';
    if (contentType.includes('text/html') || rawText.includes('<!DOCTYPE') || rawText.includes('<!doctype')) {
      userFriendlyMessage = 'Backend API is currently unreachable or not answering on this host. If you are using Vercel, please check that your Vercel Environment Variables (such as FLW_SECRET_KEY) and API functions are deployed.';
    } else if (res.status === 404) {
      userFriendlyMessage = 'Requested service endpoint was not found on the server.';
    } else if (res.status === 413) {
      userFriendlyMessage = 'The uploaded file or receipt is too large. Please upload an image under 5MB.';
    } else if (res.status >= 500) {
      userFriendlyMessage = 'The server encountered an error processing your request. Please try again shortly.';
    } else if (res.status === 401 || res.status === 403) {
      userFriendlyMessage = 'Access denied. You do not have permission for this action.';
    }

    return {
      success: false,
      message: userFriendlyMessage,
      error: userFriendlyMessage,
      status: res.status,
    };
  } catch (netErr: any) {
    console.error('[safeFetchJson] Network or connection error:', netErr);
    return {
      success: false,
      message: 'Network connection error. Please check your internet connection and try again.',
      error: netErr?.message || 'Network connection failed.',
      status: 0,
    };
  }
}
