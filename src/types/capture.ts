export type CaptureKind = 'task' | 'idea' | 'reminder' | 'note' | 'unknown';

export type Capture = {
  id: string;
  user_id: string;
  content: string;
  kind: CaptureKind;
  processed: boolean;
  created_at: string;
};

export type CreateCaptureInput = Pick<Capture, 'content'>
  & Partial<Pick<Capture, 'kind'>>;
