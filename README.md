# Notice
This project is abandoned as my Versa was faulty and returned for a refund.

This project is forked by [@hjochman](https://github.com/hjochman) for [Caldav/iCal support](https://github.com/hjochman/fitbit-schedule). Other forks can be found [here](https://github.com/blueset/fitbit-schedule/network).

# Schedule

A schedule viewer for Fitbit OS 2.

## Install

1. Tap [here](https://gam.fitbit.com/gallery/app/38b688ed-0ff1-40cc-a906-5a9a50852740) to redirect to Fitbit App gallery. (Mobile only).
2. Log in to your Google account in the Schedule app settings.

## Features
- [x] Support Fitbit Versa and Fitbit Ionic.
- [x] Support Google Calendar
    - [x] Show multiple calendars together (only calendars turned on in Google Calendar settings are shown)
- [x] Color coded events
- [x] Detail page showing event title, time and location.
- [x] Countdown to the end of current event
- [x] Countdown to the start of next event
- [x] East Asian text support
- [x] On/Off switch for countdowns
- [x] Multilingual support (English (US), 简体中文（中国）, 日本語)

## Screenshots

| Versa | | |
| - | - | - |
| ![Screenshot 0](screenshots/Versa-0.png?raw=true) | ![Screenshot 1](screenshots/Versa-1.png?raw=true) | ![Screenshot 2](screenshots/Versa-2.png?raw=true) |
| ![Screenshot 3](screenshots/Versa-3.png?raw=true) | ![Screenshot 4](screenshots/Versa-4.png?raw=true) | |

| Ionic | |
| - | - |
| ![Screenshot 1](screenshots/Ionic-1.png?raw=true) | ![Screenshot 2](screenshots/Ionic-2.png?raw=true) |
| ![Screenshot 3](screenshots/Ionic-3.png?raw=true) | ![Screenshot 4](screenshots/Ionic-4.png?raw=true) |

## Usage
- Tap event block to show details
- Swipe to the right to show countdowns
- Tap the status bar to force refresh

To adjust 12h/24h settings, go to your Fitbit web profile page.

## Note

In 12h mode, `0:00` midnight is shown as `12:00m`, and `12:00` noon is shown as `12:00n`, other time is followed by `a` or `p` as normal.

## Plan
- [ ] Other calendar service support (Outlook, etc.)
- [ ] Theming

## Support me

If you like my apps, [buy me a cup of coffee](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ilove@1a23.com&item_name=Donation%20%28Schedule%20App%29) :)

Or if you want to help develop it, send a pull request!

## License

    Schedule, a schedule viewer for Fitbit OS 2.
    Copyright (C) 2018 Eana Hufwe

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
