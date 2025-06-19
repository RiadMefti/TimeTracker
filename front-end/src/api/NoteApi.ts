import { ApiClient } from './ApiClient';
import type { Note, NoteCreate, NoteUpdate } from '../types/Note';
import type IApiResponse from '../types/ApiResponse';

export class NoteApi {
  private apiClient: ApiClient;
  private group = "notes";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllNotes(): Promise<IApiResponse<Note[]>> {
    return await this.apiClient.get<Note[]>(`/${this.group}`);
  }

  async getNoteById(id: number): Promise<IApiResponse<Note>> {
    return await this.apiClient.get<Note>(`/${this.group}/${id}`);
  }

  async getNotesByFolder(folderId?: number): Promise<IApiResponse<Note[]>> {
    const url = folderId ? `/${this.group}/folder/${folderId}` : `/${this.group}/folder`;
    return await this.apiClient.get<Note[]>(url);
  }

  async createNote(note: NoteCreate): Promise<IApiResponse<Note>> {
    return await this.apiClient.post<Note, NoteCreate>(`/${this.group}`, note);
  }

  async updateNote(id: number, note: NoteUpdate): Promise<IApiResponse<Note>> {
    return await this.apiClient.put<Note, NoteUpdate>(`/${this.group}/${id}`, note);
  }

  async deleteNote(id: number): Promise<IApiResponse<void>> {
    return await this.apiClient.delete<void>(`/${this.group}/${id}`);
  }
}
