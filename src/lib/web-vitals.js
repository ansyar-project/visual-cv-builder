// Performance monitoring utilities
/* eslint-env browser */

// Core Web Vitals monitoring functions
function getCLS(onPerfEntry) {
  if (
    typeof window !== "undefined" &&
    onPerfEntry &&
    onPerfEntry instanceof Function
  ) {
    import("web-vitals")
      .then(({ onCLS }) => {
        onCLS(onPerfEntry);
      })
      .catch(console.error);
  }
}

function getFID(onPerfEntry) {
  if (
    typeof window !== "undefined" &&
    onPerfEntry &&
    onPerfEntry instanceof Function
  ) {
    import("web-vitals")
      .then(({ onINP }) => {
        // FID is deprecated, use INP (Interaction to Next Paint) instead
        onINP(onPerfEntry);
      })
      .catch(console.error);
  }
}

function getFCP(onPerfEntry) {
  if (
    typeof window !== "undefined" &&
    onPerfEntry &&
    onPerfEntry instanceof Function
  ) {
    import("web-vitals")
      .then(({ onFCP }) => {
        onFCP(onPerfEntry);
      })
      .catch(console.error);
  }
}

function getLCP(onPerfEntry) {
  if (
    typeof window !== "undefined" &&
    onPerfEntry &&
    onPerfEntry instanceof Function
  ) {
    import("web-vitals")
      .then(({ onLCP }) => {
        onLCP(onPerfEntry);
      })
      .catch(console.error);
  }
}

function getTTFB(onPerfEntry) {
  if (
    typeof window !== "undefined" &&
    onPerfEntry &&
    onPerfEntry instanceof Function
  ) {
    import("web-vitals")
      .then(({ onTTFB }) => {
        onTTFB(onPerfEntry);
      })
      .catch(console.error);
  }
}

// Report to analytics
function sendToAnalytics(metric) {
  if (typeof window !== "undefined" && typeof gtag !== "undefined") {
    gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

// Initialize monitoring
export function initWebVitals() {
  if (typeof window !== "undefined" && "performance" in window) {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }
}

export { getCLS, getFID, getFCP, getLCP, getTTFB };
