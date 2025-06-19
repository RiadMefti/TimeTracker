export interface Folder {
  ID: number;
  Name: string;
  ParentID?: number;
  UserID: string;
  Created: string;
  Updated: string;
}

export interface FolderCreate {
  Name: string;
  ParentID?: number;
}

export interface FolderUpdate {
  Name: string;
  ParentID?: number;
}
