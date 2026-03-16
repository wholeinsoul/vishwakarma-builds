import { describe, it, expect } from "vitest";

describe("dead man's switch logic", () => {
  describe("check-in timer calculation", () => {
    it("calculates next_check_in correctly for 30-day interval", () => {
      const now = new Date("2026-01-01T00:00:00Z");
      const intervalDays = 30;
      const nextCheckIn = new Date(
        now.getTime() + intervalDays * 24 * 60 * 60 * 1000
      );
      expect(nextCheckIn.toISOString()).toBe("2026-01-31T00:00:00.000Z");
    });

    it("calculates next_check_in correctly for 90-day interval", () => {
      const now = new Date("2026-03-01T00:00:00Z");
      const intervalDays = 90;
      const nextCheckIn = new Date(
        now.getTime() + intervalDays * 24 * 60 * 60 * 1000
      );
      expect(nextCheckIn.toISOString()).toBe("2026-05-30T00:00:00.000Z");
    });

    it("calculates next_check_in correctly for 365-day interval", () => {
      const now = new Date("2026-01-01T00:00:00Z");
      const intervalDays = 365;
      const nextCheckIn = new Date(
        now.getTime() + intervalDays * 24 * 60 * 60 * 1000
      );
      expect(nextCheckIn.toISOString()).toBe("2027-01-01T00:00:00.000Z");
    });
  });

  describe("days overdue calculation", () => {
    function calculateDaysOverdue(
      nextCheckIn: Date,
      now: Date
    ): number {
      return Math.floor(
        (now.getTime() - nextCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    it("returns 0 when check-in is today", () => {
      const now = new Date("2026-03-16T12:00:00Z");
      const nextCheckIn = new Date("2026-03-16T00:00:00Z");
      expect(calculateDaysOverdue(nextCheckIn, now)).toBe(0);
    });

    it("returns negative when not yet due", () => {
      const now = new Date("2026-03-10T00:00:00Z");
      const nextCheckIn = new Date("2026-03-16T00:00:00Z");
      expect(calculateDaysOverdue(nextCheckIn, now)).toBeLessThan(0);
    });

    it("returns correct days when overdue", () => {
      const now = new Date("2026-03-26T00:00:00Z");
      const nextCheckIn = new Date("2026-03-16T00:00:00Z");
      expect(calculateDaysOverdue(nextCheckIn, now)).toBe(10);
    });
  });

  describe("switch status transitions", () => {
    type SwitchStatus = "active" | "paused" | "triggered" | "disabled";

    const validTransitions: Record<SwitchStatus, SwitchStatus[]> = {
      active: ["paused", "triggered", "disabled"],
      paused: ["active", "disabled"],
      triggered: ["disabled"],
      disabled: [],
    };

    function canTransition(
      from: SwitchStatus,
      to: SwitchStatus
    ): boolean {
      return validTransitions[from].includes(to);
    }

    it("active can transition to paused", () => {
      expect(canTransition("active", "paused")).toBe(true);
    });

    it("active can transition to triggered", () => {
      expect(canTransition("active", "triggered")).toBe(true);
    });

    it("active can transition to disabled", () => {
      expect(canTransition("active", "disabled")).toBe(true);
    });

    it("paused can transition to active", () => {
      expect(canTransition("paused", "active")).toBe(true);
    });

    it("paused cannot transition to triggered", () => {
      expect(canTransition("paused", "triggered")).toBe(false);
    });

    it("triggered can transition to disabled", () => {
      expect(canTransition("triggered", "disabled")).toBe(true);
    });

    it("triggered cannot transition to active", () => {
      expect(canTransition("triggered", "active")).toBe(false);
    });

    it("disabled cannot transition to any state", () => {
      expect(canTransition("disabled", "active")).toBe(false);
      expect(canTransition("disabled", "paused")).toBe(false);
      expect(canTransition("disabled", "triggered")).toBe(false);
    });
  });

  describe("escalation chain", () => {
    function getEscalationAction(
      daysOverdue: number
    ): "none" | "reminder" | "urgent" | "trigger" {
      if (daysOverdue < 0) return "none";
      if (daysOverdue < 7) return "reminder";
      if (daysOverdue < 14) return "urgent";
      return "trigger";
    }

    it("no action when not overdue", () => {
      expect(getEscalationAction(-5)).toBe("none");
    });

    it("sends reminder when 0-6 days overdue", () => {
      expect(getEscalationAction(0)).toBe("reminder");
      expect(getEscalationAction(3)).toBe("reminder");
      expect(getEscalationAction(6)).toBe("reminder");
    });

    it("sends urgent warning when 7-13 days overdue", () => {
      expect(getEscalationAction(7)).toBe("urgent");
      expect(getEscalationAction(10)).toBe("urgent");
      expect(getEscalationAction(13)).toBe("urgent");
    });

    it("triggers switch at 14+ days overdue", () => {
      expect(getEscalationAction(14)).toBe("trigger");
      expect(getEscalationAction(30)).toBe("trigger");
      expect(getEscalationAction(100)).toBe("trigger");
    });
  });

  describe("check-in interval validation", () => {
    const validIntervals = [30, 60, 90, 180, 365];

    it("all preset intervals are between 1 and 365", () => {
      for (const interval of validIntervals) {
        expect(interval).toBeGreaterThanOrEqual(1);
        expect(interval).toBeLessThanOrEqual(365);
      }
    });

    it("resets timer correctly after check-in", () => {
      const checkInTime = new Date("2026-03-16T10:00:00Z");
      const intervalDays = 90;
      const nextCheckIn = new Date(
        checkInTime.getTime() + intervalDays * 24 * 60 * 60 * 1000
      );

      // Should be ~90 days later
      const diffDays = Math.round(
        (nextCheckIn.getTime() - checkInTime.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBe(90);
    });
  });
});
