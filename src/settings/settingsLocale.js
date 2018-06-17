let prefLanguage = "en-US";
const defaultLanguage = "en-US";

const locale = {
    "en-US": {
        "authentication": "Authentication",
        "login_with_google": "Login with Google Account",
        "authorized": "Authorized",
        "unauthorized": "Unauthorized",
        "log_out": "Log out",
        "system_default_font": "Enable East Asian language support",
        "hide_countdown": "Hide countdowns",
        "countdown_second": "Show seconds in countdown",
        "language_override": "Preferred language",
        "lang_default": "Follow System Language",
        "lang_enUS": "English (US)",
        "lang_jaJP": "Japanese - 日本語",
        "lang_zhCN": "Simplified Chinese (China) - 简体中文 (中国)",
        "language_change_hint": "Change of language may not be applied complete before restarting the app.",
        "select_language": "Select a language",
    },
    "zh-CN": {
        "authentication": "登录",
        "login_with_google": "登录 Google 账号",
        "authorized": "已登录",
        "unauthorized": "未登录",
        "log_out": "登出",
        "system_default_font": "启用东亚语言支持",
        "hide_countdown": "隐藏倒计时",
        "countdown_second": "倒计时中显示秒数",
        "language_override": "语言 (Language)",
        "lang_default": "使用系统语言",
        "lang_enUS": "英语 (美国) - English (US)",
        "lang_jaJP": "日语 - 日本語",
        "lang_zhCN": "简体中文 (中国)",
        "language_change_hint": "语言变更将会在应用重启后生效。",
        "select_language": "选择语言",
    },
    "ja-JP": {
        "authentication": "アカウント",
        "login_with_google": "Google アカウントでログインする",
        "authorized": "ログイン済",
        "unauthorized": "未ログイン",
        "log_out": "ログアウト",
        "system_default_font": "東アジア言語サポート",
        "hide_countdown": "カウントダウンを非表示する",
        "countdown_second": "カウントダウンに秒数を表示する",
        "language_override": "言語 (Language)",
        "lang_default": "システム言語にする",
        "lang_enUS": "英語 (アメリカ)  - English (US)",
        "lang_jaJP": "日本語",
        "lang_zhCN": "簡体中国語 (中国) - 简体中文 (中国)",
        "language_change_hint": "言語変更を完全適用するには、アプリをリスタートしてください。",
        "select_language": "言語を選択する",
    }
};

let prefStr = {};
let defStr = locale[defaultLanguage];

export function setPrefLanguage(pref_language) {
    prefLanguage = pref_language;
    prefStr = locale[pref_language] || defStr;
}

export function _(key) {
    let str = prefStr[key] || defStr[key] || key;
    for (let i = 0; i < arguments.length - 1; i++) {
        str = str.replace(`{${i}}`, arguments[i + 1]);
    }
    return str;
}