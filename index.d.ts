export interface Segment { text: string; start: number; duration: number }
export interface Options { token?: string; translateTo?: string; signal?: AbortSignal }
export class TranscriptError extends Error { status: string; videoId: string }
export function fetchMany(videos: Iterable<string>, opts?: Options): Promise<Record<string, Segment[] | TranscriptError>>;
export function fetchTranscript(video: string, opts?: Options): Promise<Segment[]>;
