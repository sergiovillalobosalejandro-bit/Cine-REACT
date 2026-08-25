import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce.js";

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 400));
    expect(result.current).toBe("initial");
  });

  it("should update debounced value after specified delay", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "first", delay: 400 },
      },
    );

    expect(result.current).toBe("first");

    // Update props
    rerender({ value: "second", delay: 400 });

    // Value should still be 'first' before timer executes
    expect(result.current).toBe("first");

    // Fast-forward 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("second");

    vi.useRealTimers();
  });
});
