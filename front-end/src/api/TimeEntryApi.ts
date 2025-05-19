import type IApiResponse from "../types/ApiResponse";
import type { TimeEntry, TimeEntryCreate, AssignProjectPayload } from "../types/TimeEntry";
import { ApiClient } from "./ApiClient";

export class TimeEntryApi {
  private apiClient: ApiClient;
  private group = "time-entries";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserTimeEntries(): Promise<IApiResponse<TimeEntry[]>> {
    return await this.apiClient.get<TimeEntry[]>(`/${this.group}`);
  }

  async createTimeEntry(entryToCreate: TimeEntryCreate) {
    return await this.apiClient.post<TimeEntry[], TimeEntryCreate>(
      `/${this.group}`,
      entryToCreate
    );
  }

  async updateTimeEntry(entryToUpdate: TimeEntry) {
    return await this.apiClient.put<TimeEntry[], TimeEntry>(
      `/${this.group}`,
      entryToUpdate
    );
  }

  async deleteTimeEntry(timeEntryId: number) {
    return await this.apiClient.delete<TimeEntry[]>(
      `/${this.group}/${timeEntryId}`
    );
  }

  async assignProjectToTime(timeEntryId: number, payload: AssignProjectPayload) {
    return await this.apiClient.patch<TimeEntry[], AssignProjectPayload>(
      `/${this.group}/${timeEntryId}/assign-project`,
      payload
    );
  }
}
