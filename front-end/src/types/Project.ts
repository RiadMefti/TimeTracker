export interface Project {
  ID: number;
  Name: string;
  Description: string;
  Color: string;
}

export interface ProjectCreate {
  Name: string;
  Description: string;
  Color: string;
}
