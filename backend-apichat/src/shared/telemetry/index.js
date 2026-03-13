import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de requests HTTP",
  labelNames: ["method", "route", "status_code"],
});

export function observeRequestDuration(req, res, next) {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: String(res.statusCode),
    });
  });

  next();
}