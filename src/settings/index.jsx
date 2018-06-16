import { G_CALENDAR_CLIENT_ID, G_CALENDAR_CLIENT_SECRET } from "../common/config";

function mySettings(props) {
  return (
    <Page>
      <Section title={<Text>Authorisation</Text>}>
        <Oauth
          settingsKey="oauth"
          title="OAuth Login"
          label="Log in with Google Account"
          status={(props.settingsStorage.getItem('oauth_refresh_token') !== undefined) ? "Authorized" : "Unauthorized"}
          authorizeUrl="https://accounts.google.com/o/oauth2/v2/auth"
          requestTokenUrl="https://www.googleapis.com/oauth2/v4/token"
          clientId={G_CALENDAR_CLIENT_ID}
          clientSecret={G_CALENDAR_CLIENT_SECRET}
          scope="https://www.googleapis.com/auth/calendar.readonly"
          pkce
          oAuthParams={{access_type: 'offline', prompt : 'consent'}}
          onAccessToken={async (data) => {
            if (data.refresh_token !== undefined) {
              props.settingsStorage.setItem('oauth_refresh_token', data.refresh_token);
            }
            return data;
          }}
        />
        <Button
          label="Log out"
          onClick={() => {
            props.settingsStorage.removeItem("oauth_refresh_token");
            props.settingsStorage.removeItem("oauth");
          }}
        />
      </Section>
      <Section title="Options">
        <Toggle
          settingsKey="system_default_font"
          label="Enable East Asian language support"
        />
        <Toggle
          settingsKey="hide_countdown"
          label="Hide countdowns"
        />
        <Toggle
          settingsKey="countdown_second"
          label="Show seconds in countdown"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
