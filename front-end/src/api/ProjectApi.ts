import type IApiResponse from "../types/ApiResponse";
import type { Project, ProjectCreate } from "../types/Project";
import { ApiClient } from "./ApiClient";

export class ProjectApi {
  private apiClient: ApiClient;
  private group = "projects";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserProjects(): Promise<IApiResponse<Project[]>> {
    return await this.apiClient.get<Project[]>(`/${this.group}`);
  }
  async createUserProject(projectToCreate: ProjectCreate) {
    return await this.apiClient.post<Project[], ProjectCreate>(
      `/${this.group}`,
      projectToCreate
    );
  }
  async updateUserProject(projectToUpdate: Project) {
    return await this.apiClient.put<Project[], Project>(
      `/${this.group}`,
      projectToUpdate
    );
  }
  async deleteUserProject(projectId: string) {
    return await this.apiClient.delete<Project[]>(
      `/${this.group}/${projectId}`
    );
  }
}
