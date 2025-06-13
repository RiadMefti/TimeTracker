import { ApiClient } from "./ApiClient";
import { AuthApi } from "./AuthApi";
import { ProjectApi } from "./ProjectApi";
import { TimeBoxEntryApi } from "./TimeBoxEntryApi";
import { TimeEntryApi } from "./TimeEntryApi";

export class Api {
  private static _client: ApiClient;
  private static _authApi: AuthApi;
  private static _projectApi: ProjectApi;
  private static _timeEntryApi: TimeEntryApi;
  private static _timeBoxEntryApi: TimeBoxEntryApi;

  static initApiClasses() {
    if (!Api._client) {
      throw new Error("API client not initialized. Set access token first.");
    }
    Api._authApi = new AuthApi(Api._client);
    Api._projectApi = new ProjectApi(Api._client);
    Api._timeEntryApi = new TimeEntryApi(Api._client);
    Api._timeBoxEntryApi = new TimeBoxEntryApi(Api._client);
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
      throw new Error("AuthApi not initialized.");
    }
    return Api._authApi;
  }

  public static get projects() {
    if (!Api._projectApi) {
      throw new Error("ProjectApi not initialized.");
    }
    return Api._projectApi;
  }

  public static get timeEntry() {
    if (!Api._timeEntryApi) {
      throw new Error("TimeEntryApi not initialized.");
    }
    return Api._timeEntryApi;
  }

  public static get timeBoxEntry() {
    if (!Api._timeBoxEntryApi) {
      throw new Error("TimeBoxEntryApi not initialized.");
    }
    return Api._timeBoxEntryApi;
  }
}
