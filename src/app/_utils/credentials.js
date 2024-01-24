const fs = require("fs");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

export const getCredentials = async () => {
  let creds = null;
  let tokenJson;
  const tokenJsonStr = process.env.TOKENS;

  if (tokenJsonStr) {
    tokenJson = JSON.parse(tokenJsonStr);
    creds = new google.auth.OAuth2();
    creds.setCredentials(tokenJson);
  }

  if (!creds || !creds.valid) {
    if (creds && creds.expired && creds.refreshToken) {
      creds.refreshAccessToken();
    } else {
      const flow = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
      );

      if (process.env.TOKEN == "") {
        const authUrl = flow.generateAuthUrl({
          access_type: "offline",
          scope: SCOPES,
        });
        console.log("Authorize this app by visiting this URL:", authUrl);
      }

      // const code = ""; // Enter the authorization code obtained from the user
      // const { tokens } = await flow.getToken(code);
      // console.log("It is the data you are going to add to the TOKENS in .env.local:     ", tokens);
      creds.setCredentials(JSON.parse(process.env.TOKENS));
    }

    const newTokenJson = JSON.stringify(creds.credentials);
    console.log("CREDENTIALS BUNLAR :     ", newTokenJson);
    fs.writeFileSync(
      ".env.local",
      `CLIENT_ID="${process.env.CLIENT_ID}"\nCALENDAR_ID="${process.env.CALENDAR_ID}"\nCLIENT_SECRET="${process.env.CLIENT_SECRET}"\nREDIRECT_URI="${process.env.REDIRECT_URI}"\nCODE="${process.env.CODE}"\nTOKENS='${newTokenJson}'`
    );
  }

  return creds;
};
