import os.path
from datetime import timezone, datetime, timedelta
from dateutil import parser  # Import dateutil.parser
from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from flask import Flask, render_template, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS
from dotenv import load_dotenv
import json


app = Flask(__name__)
CORS(app)
api = Api(app)

dotenv_path = 'oda-skyl-app\.env'

load_dotenv(dotenv_path)


# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

def get_credentials():
    creds = None
    token_json_str = os.getenv("TOKEN_JSON")

    if token_json_str:
        token_json = json.loads(token_json_str)
        creds = Credentials.from_authorized_user_info(token_json, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Update the token in the .env file
        with open(".env", "w") as env_file:
            env_file.write(f'TOKEN_JSON={json.dumps(creds.to_json())}')

    return creds


def datetimeformat(value, format='%d-%m-%Y %H:%M:%S'):
    if isinstance(value, datetime):
        return value.strftime(format)
    elif isinstance(value, str):
        return parser.parse(value).strftime(format)
    else:
        return ''

def get_gmt3_time():
    # Get the current time in GMT+3 timezone
    return datetime.now(timezone(timedelta(hours=3)))

def is_event_ongoing(event):
    # Check if the event is ongoing based on GMT+3 time
    start_time_str = event["start"].get("dateTime", event["start"].get("date"))
    end_time_str = event["end"].get("dateTime", event["end"].get("date"))
    
    # Parse event start and end times with explicit time zone information
    start_time = parser.isoparse(start_time_str).astimezone(timezone(timedelta(hours=3)))
    end_time = parser.isoparse(end_time_str).astimezone(timezone(timedelta(hours=3)))
    
    # Set the time zone for the current time to GMT+3
    current_time = get_gmt3_time()
    
    # Check if the current time is within the event's start and end time
    is_ongoing = start_time < current_time <= end_time
    
    # Print the result  
    
    return is_ongoing

class NextEventsResource(Resource):
    def get(self):
        creds = get_credentials()
        next_events = []

        if creds:
            try:
                service = build("calendar", "v3", credentials=creds)
                now = get_gmt3_time().isoformat()

                # Retrieve the next events for the day
                next_events_result = (
                    service.events()
                    .list(
                        calendarId="bc6edfd480bce7cd796fdc737fb81ea97053ac5d51208e1cff1f04bb46168f1b@group.calendar.google.com",
                        timeMin=now,
                        maxResults=10,  # Adjust as needed
                        singleEvents=True,
                        orderBy="startTime",
                    )
                    .execute()
                )

                if next_events_result:
                    next_events = next_events_result.get("items", [])
                    next_events = sorted(next_events, key=lambda event: event["start"].get("dateTime", event["start"].get("date")))

            except HttpError as error:
                return jsonify({"error": f"An error occurred: {error}"}), 500

        return jsonify({"next_events": next_events})

    
    
class OngoingEventsResource(Resource):
    def get(self):
        creds = get_credentials()
        ongoing_events = []

        if creds:
            try:
                service = build("calendar", "v3", credentials=creds)
                now = get_gmt3_time().isoformat()

                # Check for ongoing events
                ongoing_events_result = (
                    service.events()
                    .list(
                        calendarId="bc6edfd480bce7cd796fdc737fb81ea97053ac5d51208e1cff1f04bb46168f1b@group.calendar.google.com",
                        timeMin=now,
                        maxResults=5,
                        singleEvents=True,
                        orderBy="startTime",
                    )
                    .execute()
                )

                if ongoing_events_result:
                    ongoing_events = ongoing_events_result.get("items", [])
                    ongoing_events = [event for event in ongoing_events if is_event_ongoing(event)]
                    ongoing_events = sorted(ongoing_events, key=lambda event: event["start"].get("dateTime", event["start"].get("date")))

            except HttpError as error:
                return jsonify({"error": f"An error occurred: {error}"}), 500

        return jsonify({"ongoing_events": ongoing_events})

@app.route("/", methods=["GET", "POST"])
def index():
    creds = get_credentials()
    ongoing_events = []
    daily_events = []

    if creds:
        try:
            service = build("calendar", "v3", credentials=creds)
            now = get_gmt3_time().isoformat()

            # Check for ongoing events
            ongoing_events_result = (
                service.events()
                .list(
                    calendarId="bc6edfd480bce7cd796fdc737fb81ea97053ac5d51208e1cff1f04bb46168f1b@group.calendar.google.com",
                    timeMin=now,
                    maxResults=5,
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )
                
            
            if ongoing_events_result:
                ongoing_events = ongoing_events_result.get("items", [])
                ongoing_events = [event for event in ongoing_events if is_event_ongoing(event)]
                ongoing_events = sorted(ongoing_events, key=lambda event: event["start"].get("dateTime", event["start"].get("date")))
                

            # If no ongoing events, retrieve and print the next events for the day
            room_is_empty = not any(is_event_ongoing(event) for event in ongoing_events)
            

        except HttpError as error:
            print(f"An error occurred: {error}")

    return render_template("index.html", ongoing_events=ongoing_events, daily_events=daily_events, room_is_empty=room_is_empty)

app.jinja_env.filters['datetimeformat'] = datetimeformat
api.add_resource(OngoingEventsResource, '/api/ongoingevents')
api.add_resource(NextEventsResource, '/api/nextevents')

if __name__ == "__main__":
    app.run(debug=True)
