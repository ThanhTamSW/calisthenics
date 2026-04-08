import "@testing-library/jest-dom";

// jsdom chưa có IntersectionObserver: mock tối giản cho test.
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
}

globalThis.IntersectionObserver = MockIntersectionObserver;

// Giảm spam cảnh báo act trong log test (không ảnh hưởng assert)
const originalError = console.error;
console.error = (...args) => {
  const msg = args[0];
  if (typeof msg === "string" && msg.includes("not wrapped in act")) return;
  if (typeof msg === "string" && msg.includes("ReactDOMTestUtils.act is deprecated")) return;
  originalError(...args);
};

