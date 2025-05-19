export interface TimeEntry {
  ID: number;
  Description: string;
  ProjectID: number | null;
  StartDate: string;
  EndDate: string;
}

export interface TimeEntryCreate {
  Description: string;
  ProjectID: number | null;
  StartDate: string;
  EndDate: string;
}

export interface AssignProjectPayload {
  ProjectID: number | null;
}
