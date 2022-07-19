const nodeCron = require("node-cron");

/**
 * nodeCron.schedule(expression, function, options);
 */

nodeCron.schedule("* * * * *", () => {}, {
  timezone: "Europe/Zurich",
});
