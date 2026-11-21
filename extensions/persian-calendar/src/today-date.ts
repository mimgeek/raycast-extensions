import { environment, getPreferenceValues, LaunchType, showHUD, updateCommandMetadata } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { faDigits, getIranToday, MONTH_NAMES, weekdayIndex, WEEKDAYS } from "./jalali";
import { getTodayWeather } from "./weather";

type Preferences = { weatherCity?: string };

export default async function Command() {
  try {
    const today = getIranToday();
    const weekday = WEEKDAYS[weekdayIndex(today.gy, today.gm, today.gd)];
    const dateText = `امروز ${weekday}، ${faDigits(today.jd)} ${MONTH_NAMES[today.jm - 1]} ${faDigits(today.jy)}`;

    // Preserve instant offline search and HUD behavior, even without weather.
    await updateCommandMetadata({ subtitle: dateText });
    if (environment.launchType === LaunchType.UserInitiated) {
      await showHUD(dateText);
    }

    // A manually configured city adds optional current weather to the search subtitle.
    // Never require network access to display the date.
    const city = getPreferenceValues<Preferences>().weatherCity?.trim();
    if (!city) return;

    try {
      const weather = await getTodayWeather(city);
      await updateCommandMetadata({
        subtitle: `${dateText} · ${weather.city}: ${weather.temperature}°C, ${weather.condition}`,
      });
    } catch (error) {
      // Weather must never break the date command or its background refresh.
      console.error("Could not refresh optional weather", error);
    }
  } catch (error) {
    if (environment.launchType === LaunchType.UserInitiated) {
      await showFailureToast(error, { title: "Could Not Show Today's Date" });
    } else {
      console.error("Could not refresh Persian date in the background", error);
    }
  }
}
