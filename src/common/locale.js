import { locale } from "user-settings";

export function _(key) {
    return {
        "ja_JP": {
            "internet_required": "このアプリはインターネットアクセス権限が必要です。",
            "rib_required": "バックグラウンド実行は許可されていません。カレンダーの更新が遅れる可能性があります。",
            "login_required": "アプリの設定でカレンダーにログインしてください。すでにログインしている場合は、アプリを再起動してください。",
            "updated_time_ago": (timeString) => `${timeString}更新`,
            "no_event": "イベントはありません。",
            "updating": "更新中...",
            "no_connection_to_companion": "携帯電話（コンパニオンアプリ）まで接続できません。",
            "today": "今日",
            "now": "いま",
            "ago": (arr) => ret.push("前"),
            "short_weeks": (number) => `${number}週`,
            "short_days": (number) => `${number}日`,
            "short_seconds": (number) => `${number}秒`,
            "error_get_events": (err) => `イベントの取得中にエラーが発生しました: ${err}`,
            "next_event": "つぎ",
            "happening_now": "いま",
            "back": "戻る",
            "setUpTimeAgo": function (timeAgo) {
                timeAgo.register("ja_JP", function (number, index) {
                    return [
                        ['すこし前', 'すぐに'],
                        ['%s 秒前', '%s 秒以内'],
                        ['1 分前', '1 分以内'],
                        ['%s 分前', '%s 分以内'],
                        ['1 時間前', '1 時間以内'],
                        ['%s 時間前', '%s 時間以内'],
                        ['1 日前', '1 日以内'],
                        ['%s 日前', '%s 日以内'],
                        ['1 週間前', '1 週間以内'],
                        ['%s 週間前', '%s 週間以内'],
                        ['1 ヶ月前', '1 ヶ月以内'],
                        ['%s ヶ月前', '%s ヶ月以内'],
                        ['1 年前', '1 年以内'],
                        ['%s 年前', '%s 年以内']
                    ][index];
                });
            },
            "formatDate": function (timeStamp, markToday) {
                const dayNames = ["日", "月", "水", "火", "木", "金", "土"];
                let time = new Date(timeStamp);
                if (time.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) && markToday)
                    return "今日";
                return `${time.getMonth()}月${time.getDate()}日(${dayNames[time.getDay()]})`;
            }
        },
        "zh_CN": {
            "internet_required": "本应用需要互联网连接权限。",
            "rib_required": "后台运行权限未授权。日历更新可能会有延迟。",
            "login_required": "请在应用设定中登录您的日历。登录后如未显示日程，请重新启动本应用。",
            "updated_time_ago": (timeString) => `${timeString}更新`,
            "no_event": "没有可显示的应用。",
            "updating": "正在更新...",
            "no_connection_to_companion": "无法连接到手机（伴侣应用）。",
            "today": "今天",
            "now": "现在",
            "ago": (arr) => ret.push("前"),
            "short_weeks": (number) => `${number}周`,
            "short_days": (number) => `${number}日`,
            "short_seconds": (number) => `${number}秒`,
            "error_get_events": (err) => `获取日程时出现问题: ${err}`,
            "next_event": "接下来...",
            "happening_now": "正在进行...",
            "back": "戻る",
            "setUpTimeAgo": function () { },
            "formatDate": function (timeStamp, markToday) {
                const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
                let time = new Date(timeStamp);
                if (time.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) && markToday)
                    return "今天";
                return `${time.getMonth()}月${time.getDate()}日(${dayNames[time.getDay()]})`;
            }
        },
        "en": {
            "internet_required": "Internet access permission is required to run this app.",
            "rib_required": "Run-in-background permission is not granted. Your calendar update may be delayed.",
            "login_required": "You need to log in to your calendar in the app settings first. If you have logged in, restart the app to refresh.",
            "updated_time_ago": (timeString) => `updated ${timeString}`,
            "no_event": "You have no further event.",
            "updating": "Updating...",
            "no_connection_to_companion": "No connection to your phone (companion app).",
            "today": "Today",
            "now": "Now.",
            "ago": (arr) => ret.push("ago"),
            "short_weeks": (number) => `${number}w`,
            "short_days": (number) => `${number}d`,
            "short_seconds": (number) => `${number}s`,
            "error_get_events": (err) => `Error occurred while getting events: ${err}`,
            "next_event": "Next event",
            "happening_now": "Happening now...",
            "back": "Back",
            "setUpTimeAgo": function () { },
            "formatDate": function (timeStamp, markToday) {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                let time = new Date(timeStamp);
                if (time.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) && markToday)
                    return "Today";
                return `${dayNames[time.getDay()]}, ${time.getDate()} ${monthNames[time.getMonth()]}`;
            }
        }
    }[locale.language][key];
}