const fs = require("fs").promises;
const { google } = require("googleapis");

export const getCredentials = async () => {
  const creds = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  creds.setCredentials(JSON.parse(process.env.TOKENS));

  // getInitialToken();

  const newTokenJson = JSON.stringify(creds.credentials);
  await fs.writeFile(
    ".env.local",
    `CLIENT_ID="${process.env.CLIENT_ID}"\nCALENDAR_ID="${process.env.CALENDAR_ID}"\nCLIENT_SECRET="${process.env.CLIENT_SECRET}"\nREDIRECT_URI="${process.env.REDIRECT_URI}"\nCODE="${process.env.CODE}"\nTOKENS='${newTokenJson}'`
  );

  return creds;
};

const getInitialToken = async () => {
  const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

  const flow = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  const authUrl = flow.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);

  const code = process.env.CODE;
  const { tokens } = await flow.getToken(code);

  console.log(
    "IT IS THE DATA YOU ARE GOING TO ADD TO THE TOKENS IN .ENV.LOCAL: ",
    tokens
  );
};
