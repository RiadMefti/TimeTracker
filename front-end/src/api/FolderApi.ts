import { ApiClient } from './ApiClient';
import type { Folder, FolderCreate, FolderUpdate } from '../types/Folder';
import type IApiResponse from '../types/ApiResponse';

export class FolderApi {
  private apiClient: ApiClient;
  private group = "folders";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllFolders(): Promise<IApiResponse<Folder[]>> {
    return await this.apiClient.get<Folder[]>(`/${this.group}`);
  }

  async getFolderById(id: number): Promise<IApiResponse<Folder>> {
    return await this.apiClient.get<Folder>(`/${this.group}/${id}`);
  }

  async getFoldersByParent(parentId?: number): Promise<IApiResponse<Folder[]>> {
    const url = parentId ? `/${this.group}/parent/${parentId}` : `/${this.group}/parent`;
    return await this.apiClient.get<Folder[]>(url);
  }

  async createFolder(folder: FolderCreate): Promise<IApiResponse<Folder>> {
    return await this.apiClient.post<Folder, FolderCreate>(`/${this.group}`, folder);
  }

  async updateFolder(id: number, folder: FolderUpdate): Promise<IApiResponse<Folder>> {
    return await this.apiClient.put<Folder, FolderUpdate>(`/${this.group}/${id}`, folder);
  }

  async deleteFolder(id: number): Promise<IApiResponse<void>> {
    return await this.apiClient.delete<void>(`/${this.group}/${id}`);
  }
}
