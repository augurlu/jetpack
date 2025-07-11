# Changelog

## 4.1.4 - 2025-07-04
### Changed
- Update package dependencies. [#43425] [#43839]

### Fixed
- Autoloader: Prevent double slash in autoloader path. [#44030]
- Linting: Fix more Stylelint violations. [#43213]
- Linting: Remove outdated vendor prefixes in stylesheets. [#43219]

## 4.1.3 - 2025-04-17
### Changed
- Code: First pass of style coding standards. [#42734]

### Fixed
- Code: Update stylesheets to use hex instead of named colors. [#42920]
- Code: Update stylesheets to use WordPress font styles. [#42928]
- Ensure wpcomsh doesn't reactivate `jetpack/jetpack.php` when we've deactivated it in favor of `jetpack-dev/jetpack.php`. [#43135]
- Linting: Use double colon notation for pseudo-element selectors. [#43019]

## 4.1.2 - 2025-04-03
### Changed
- Code: Use function-style `exit()` and `die()` with a default status code of 0. [#41167]
- Update package dependencies. [#40515] [#40799] [#42180] [#42815]

## 4.1.1 - 2024-12-04
### Changed
- Admin menu: change order of Jetpack sub-menu items [#39095]
- Update dependencies. [#40286]
- Update package dependencies. [#38228] [#38822] [#39288] [#39653] [#40116]
- Use site url in email subject if the site title exists and is equale to "Site Title" [#38908]

### Fixed
- Fix an undefined variable reference. [#38247]
- Lossless image optimization of images in projects/plugins [subdirectories from a* through social] [#38573]

## 4.1.0 - 2024-07-02
### Added
- Hook into red bubble notification when bad installation is detected [#36449]
- Support testing mu-plugins (i.e. wpcomsh). [#37955]

### Changed
- General: use wp_admin_notice function introduced in WP 6.4 to display notices. [#37051]
- Only show installation errors on plugins page [#36390]
- Updated package dependencies. [#35591] [#36309] [#36775] [#37348] [#37767]

### Fixed
- Strip comments in markdown. [#38140]

## 4.0.0 - 2024-02-07
### Changed
- Code Modernization: Replace usage of substr() with str_starts_with() and str_ends_with(). [#34207]
- General: updated PHP requirement to PHP 7.0+ [#34126]
- Updated package dependencies.

## 3.1.6 - 2023-10-02
### Changed
- General: remove backwards-compatibility function checks now that the package supports WP 6.2. [#32772]
- Updated Jetpack submenu sort order so individual features are alpha-sorted. [#32958]
- Updated package dependencies. [#31308], [#32966], [#32307]

### Fixed
- Avoid deprecation warning in PHP 8.1 when viewing Beta settings screen. [#31295]
- If another PHP error handler was set, chain to it insead of calling PHP's default handler. [#32834]
- Use WordPress core's `Plugin_Upgrader` to install plugins, as it handles edge cases better. [#33216]

## 3.1.5 - 2023-04-27
### Security
- Disable HTML-style tags in the markdown renderer, the library used doesn't always handle them properly. [#30339]

### Changed
- Updated package dependencies. [#28910]

## 3.1.4 - 2023-01-11
### Changed
- Admin menu: ensure that the Jetpack Beta menu always lives under the main Jetpack menu.

## 3.1.3 - 2022-09-20
### Changed
- Renaming `master` references to `trunk` [#24712]
- Updated package dependencies.

## 3.1.2 - 2022-06-08
### Added
- Adding trunk branch cases in preparation for monorepo branch renaming
- Set `Update URI` in the plugin header.

### Changed
- PHPCS: Fix `WordPress.Security.ValidatedSanitizedInput`
- Updated package dependencies.

### Fixed
- Download from the correct URL when updating to a version tagged like "v3.1.1" rather than "3.1.1".
- Ensure that WP CLI is present before extending the class.
- Fixed testing tips links

## 3.1.1 - 2022-03-01
### Added
- Added docs to JS file.

### Changed
- Updated composer.lock

## 3.1.0 - 2021-12-08
### Added
- Added an action to auto-create a GitHub release when a version is tagged.
- Improved exception handling when network access to a8c servers is impaired.

### Changed
- Updated Beta release instructions to avoid extra MacOS files in the ZIP.
- Updated package dependencies

## 3.0.3 - 2021-10-06
### Changed
- Updated package dependencies.

### Fixed
- Remove unused variable in plugin-select.template.php.

## 3.0.2 - 2021-07-29
### Added
- Use WP core's ajax updater to apply updates.

### Fixed
- Detect when "Bleeding Edge" needs an update.
- Fix search when branch name contains multiple `-`.
- Guard against an undefined index warning.
- Typo fix.

## 3.0.1 - 2021-07-19
### Added
- Add small breadcrumb link to get back to the main plugin selection screen.

### Fixed
- Correctly handle self-autoupgrades when the release tag begins with "v".
- Fixes non-breaking JS errors.

## 3.0.0 - 2021-07-14
### Added
- Added support for more than just the Jetpack plugin. This involved a major code restructuring.
- Created a changelog from the git history with help from [auto-changelog](https://www.npmjs.com/package/auto-changelog). It could probably use cleanup!
- Provide a soft failure if activating an unbuilt development version of the Beta plugin.
- Testing Tips: Add tips to help testers get started.

### Changed
- Enable autotagger and update release instructions.
- Remove composer dev-monorepo hack.
- Update package dependencies.

### Removed
- Remove the `jetpack_autoload_dev` option and the `JETPACK_AUTOLOAD_DEV` constant update.

### Fixed
- Fix autoloader issue in prodution build.

## 2.4.6 - 2021-02-08

- Prevents updating stable version of Jetpack when using beta plugin in Docker instance.
- Fixes some errant copy appearing in the beta plugin welcome message.
- Sets the JETPACK_AUTOLOAD_DEV constant to true when a development version of Jetpack is activated.

## 2.4.5 - 2021-01-25

- Resolves a conflict between stable and beta Jetpack versions with the autoloader.

## 2.4.4 - 2021-01-05

- Avoids PHP notice for an unset array key if an option is not set.
- Updates the color to match the latest per the [Jetpack color guidelines](https://color-studio.blog).

## 2.4.3 - 2020-04-01

- Avoid Fatal errors when switching between branches that might be at different base version of the code.

## 2.4.2 - 2020-01-21

- Avoid Fatal errors; when Jetpack's vendor directory cannot be found, do not attempt to update.
