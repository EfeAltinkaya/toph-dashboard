export type LogWithRelations = {
  id: number;
  employee: { id: number; name: string };
  activity: string;
  field: string;
  date: Date;
  startTime: string;
  endTime: string;
  isNew: boolean;
  accuracy: number;
  audioUrl: string;
  photoUrl: string | null;
  transcript: string;
  language: string;
  translated: string | null;
  lat: number;
  lng: number;
  tags: { id: number; name: string }[];
};

export type TagOption = { id: number; name: string };
