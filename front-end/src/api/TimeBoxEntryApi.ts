import type IApiResponse from "../types/ApiResponse";
import type { TimeBoxEntry, TimeBoxEntryCreate } from "../types/TimeBoxEntry";
import type { AssignProjectPayload } from "../types/TimeEntry";
import { ApiClient } from "./ApiClient";

export class TimeBoxEntryApi {
  private apiClient: ApiClient;
  private group = "time-box-entries";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUserTimeBoxEntries(): Promise<IApiResponse<TimeBoxEntry[]>> {
    return await this.apiClient.get<TimeBoxEntry[]>(`/${this.group}`);
  }

  async createTimeBoxEntry(entryToCreate: TimeBoxEntryCreate) {
    return await this.apiClient.post<TimeBoxEntry[], TimeBoxEntryCreate>(
      `/${this.group}`,
      entryToCreate
    );
  }

  async updateTimeBoxEntry(entryToUpdate: TimeBoxEntry) {
    return await this.apiClient.put<TimeBoxEntry[], TimeBoxEntry>(
      `/${this.group}`,
      entryToUpdate
    );
  }

  async deleteTimeBoxEntry(timeBoxEntryId: number) {
    return await this.apiClient.delete<TimeBoxEntry[]>(
      `/${this.group}/${timeBoxEntryId}`
    );
  }

  async assignProjectToTimeBox(
    timeBoxEntryId: number,
    payload: AssignProjectPayload
  ) {
    return await this.apiClient.patch<TimeBoxEntry[], AssignProjectPayload>(
      `/${this.group}/${timeBoxEntryId}/assign-project`,
      payload
    );
  }
}
