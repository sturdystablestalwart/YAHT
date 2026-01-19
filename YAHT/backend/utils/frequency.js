const VALID_PERIODS = ["day", "week", "month"];

/**
 * Normalize period string to valid enum value
 * Maps minute/hour to day for simplicity
 */
function normalizePeriod(period) {
  const lower = period?.toLowerCase();
  if (["minute", "hour", "day"].includes(lower)) return "day";
  if (lower === "week") return "week";
  if (lower === "month") return "month";
  return null;
}

/**
 * Parse frequency input (string or object) to structured format
 * @param {string|object} frequencyInput - "3 per day" or { target: 3, period: "day" }
 * @returns {{ target: number, period: string }}
 */
function parseFrequency(frequencyInput) {
  // Handle structured input: { target: 3, period: 'day' }
  if (typeof frequencyInput === "object" && frequencyInput !== null) {
    const target = Number(frequencyInput.target);
    const period = frequencyInput.period;
    if (isNaN(target) || target < 1) {
      throw new Error("Target must be a positive number");
    }
    const normalizedPeriod = normalizePeriod(period);
    if (!normalizedPeriod) {
      throw new Error(
        `Invalid period. Must be one of: ${VALID_PERIODS.join(", ")}`
      );
    }
    return { target: Math.floor(target), period: normalizedPeriod };
  }

  // Handle legacy string input: "3 per day"
  if (typeof frequencyInput === "string") {
    const match = frequencyInput.match(/^(\d+)\s+per\s+(\w+)$/i);
    if (match) {
      const target = parseInt(match[1], 10);
      const normalizedPeriod = normalizePeriod(match[2]);
      if (normalizedPeriod) {
        return { target, period: normalizedPeriod };
      }
    }
    throw new Error('Invalid frequency format. Use "X per day/week/month"');
  }

  throw new Error("Frequency must be an object or string");
}

/**
 * Get the start of the period containing the given date
 */
function getPeriodStart(date, period) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  switch (period) {
    case "day":
      return d;
    case "week":
      // Start of week (Sunday = 0)
      const dayOfWeek = d.getDay();
      d.setDate(d.getDate() - dayOfWeek);
      return d;
    case "month":
      d.setDate(1);
      return d;
    default:
      return d;
  }
}

/**
 * Get the end of the period (start of next period)
 */
function getPeriodEnd(date, period) {
  const start = getPeriodStart(date, period);
  const end = new Date(start);

  switch (period) {
    case "day":
      end.setDate(end.getDate() + 1);
      break;
    case "week":
      end.setDate(end.getDate() + 7);
      break;
    case "month":
      end.setMonth(end.getMonth() + 1);
      break;
  }

  return end;
}

/**
 * Get a unique key for the period (for grouping completions)
 */
function getPeriodKey(date, period) {
  const start = getPeriodStart(date, period);
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, "0");
  const day = String(start.getDate()).padStart(2, "0");

  switch (period) {
    case "day":
      return `${year}-${month}-${day}`;
    case "week":
      // Use start date of week as key
      return `${year}-W${month}-${day}`;
    case "month":
      return `${year}-${month}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Get the start of the previous period
 */
function getPreviousPeriodStart(date, period) {
  const start = getPeriodStart(date, period);

  switch (period) {
    case "day":
      start.setDate(start.getDate() - 1);
      return start;
    case "week":
      start.setDate(start.getDate() - 7);
      return start;
    case "month":
      start.setMonth(start.getMonth() - 1);
      return start;
    default:
      return start;
  }
}

export {
  VALID_PERIODS,
  normalizePeriod,
  parseFrequency,
  getPeriodStart,
  getPeriodEnd,
  getPeriodKey,
  getPreviousPeriodStart,
};
