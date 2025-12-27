import { Worker } from "bullmq";
import Redis from "ioredis";
import { QUEUE_NAMES } from "@/lib/queue";
import { sttProcessor } from "./stt-worker";
import { extractProcessor } from "./extract-worker";
import { writeProcessor } from "./write-worker";
import { exportProcessor } from "./export-worker";
import { workerLogger } from "@/lib/logger";

function createConnection(): Redis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

const workers: Worker[] = [];

function startWorkers() {
  workerLogger.info("Starting workers...");

  // STT Worker
  const sttWorker = new Worker(QUEUE_NAMES.STT, sttProcessor, {
    connection: createConnection(),
    concurrency: 2,
  });
  workers.push(sttWorker);

  // Extract Worker
  const extractWorker = new Worker(QUEUE_NAMES.EXTRACT, extractProcessor, {
    connection: createConnection(),
    concurrency: 2,
  });
  workers.push(extractWorker);

  // Write Worker
  const writeWorker = new Worker(QUEUE_NAMES.WRITE, writeProcessor, {
    connection: createConnection(),
    concurrency: 1,
  });
  workers.push(writeWorker);

  // Export Worker
  const exportWorker = new Worker(QUEUE_NAMES.EXPORT, exportProcessor, {
    connection: createConnection(),
    concurrency: 2,
  });
  workers.push(exportWorker);

  // Set up event handlers for all workers
  workers.forEach((worker) => {
    worker.on("completed", (job) => {
      workerLogger.info(
        { jobId: job.id, queue: worker.name },
        "Job completed"
      );
    });

    worker.on("failed", (job, error) => {
      workerLogger.error(
        { jobId: job?.id, queue: worker.name, error: error.message },
        "Job failed"
      );
    });

    worker.on("error", (error) => {
      workerLogger.error({ queue: worker.name, error: error.message }, "Worker error");
    });
  });

  workerLogger.info("All workers started");
}

async function shutdown() {
  workerLogger.info("Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  workerLogger.info("Workers shut down");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startWorkers();
