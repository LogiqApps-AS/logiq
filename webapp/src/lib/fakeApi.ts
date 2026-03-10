/**
 * Fake API client that wraps static data with simulated latency and error rates.
 * Provides a realistic async data-fetching experience for development/demo.
 */

interface FakeApiOptions {
  /** Simulated delay in ms (default: 800-1500 random) */
  delayMs?: number;
  /** Error rate 0-1 (default: 0.05 = 5%) */
  errorRate?: number;
}

const DEFAULT_DELAY_MIN = 800;
const DEFAULT_DELAY_MAX = 1500;
const DEFAULT_ERROR_RATE = 0.05;

function getRandomDelay(min = DEFAULT_DELAY_MIN, max = DEFAULT_DELAY_MAX): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class FakeApiError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "FakeApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Simulates a network request by wrapping data in a delayed promise.
 * Randomly throws errors based on configured error rate.
 */
export async function fakeApiCall<T>(
  data: T | (() => T),
  options?: FakeApiOptions
): Promise<T> {
  const delay = options?.delayMs ?? getRandomDelay();
  const errorRate = options?.errorRate ?? DEFAULT_ERROR_RATE;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new FakeApiError("Simulated server error — please retry.", 500));
      } else {
        const result = typeof data === "function" ? (data as () => T)() : data;
        resolve(structuredClone(result));
      }
    }, delay);
  });
}

// ─── API endpoint functions ────────────────────────────────────────────
import {
  employees,
  signals,
  teamKPIs,
  teamFinancials,
  type Employee,
  type Signal,
} from "@/data/sampleData";
import {
  meetingsData,
  pastMeetings,
  deferredTopics,
  type Meeting,
} from "@/data/meetingsData";

export const api = {
  /** Fetch all employees */
  getEmployees: (opts?: FakeApiOptions): Promise<Employee[]> =>
    fakeApiCall(employees, opts),

  /** Fetch a single employee by ID */
  getEmployee: (id: string, opts?: FakeApiOptions): Promise<Employee | undefined> =>
    fakeApiCall(() => employees.find((e) => e.id === id), opts),

  /** Fetch all signals */
  getSignals: (opts?: FakeApiOptions): Promise<Signal[]> =>
    fakeApiCall(signals, opts),

  /** Fetch team KPIs */
  getTeamKPIs: (opts?: FakeApiOptions) =>
    fakeApiCall(teamKPIs, opts),

  /** Fetch team financials */
  getTeamFinancials: (opts?: FakeApiOptions) =>
    fakeApiCall(teamFinancials, opts),

  /** Fetch upcoming meetings */
  getMeetings: (opts?: FakeApiOptions): Promise<Meeting[]> =>
    fakeApiCall(meetingsData, opts),

  /** Fetch past meetings */
  getPastMeetings: (opts?: FakeApiOptions): Promise<Meeting[]> =>
    fakeApiCall(pastMeetings, opts),

  /** Fetch deferred topics */
  getDeferredTopics: (opts?: FakeApiOptions) =>
    fakeApiCall(deferredTopics, opts),
} as const;
