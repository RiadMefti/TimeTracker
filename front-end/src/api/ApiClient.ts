import type ApiResponse from "../types/ApiResponse";

export class ApiClient {
  private _baseUrl: string;
  private _authToken: string | null = null;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  public get authToken(): string | null {
    return this._authToken;
  }

  public set authToken(token: string) {
    this._authToken = token;
  }

  private async _fetchData<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    if (!this.authToken) {
      throw new Error("No auth token available");
    }
    const headers: Headers = new Headers({
      Authorization: `Bearer ${this.authToken}`,
      "Content-Type": "application/json",
    });

    //extra headers from the options
    if (options.headers && options.headers instanceof Headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value);
      }
    }

    //make the actual api call
    try {
      const response = await fetch(`${this._baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      return await this._handleResponse(response);
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "an error occured while fetching from server";
      return {
        Success: false,
        Message: errorMessage,
      };
    }
  }

  private async _handleResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    try {
      const resBody = await response.json();
      if (
        typeof resBody === "object" &&
        resBody !== null &&
        "Success" in resBody &&
        "Message" in resBody
      ) {
        return resBody as ApiResponse<T>;
      }

      return {
        Success: false,
        Message: "Invalid response format",
      };
    } catch {
      return {
        Success: false,
        Message: "Failed to parse response",
      };
    }
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return await this._fetchData(endpoint, {
      method: "GET",
    });
  }

  public async post<T, B>(endpoint: string, body?: B): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: "POST" };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }
    return await this._fetchData(endpoint, options);
  }

  public async put<T, B>(endpoint: string, body?: B): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: "PUT" };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }
    return await this._fetchData(endpoint, options);
  }

  public async patch<T, B>(
    endpoint: string,
    body?: B
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: "PATCH" };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }
    return await this._fetchData(endpoint, options);
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return await this._fetchData(endpoint, {
      method: "DELETE",
    });
  }
}
