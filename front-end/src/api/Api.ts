import { ApiClient } from "./ApiClient";
import { AuthApi } from "./AuthApi";

export class Api {
  private static _client: ApiClient;
  private static _authApi: AuthApi;

  static initApiClasses() {
    if (!Api._client) {
      throw new Error("API client not initialized. Set access token first.");
    }
    Api._authApi = new AuthApi(Api._client);
  }
  static set authToken(token: string | undefined) {
    if (!token) {
      console.warn("No access token provided to Api");
      return;
    }

    if (!Api._client) {
      Api._client = new ApiClient(import.meta.env.VITE_API_URL);
    }
    Api._client.authToken = token;
  }

  static get authToken() {
    return Api._client?.authToken || "";
  }

  public static get auth() {
    if (!Api._authApi) {
      throw new Error("AuthApi  not initialized. ");
    }

    return Api._authApi;
  }
}
