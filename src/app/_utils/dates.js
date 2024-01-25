const { DateTime } = require("luxon");

export const getGMT3Time = () => {
  return DateTime.now().setZone("Etc/GMT-3");
};

export const isEventOngoing = (event) => {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;

  const startTime = DateTime.fromISO(start, { zone: "Etc/GMT-3" });
  const endTime = DateTime.fromISO(end, { zone: "Etc/GMT-3" });

  const currentTime = getGMT3Time();
  const isOngoing = startTime < currentTime && currentTime <= endTime;

  return isOngoing;
};
