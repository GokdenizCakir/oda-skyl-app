import { getCredentials } from "@/app/_utils/credentials";
import { getGMT3Time } from "@/app/_utils/dates";

const { google } = require("googleapis");

export async function GET() {
  const creds = await getCredentials();
  let nextEvents = [];

  if (creds) {
    try {
      const calendar = google.calendar({ version: "v3", auth: creds });
      const now = getGMT3Time().toISO();

      const response = await calendar.events.list({
        calendarId: process.env.CALENDAR_ID,
        timeMin: now,
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });

      nextEvents = response.data.items;
      nextEvents.sort((a, b) => {
        const startA = a.start.dateTime || a.start.date;
        const startB = b.start.dateTime || b.start.date;
        return startA.localeCompare(startB);
      });
    } catch (error) {
      console.error("An error occurred:", error);
      return Response.json({ error: `An error occurred: ${error.message}` });
    }
  }

  return Response.json({ next_events: nextEvents });
}
