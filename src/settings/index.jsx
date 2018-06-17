import { G_CALENDAR_CLIENT_ID, G_CALENDAR_CLIENT_SECRET } from "../common/config";
import { _, setPrefLanguage } from "settingsLocale.js";

function mySettings(props) {
  let overrideLanguage = JSON.parse(props.settingsStorage.getItem("language_override"));
  setPrefLanguage(overrideLanguage && overrideLanguage.values[0].value);

  return (
    <Page>
      <Section title={_("authentication")}>
        <Oauth
          settingsKey="oauth"
          label={_("login_with_google")}
          status={(props.settingsStorage.getItem('oauth_refresh_token') !== undefined) ? _("authorized") : _("unauthorized")}
          authorizeUrl="https://accounts.google.com/o/oauth2/v2/auth"
          requestTokenUrl="https://www.googleapis.com/oauth2/v4/token"
          clientId={G_CALENDAR_CLIENT_ID}
          clientSecret={G_CALENDAR_CLIENT_SECRET}
          scope="https://www.googleapis.com/auth/calendar.readonly"
          pkce
          oAuthParams={{ access_type: 'offline', prompt: 'consent' }}
          onAccessToken={async (data) => {
            if (data.refresh_token !== undefined) {
              props.settingsStorage.setItem('oauth_refresh_token', data.refresh_token);
            }
            return data;
          }}
        />
        <Button
          label={_("log_out")}
          onClick={() => {
            props.settingsStorage.removeItem("oauth_refresh_token");
            props.settingsStorage.removeItem("oauth");
          }}
        />
      </Section>
      <Section title="Options">
        <Toggle
          settingsKey="system_default_font"
          label={_("system_default_font")}
        />
        <Toggle
          settingsKey="hide_countdown"
          label={_("hide_countdown")}
        />
        <Toggle
          settingsKey="countdown_second"
          label={_("countdown_second")}
        />
        <Select
          label={_("language_override")}
          settingsKey="language_override"
          selectViewTitle={_("select_language")}
          options={[
            { name: _("lang_default"), value: "default" },
            { name: _("lang_enUS"), value: "en-US" },
            { name: _("lang_jaJP"), value: "ja-JP" },
            { name: _("lang_zhCN"), value: "zh-CN" },
          ]}
        />
        <Text>{_("language_change_hint")}</Text>
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
