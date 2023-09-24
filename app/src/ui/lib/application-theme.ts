import {
  isMacOSMojaveOrLater,
  isWindows10And1809Preview17666OrLater,
} from '../../lib/get-os'
import { getBoolean } from '../../lib/local-storage'
import {
  setNativeThemeSource,
  shouldUseDarkColors,
  setFontFaceSource,
} from '../main-process-proxy'
import { ThemeSource } from './theme-source'

/**
 * A set of the user-selectable appearances (aka themes)
 */
export enum ApplicationTheme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export type ApplicableTheme = ApplicationTheme.Light | ApplicationTheme.Dark

/**
 * Gets the friendly name of an application theme for use
 * in persisting to storage and/or calculating the required
 * body class name to set in order to apply the theme.
 */
export function getThemeName(theme: ApplicationTheme): ThemeSource {
  switch (theme) {
    case ApplicationTheme.Light:
      return 'light'
    case ApplicationTheme.Dark:
      return 'dark'
    default:
      return 'system'
  }
}

// The key under which the decision to automatically switch the theme is persisted
// in localStorage.
const automaticallySwitchApplicationThemeKey = 'autoSwitchTheme'

/**
 * Function to preserve and convert legacy theme settings
 * should be removable after most users have upgraded to 2.7.0+
 */
function migrateAutomaticallySwitchSetting(): string | null {
  const automaticallySwitchApplicationTheme = getBoolean(
    automaticallySwitchApplicationThemeKey,
    false
  )

  localStorage.removeItem(automaticallySwitchApplicationThemeKey)

  if (automaticallySwitchApplicationTheme) {
    setPersistedTheme(ApplicationTheme.System)
    return 'system'
  }

  return null
}

// The key under which the currently selected theme is persisted
// in localStorage.
const applicationThemeKey = 'theme'

// The key under which the currently font face is persisted
// in localStorage.
const applicationFontFaceKey = 'font-face'

/**
 * Returns User's theme preference or 'system' if not set or parsable
 */
function getApplicationThemeSetting(): ApplicationTheme {
  const themeSetting = localStorage.getItem(applicationThemeKey)

  if (
    themeSetting === ApplicationTheme.Light ||
    themeSetting === ApplicationTheme.Dark
  ) {
    return themeSetting
  }

  return ApplicationTheme.System
}

/**
 * Load the name of the currently selected theme
 */
export async function getCurrentlyAppliedTheme(): Promise<ApplicableTheme> {
  return (await isDarkModeEnabled())
    ? ApplicationTheme.Dark
    : ApplicationTheme.Light
}

/**
 * Load the name of the currently selected theme
 */
export function getPersistedThemeName(): ApplicationTheme {
  if (migrateAutomaticallySwitchSetting() === 'system') {
    return ApplicationTheme.System
  }

  return getApplicationThemeSetting()
}

/**
 * Stores the given theme in the persistent store.
 */
export function setPersistedTheme(theme: ApplicationTheme): void {
  const themeName = getThemeName(theme)
  localStorage.setItem(applicationThemeKey, theme)
  setNativeThemeSource(themeName)
}

/**
 * Stores the given font face in the persistent store.
 */
export function setPersistedFontFace(fontFace: string): void {
  localStorage.setItem(applicationFontFaceKey, fontFace)
  setFontFaceSource(fontFace)
}

/**
 * Load the name of the currently selected font face
 */
export async function getPersistedFontFace(): Promise<string> {
  const fontFace = localStorage.getItem(applicationFontFaceKey);
  if (fontFace != null) {
    return fontFace;
  }
  else {
    return '"Helvetica Neue", Helvetica, Arial, sans-seri';
  }
}

/**
 * Whether or not the current OS supports System Theme Changes
 */
export function supportsSystemThemeChanges(): boolean {
  if (__DARWIN__) {
    return isMacOSMojaveOrLater()
  } else if (__WIN32__) {
    // Its technically possible this would still work on prior versions of Windows 10 but 1809
    // was released October 2nd, 2018 and the feature can just be "attained" by upgrading
    // See https://github.com/desktop/desktop/issues/9015 for more
    return isWindows10And1809Preview17666OrLater()
  } else {
    // enabling this for Linux users as an experiment to see if distributions
    // work with how Chromium detects theme changes
    return true
  }
}

function isDarkModeEnabled(): Promise<boolean> {
  return shouldUseDarkColors()
}
