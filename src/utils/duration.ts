const durationPattern = /^(\d+)(ms|s|m|h|d)$/;

const unitToMs: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export const durationToMs = (value: string): number => {
  const normalized = value.trim();
  const match = normalized.match(durationPattern);

  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  return amount * unitToMs[unit];
};
