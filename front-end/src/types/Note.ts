export interface Note {
  ID: number;
  Title: string;
  Content: string; // TipTap JSON content
  FolderID?: number;
  UserID: string;
  Created: string;
  Updated: string;
}

export interface NoteCreate {
  Title: string;
  Content: string;
  FolderID?: number;
}

export interface NoteUpdate {
  Title: string;
  Content: string;
  FolderID?: number;
}
