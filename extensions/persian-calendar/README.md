# Persian Calendar for Raycast

An offline-first Persian (Jalali) calendar with a clean monthly view and instant access to today's date, including the Persian weekday.

## Features

- **Monthly Persian Calendar:** Browse months in a seven-column Saturday–Friday grid. The design uses a restrained palette; teal marks today and warm gold marks Fridays.
- **Today's Date:** Search for `چندمه`, `امروز`, or `Today's Date` to see the full Persian date with weekday and Persian numerals in Raycast search.
- **Optional Today's Weather:** Enter a city in the Today's Date command preferences to append current conditions to the search subtitle. For example, `Tehran, Iran`. Weather is never shown on future calendar dates.
- **Offline Date Calculations:** Jalali dates work locally through `jalaali-js` without internet access.
- **Iran Timezone:** The Persian date is calculated using `Asia/Tehran` regardless of the PC's timezone.
- **Windows and macOS:** Both are supported.

## Commands

### Persian Calendar

Browse Jalali months, navigate using the Action Panel, inspect day details, and copy Persian or Gregorian dates.

### Today's Date

Search for `چندمه`, `امروز`, or `Today's Date`. The command immediately shows the Persian date and weekday in its subtitle. Launch it to see the date in a HUD.

Optionally set **Weather City** under Raycast Settings → Extensions → Persian Calendar → Today's Date. Specify a city and country for better location matching, e.g. `Tehran, Iran` or `London, United Kingdom`.

With a city configured, Raycast refreshes the current weather after the Persian date is already available and shows the city, temperature in °C, and condition in the search subtitle. Weather requests can take a moment and require internet access. If a city cannot be found or the service is unavailable, the Persian date remains available normally. The optional weather may be delayed until the next background refresh.

## Weather Data & Privacy

Weather uses [Open-Meteo](https://open-meteo.com/) and its [geocoding service](https://open-meteo.com/en/docs/geocoding-api). **Weather data by Open-Meteo.com**. Check its API licensing and attribution requirements for your intended use.

Only the manually entered city name is sent to Open-Meteo's geocoding endpoint, and the resulting coordinates are sent to its weather endpoint. The extension does not access your precise device location. Weather results are cached locally for 15 minutes to reduce requests.

The calendar and Today's Date are functional without configuring a city or having an internet connection.

## Technology

Raycast API, React, TypeScript, `jalaali-js`, and Open-Meteo for optional weather.

## License

MIT
