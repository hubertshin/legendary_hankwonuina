import { Queue, Worker, Job as BullJob, QueueEvents } from "bullmq";
import Redis from "ioredis";

// Create a dedicated connection for BullMQ
function createConnection(): Redis {
  // Skip Redis connection during build time or if no URL provided
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    typeof window !== 'undefined' ||
    !process.env.REDIS_URL
  ) {
    // Return a mock Redis instance for build time
    return {
      status: 'ready',
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      quit: () => Promise.resolve(),
    } as unknown as Redis;
  }

  const redisUrl = process.env.REDIS_URL;

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

// Create queues
export const sttQueue = new Queue<STTJobData>(QUEUE_NAMES.STT, {
  connection: createConnection(),
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

export const extractQueue = new Queue<ExtractJobData>(QUEUE_NAMES.EXTRACT, {
  connection: createConnection(),
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

export const writeQueue = new Queue<WriteJobData>(QUEUE_NAMES.WRITE, {
  connection: createConnection(),
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

export const exportQueue = new Queue<ExportJobData>(QUEUE_NAMES.EXPORT, {
  connection: createConnection(),
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
  return sttQueue.add("transcribe", data, { priority });
}

export async function addExtractJob(data: ExtractJobData, priority = 0) {
  return extractQueue.add("extract", data, { priority });
}

export async function addWriteJob(data: WriteJobData, priority = 0) {
  return writeQueue.add("write", data, { priority });
}

export async function addExportJob(data: ExportJobData, priority = 0) {
  return exportQueue.add("export", data, { priority });
}

// Get queue events for monitoring
export function createQueueEvents(queueName: string): QueueEvents {
  return new QueueEvents(queueName, {
    connection: createConnection(),
  });
}
