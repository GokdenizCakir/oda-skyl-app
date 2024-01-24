const { google } = require("googleapis");

import { getCredentials } from "@/app/_utils/credentials";
import { getGMT3Time, isEventOngoing } from "@/app/_utils/dates";

export async function GET() {
  const creds = await getCredentials();
  let ongoingEvents = [];

  if (creds) {
    try {
      const calendar = google.calendar({ version: "v3", auth: creds });
      const now = getGMT3Time().toISO();

      const response = await calendar.events.list({
        calendarId: process.env.CALENDAR_ID,
        timeMin: now,
        maxResults: 5,
        singleEvents: true,
        orderBy: "startTime",
      });

      ongoingEvents = response.data.items.filter(isEventOngoing);
      ongoingEvents.sort((a, b) => {
        const startA = a.start.dateTime || a.start.date;
        const startB = b.start.dateTime || b.start.date;
        return startA.localeCompare(startB);
      });
    } catch (error) {
      console.error("An error occurred:", error);
      return Response.json({ error: `An error occurred: ${error.message}` });
    }
  }

  return Response.json({ ongoing_events: ongoingEvents });
}
