import { describe, it, expect } from "vitest";
import { createMoney, formatMoney } from "./money.js";

describe("Money", () => {
  describe("createMoney", () => {
    it("should convert dollars to cents", () => {
      const money = createMoney(100);
      expect(money.amountMinor).toBe(10000);
      expect(money.currency).toBe("USD");
    });

    it("should handle zero", () => {
      const money = createMoney(0);
      expect(money.amountMinor).toBe(0);
      expect(money.currency).toBe("USD");
    });

    it("should round to nearest cent", () => {
      const money = createMoney(10.999);
      expect(money.amountMinor).toBe(1100);
    });

    it("should throw error for negative amounts", () => {
      expect(() => createMoney(-1)).toThrow("Amount cannot be negative");
    });
  });

  describe("formatMoney", () => {
    it("should format money correctly", () => {
      const money = createMoney(100);
      expect(formatMoney(money)).toBe("$100.00");
    });

    it("should format with different locale", () => {
      const money = createMoney(1000);
      expect(formatMoney(money, "de-DE")).toBe("1.000,00 $");
    });

    it("should handle zero", () => {
      const money = createMoney(0);
      expect(formatMoney(money)).toBe("$0.00");
    });
  });
});
