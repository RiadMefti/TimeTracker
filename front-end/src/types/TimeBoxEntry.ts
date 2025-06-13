export interface TimeBoxEntry {
  ID: number;
  Description: string;
  ProjectID: number | null;
  StartDate: string;
  EndDate: string;
}

export interface TimeBoxEntryCreate {
  Description: string;
  ProjectID: number | null;
  StartDate: string;
  EndDate: string;
}
