export type RollingDay = {
  iso: string;
  weekday: string;
  dayNum: number;
};

export type AvailabilityBroadcast = {
  workerMlId: string;
  workerName: string;
  selectedDates: string[];
  broadcastAt: number;
  expiresAt: number;
  city?: string;
  category?: string;
};
