# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.1] - 2025-06-05
### Changed
- Update package dependencies. [#43425]

### Fixed
- Code: Update stylesheets to use hex instead of named colors. [#42920]
- Code: Update stylesheets to use WordPress font styles. [#42928]
- Linting: Do additional stylesheet cleanup. [#43247]

## [2.2.0] - 2025-04-04
### Added
- Debug Helper: Add WordPress.com API request sending functionality to help testing specific requests manually. [#41154]

### Changed
- Code: Use function-style `exit()` and `die()` with a default status code of 0. [#41167]
- Update package dependencies. [#40515] [#40980] [#42180] [#42815]

### Fixed
- Code: Prevent dynamic class properties. [#41857]
- Code: Remove extra params on function calls. [#41263]

## [2.1.0] - 2024-12-04
### Added
- Add a button to clear IDC options. [#39283]
- Add Broken XMLRPC module. [#39261]
- Jetpack Debug: Extend Scan Helper to provide more functionality around creating different types of threats to test with. [#37990]

### Changed
- Scan Helper: Update fuzzy hash sample to be bigger in size. [#39750]
- Update package dependencies. [#37767] [#38228] [#38822] [#39288] [#39653] [#40116]

### Fixed
- Actually call `e.preventDefault()` in various 'click' handlers. [#39057]
- Fix WPCOM request counter for repeated requests. [#39219]

## [2.0.1] - 2024-05-20
### Changed
- General: Use wp_admin_notice function introduced in WP 6.4 to display notices. [#37051]
- Update package dependencies. [#35591] [#36309] [#36775] [#37348]

### Fixed
- REST API: Restrict access to authenticated site admins. [#36999]
- REST API: Add an exception for the new IDC REST endpoint. [#37024]

## [2.0.0] - 2024-02-07
### Added
- Add brute force protection access for particular environments that do not support the WAF [#31761]

### Changed
- Code Modernization: Replace usage of strpos() with str_contains() [#34137]
- Code Modernization: Replace usage of strpos() with str_starts_with(). [#34135]
- Comment: Added price as default sorting option for Jetpack Search [#35167]
- General: updated PHP requirement to PHP 7.0+ [#34126]
- Updated package dependencies.

### Fixed
- Fix PHP 8.2 deprecation warnings. [#32134]
- Resort to error_log if l() is not available [#34499]

## [1.6.0] - 2023-06-06
### Added
- Add a helper for the WAF
- Added a new WPCOM API Request Tracker module.
- Set custom tokens and blog ID.

### Changed
- Remove deprecated core function in favor of direct query.

### Fixed
- Fixed stylesheet loading and content for the broken-token and idc-simulator modules.

## [1.5.0] - 2023-03-08
### Added
- Add "Cookie State Faker" tool. [#28371]
- Add a button to set the current primary user. [#26562]
- Added a helper module for Jetpack Scan. [#25641]
- Added threat descriptions. [#25266]
- Mocker tool: add runner to add rows in the WAF log DB table for blocked requests [#25645]
- Replace "XML-RPC errors" with "connection errors", add error type ("xml-rpc" or "rest") to generated errors. [#25694]

### Changed
- Remove pre-defined prefix in the REST API tool. [#26521]
- Updated package dependencies.
- Updated Protect Helper to use newly added data source constant. [#26069]

### Fixed
- Prevented the threat tester from being identified as a threat due to containing the Akismet suspicious link URL. [#26192]

## [1.4.0] - 2022-07-06
### Added
- Added the Autoloader debugger helper to the Debug tool. [#23726]
- Add Protect helper module. [#24805]
- Debug helper plugin: add debug helper page for Jetpack modules. [#24456]

### Changed
- PHPCS: Fix `WordPress.Security.ValidatedSanitizedInput`. [#23942]
- Renaming master to trunk. [#24661]
- Updated package dependencies.

## [1.3.0] - 2022-03-01
### Added
- Add a Sync Data Settings page, which displays the data settings provided by each Sync data filter.
- IDC Simulator: Display an admin notice when the module disables Sync

### Changed
- Updated composer.lock file.
- Updated package dependencies

### Fixed
- Fixed minor coding standard violation.

## [1.2.0] - 2021-11-02
### Added
- Added an IDC simulator module to Debug Helper.
- Display the IDC option values (sync_error_idc, migrate_for_idc, and safe_mode_confirmed)
- IDC Simulator: Add a button that triggers an authenticated remote request
- IDC Simulator: add setting to enable and disable Sync
- IDC Simulator: display the last five remote requests
- IDC Simulatore: add the ability to spoof the home option value

### Changed
- Updated package dependencies.

### Removed
- Rmove the unusaed jetpack_idc_option transient from the UI

### Fixed
- Set `prefer-stable: true` in composer.json.

## [1.1.0] - 2021-08-26
### Added
- Broken Token: Add clear current user token functionality.
- Created a changelog from the git history with help from [auto-changelog](https://www.npmjs.com/package/auto-changelog). It could probably use cleanup!
- Display the registration nonce to test the endpoint `connection/register`.

### Changed
- Remove composer dev-monorepo hack.
- Update package dependencies.

## 1.0.1 - 2021-03-04

- Initial version.

[2.2.1]: https://github.com/Automattic/jetpack-debug-helper/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/Automattic/jetpack-debug-helper/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v1.6.0...v2.0.0
[1.6.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Automattic/jetpack-debug-helper/compare/v1.0.1...v1.1.0
