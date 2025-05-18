import type IUser from "../types/User";
import { ApiClient } from "./ApiClient";

export class AuthApi {
  private apiClient: ApiClient;
  private group = "auth";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login() {
    return this.apiClient.post<IUser, null>(`/${this.group}/login`);
  }
}
