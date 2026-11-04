/* eslint-disable @typescript-eslint/no-require-imports -- run by Node as-is (CommonJS), never compiled by Next */
// Startup file for Passenger (cPanel → Setup Node.js App → Application startup file: server.js).
//
// `next start` is a CLI command, while Passenger needs a Node file to run; this file does what `next start` does.
//  - Passenger hands the port over in PORT — never hardcode it.
//  - This file is not compiled by Next: plain Node syntax only. package.json has no `"type": "module"`, so `require`.
//  - Do not enable `output: "standalone"`: standalone builds do not include a custom server.

/*
  Cap the process's THREADS — must run before any other `require`.

  cPanel hosting runs CloudLinux, which counts EVERY THREAD as a "process" against the plan's Number of Processes
  limit. A Node process has libuv's pool (4 by default), V8's workers (4), GC and sharp while optimising images (CPU
  cores / 2 — shared servers often have 32–64 cores). libuv creates its pool on first use, so setting it here is in
  time; V8's pool can only be set with a command-line flag: NODE_OPTIONS="--v8-pool-size=2" in Setup Node.js App.
  Sharp is capped in next.config.ts (experimental.imgOptConcurrency).
*/
process.env.UV_THREADPOOL_SIZE ||= "2";

const { createServer } = require("http");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || undefined;

// Passenger/LiteSpeed only collect the app's stderr into the log; stdout is lost. Log with console.error.
const log = (...parts) => console.error(...parts);

/*
  Bound the process's lifetime so none lingers:
  - Idle for IDLE_EXIT_MINUTES (default 10) → exit; Passenger starts a fresh one on the next request (that visitor
    waits a few seconds). Old processes left behind by a Restart clean themselves up. IDLE_EXIT_MINUTES=0 disables it.
  - A request hanging longer than REQUEST_TIMEOUT_SECONDS (default 60) is cut off.
  - SIGTERM/SIGINT (Restart from cPanel) → close gracefully, forced after 5 s (keep-alive sockets or the database
    pool can otherwise hold the process open).
*/
const IDLE_EXIT_MS = Number(process.env.IDLE_EXIT_MINUTES ?? 10) * 60_000;
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_SECONDS ?? 60) * 1000;

let inFlight = 0;
let idleTimer;
let stopping = false;
let server;

function stop(reason) {
  if (stopping) return;
  stopping = true;
  log(`> Stopping process ${process.pid}: ${reason}`);
  setTimeout(() => process.exit(0), 5000).unref();
  if (server) server.close(() => process.exit(0));
  else process.exit(0);
}

function resetIdleTimer() {
  if (!(IDLE_EXIT_MS > 0)) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (inFlight === 0) stop(`idle for ${IDLE_EXIT_MS / 60_000} min`);
    else resetIdleTimer();
  }, IDLE_EXIT_MS);
  idleTimer.unref();
}

process.once("SIGTERM", () => stop("SIGTERM"));
process.once("SIGINT", () => stop("SIGINT"));

const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    server = createServer((req, res) => {
      inFlight += 1;
      resetIdleTimer();
      res.once("close", () => {
        inFlight -= 1;
      });

      // Since Node 15 an unhandled rejection ends the process — on shared hosting that means Passenger spawning yet
      // another one. A failing page answers 500 on its own instead of taking the site down.
      Promise.resolve(handle(req, res)).catch((error) => {
        log(`Error handling ${req.url}:`, error);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        } else {
          res.destroy();
        }
      });
    });

    server.requestTimeout = REQUEST_TIMEOUT_MS;
    server.listen(port, hostname, () => {
      log(`> Ready on port ${port} (pid ${process.pid})`);
      resetIdleTimer();
    });
  })
  .catch((error) => {
    console.error("Next failed to start:", error);
    process.exit(1);
  });
