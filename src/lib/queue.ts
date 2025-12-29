import { Queue, Worker, Job as BullJob, QueueEvents } from "bullmq";
import Redis from "ioredis";

// Check if we should skip queue initialization
const shouldSkipQueue =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  typeof window !== 'undefined' ||
  !process.env.REDIS_URL;

// Create a dedicated connection for BullMQ
function createConnection(): Redis | null {
  if (shouldSkipQueue) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL!;

  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

// Queue names
export const QUEUE_NAMES = {
  STT: "stt-queue",
  EXTRACT: "extract-queue",
  WRITE: "write-queue",
  EXPORT: "export-queue",
} as const;

// Job data types
export interface STTJobData {
  projectId: string;
  audioAssetId: string;
  s3Key: string;
}

export interface ExtractJobData {
  projectId: string;
  transcriptIds: string[];
}

export interface WriteJobData {
  projectId: string;
  storyId: string;
}

export interface ExportJobData {
  projectId: string;
  draftId: string;
  format: "pdf" | "docx";
}

// Create queues (only if Redis is available)
function createQueue<T>(name: string, options: any): Queue<T> | null {
  if (shouldSkipQueue) {
    return null;
  }
  return new Queue<T>(name, {
    connection: createConnection()!,
    ...options,
  });
}

export const sttQueue = createQueue<STTJobData>(QUEUE_NAMES.STT, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export const extractQueue = createQueue<ExtractJobData>(QUEUE_NAMES.EXTRACT, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export const writeQueue = createQueue<WriteJobData>(QUEUE_NAMES.WRITE, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});

export const exportQueue = createQueue<ExportJobData>(QUEUE_NAMES.EXPORT, {
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "fixed",
      delay: 3000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

// Helper to add jobs
export async function addSTTJob(data: STTJobData, priority = 0) {
  if (!sttQueue) {
    throw new Error("Queue not available - Redis not configured");
  }
  return sttQueue.add("transcribe", data, { priority });
}

export async function addExtractJob(data: ExtractJobData, priority = 0) {
  if (!extractQueue) {
    throw new Error("Queue not available - Redis not configured");
  }
  return extractQueue.add("extract", data, { priority });
}

export async function addWriteJob(data: WriteJobData, priority = 0) {
  if (!writeQueue) {
    throw new Error("Queue not available - Redis not configured");
  }
  return writeQueue.add("write", data, { priority });
}

export async function addExportJob(data: ExportJobData, priority = 0) {
  if (!exportQueue) {
    throw new Error("Queue not available - Redis not configured");
  }
  return exportQueue.add("export", data, { priority });
}

// Get queue events for monitoring
export function createQueueEvents(queueName: string): QueueEvents | null {
  if (shouldSkipQueue) {
    return null;
  }
  return new QueueEvents(queueName, {
    connection: createConnection()!,
  });
}
