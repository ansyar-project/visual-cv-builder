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
      .then(({ getCLS }) => {
        getCLS(onPerfEntry);
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
      .then(({ getFID }) => {
        getFID(onPerfEntry);
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
      .then(({ getFCP }) => {
        getFCP(onPerfEntry);
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
      .then(({ getLCP }) => {
        getLCP(onPerfEntry);
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
      .then(({ getTTFB }) => {
        getTTFB(onPerfEntry);
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
