# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - 2025-06-10
### Added
- Add more error logging. [#42959]
- Add My Jetpack tour. [#42880]
- Highlight search terms in returned search results. [#43110]

### Changed
- E2E Tests: Update config file encryption algorithm. [#43523]
- My Jetpack: Hide backup failure notice when backups are deactivated. [#43568]
- My Jetpack: Optimize the images for onboarding slider for faster page load. [#43473]
- My Jetpack: Update the onboarding UI, changing it to a single button. [#43203]
- Update package dependencies. [#43071] [#43085] [#43425] [#43839]

### Removed
- Classic Themes: Replace the Core Search widget instead of adding a new widget to the main sidebar. [#43450]
- General: Update minimum WordPress version to 6.7. [#43192]

### Fixed
- Address `body_class` filter fatal in older versions of the Blaskan theme. [#43797]
- Block editor: Fix layout issues with the Media Library modal buttons. [#43035]
- Linting: Fix more Stylelint violations. [#43213]
- Mitigate bug with certain P2 themes. [#43503]
- My Jetpack: Fix Onboarding UI responsiveness at 600px. [#43533]
- My Jetpack: Fix readability of license activation button on hover. [#43550]
- My Jetpack: Prevent social login from getting stuck when email input is not empty. [#43158]
- Protect against improper calls to `the_title()` filter. [#43511]

## [4.1.0] - 2025-04-04
### Added
- Add Account Protection initialization. [#40925]
- Connection: Disconnect all other users before disconnecting connection owner account. [#41923]
- Improve the onboarding experience of Jetpack guiding the users through a new onboarding process. [#42757]
- My Jetpack: Introduce a new onboarding screen to provide clear, step-by-step instructions for new users connecting to Jetpack. [#42523]

### Changed
- Code: Use function-style `exit()` and `die()` with a default status code of 0. [#41167]
- Connection: Allow pre-selected login providers. [#42662]
- Connection: Display connection status on Users page independent of the SSO module. [#41794]
- General: Indicate compatibility with WordPress 6.8. [#42701]
- Update composer.lock [#40863]
- Update package dependencies. [#40980] [#41659] [#42180] [#42815]
- Update the unowned section from a product grid to a product list [#41312]

### Fixed
- Search: Ensure the count of returned results is shown after searching. [#42570]

## [4.0.0] - 2025-01-10
### Added
- Enable test coverage. [#39961]
- My Jetpack: Update recommendations section in My Jetpack to include a slider interaction for the cards. [#39850]
- Search: Added ability to customize results. [#36378]

### Changed
- Classic Widget: Update asset enqueuing strategy to ensure compatibility with the Elementor plugin. [#39820]
- General: Indicate compatibility with the upcoming version of WordPress - 6.7. [#39786]
- Include `wp-polyfill` as a script dependency only when needed. [#39629]
- Resolve an issue where revoked licenses were incorrectly treated as unattached. This caused users to be redirected to the license activation page after site connection, even when unattached licenses were not valid for activation. [#40215]
- Social: Changed My Jetpack CTA for Social from "Learn more" to "Activate" [#40359]
- Updated dependencies. [#40286]
- Updated package dependencies. [#39288] [#39653] [#40116] [#40515] [#40693] [#40815]

### Removed
- Connection: Removed deprecated `features_available` method. [#39442]
- Connection: Removed deprecated `features_enabled` method. [#39475]
- General: Update minimum PHP version to 7.2. [#40147]
- General: Update minimum WordPress version to 6.6. [#40146]

### Fixed
- E2E Tests: Only install single browser used by Playwright. [#40827]
- My Jetpack: Update GlobalNotice component to look better on mobile. [#39537]

## [3.0.1] - 2024-09-06
### Changed
- Internal updates.

## [3.0.0] - 2024-09-05
### Changed
- General: Update WordPress version requirements to WordPress 6.5 and indicate compatibility with WordPress 6.6. [#38382]

## [2.1.0] - 2024-05-23
### Added
- Trigger a red bubble notification when bad plugin install is detected. [#36449]

### Changed
- Update WordPRess tested version to 6.5. [#35820]
- Update minimum WordPress version requirement to WordPress 6.4. [#37047]
- Only show installation errors on the plugins page. [#36390]
- Show My Jetpack link on the plugins page even if the plugin is not installed. [#35523]

## [2.0.0] - 2024-02-07
### Added
- Allow users to select price as default sorting option for search [#35167]
- Implemented a "tabbed" variation for static filters. This adds tabs on top of the results for each filter group. [#29811]

### Changed
- General: indicate full compatibility with the latest version of WordPress, 6.4. [#33776]
- General: update WordPress version requirements to WordPress 6.3. [#34127]
- General: updated PHP requirement to PHP 7.0+ [#34126]

## [1.4.1] - 2023-03-08
### Changed
- Remove `ci.targets` from package.json. Better scoping of e2e tests. [#28913]
- Update playwright dependency. [#28094]
- Updated package dependencies.

## [1.4.0] - 2022-12-12
### Added
- Search: port Search plugin 1.3.1 changelog and plugin description [#27399]

### Changed
- My Jetpack: Requires connection only if needed [#27615]
- My Jetpack: Show My Jetpack even if site is disconnected [#26967]
- Updated package dependencies. [#26069]

### Fixed
- Search: Fixed E2E testing failures after adding a checkmark icon for resolved topics [#27586]
- Search: fixed search E2E failure after the new pricing update [#27430]

## [1.3.1] - 2022-11-13
### Fixed
- Fixed readme and descriptions for Free tier support and new pricing [#27341]

## [1.3.0] - 2022-11-10
### Added
- Enable stats tracking upon establishing a site connection. [#26697]
- Search: add post type breakdown endpoint. [#26463]
- Search Dashboard: Add support link for plan limits. [#26694]
- Search Dashboard: Add support for conditional CUTs. [#26656]
- Search: enable new pricing if pricing_version is set to 202208 from API. [#26900]
- Search: add blog ID filtering and `blogIdFilteringLabels` option. [#27120]

### Changed
- Compatibility: WordPress 6.1 compatibility. [#27084]
- Ported back 1.2.0 release changelog. [#26079]
- Search: now support 38 languages. [#27025]
- Introduce PricingTable to update Upsell page. [#26408]
- Updated package dependencies. [#27283]
- Search: always add Search Dashboard page even when submenu is hidden. [#26807]
- Hide Jetpack logo toggle, enforce display for free plans. [#26951]
- Search: add purchase tracking. [#26981]

### Fixed
- Fixes the issue where search results are not loaded in customizer. [#26212]
- Fix error message styling in Instant Search overlay. [#26339]
- Search: wpcom sites should not be considered as connected. [#26835]
- Search: hide meters etc for Classic Search. [#27073]

### Other changes <!-- Non-user-facing changes go here. This section will not be copied to readme.txt. -->
- Adds ability to autotag, autorelease and autopublish releases. [#26156]
- E2E tests: use CI build artifacts in e2e tests. [#26278]
- Search: start v1.3.0-alpha release cycle. [#25854]
- E2E tests: removed deprecated Slack notification code. [#26215]

## [1.2.0] - 2022-09-05
### Added
- Instant Search: add author filtering support.
- Instant Search: add descriptions to post type icons for accessibility purposes.
- Instant Search: add focus border to search input field.
- Instant Search: always use submit overlay trigger if user prefers reduced motion.
- Instant Search: only show animation to users who have not chosen reduced motion.
- Instant Search: user friendly error messaging.
- My Jetpack: include JITMs.
- Record Meter: adds info link to docs.
- Search: add links to Search plugin line on plugins page.

### Changed
- Instant Search: updates dark mode active link color for increased contrast.
- Search: always show Search submenu when Search plugin is installed.
- Search: changed default overlay trigger to form submission.
- Search: changed to only require site level connection.
- Search: only redirect when activating from the Plugins page in the browser.
- Search: revert "Search should not require user connection".
- Updated package dependencies.

### Removed
- Search: remove 'results' overlay trigger.

### Fixed
- Dashboard: updated Instant Search description to match changes in default overlay trigger.
- Instant Search: add focus styles for easier keyboard navigation.
- Instant Search: constrain tab loop to overlay when visible.
- Instant Search: fix button styling in Twenty Twenty One theme.
- Instant Search: fix the display order on mobile to match the tab order.
- Instant Search: make "Clear filters" button accessible.
- Instant Search: remove redundant links from search results.
- Instant Search: use classname rather than ID for styling sort select.
- Search Widget: keep widget preview with settings.

## [1.1.0] - 2022-08-02
### Added
- Dashboard: new Record Meter feature to show the breakdown of records in your search index.

### Fixed
- Customization: fix fill color for gridicons in dark mode.
- Customization: hide unsupported taxonomies from Search widget.
- Customization: re-enable auto-collapsing sidebar in Customberg.
- Dashboard: fix currency code in upsell page.
- Dashboard: fix pricing issue before site is connected to Jetpack.
- Dashboard: minor CSS changes for Hello Dolly compatibility.
- Instant Search: avoid search query on component mount.
- Instant Search: consistent design for focus states in Search overlay.
- Instant Search: don't open modal if only sort parameter is set.
- Instant Search: fix header letter spacing in modal.
- Instant Search: fix irrelevant widgets added to sidebar during auto config.
- Instant Search: fix keyboard handling on search options.
- Instant Search: prevent hidden submit button appearing on focus.
- Instant Search: restore support for filtering by multiple post types with post_type=.
- Search: redirect to the Search Dashboard on activation only when Jetpack plugin does not exist.

## 1.0.0 - 2022-05-30
### Added
- Initial release.

[1.1.0-beta]: https://github.com/Automattic/jetpack-search-plugin/compare/1.0.0...1.1.0-beta
[1.2.0-beta]: https://github.com/Automattic/jetpack-search-plugin/compare/1.1.0...1.2.0-beta
[5.0.0]: https://github.com/Automattic/jetpack-search-plugin/compare/4.1.0...5.0.0
[4.1.0]: https://github.com/Automattic/jetpack-search-plugin/compare/4.0.0...4.1.0
[4.0.0]: https://github.com/Automattic/jetpack-search-plugin/compare/3.0.1...4.0.0
[3.0.1]: https://github.com/Automattic/jetpack-search-plugin/compare/3.0.0...3.0.1
[3.0.0]: https://github.com/Automattic/jetpack-search-plugin/compare/2.1.0...3.0.0
[2.1.0]: https://github.com/Automattic/jetpack-search-plugin/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/Automattic/jetpack-search-plugin/compare/1.4.1...2.0.0
[1.4.1]: https://github.com/Automattic/jetpack-search-plugin/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/Automattic/jetpack-search-plugin/compare/1.3.1...1.4.0
[1.3.1]: https://github.com/Automattic/jetpack-search-plugin/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/Automattic/jetpack-search-plugin/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/Automattic/jetpack-search-plugin/compare/1.2.0-beta...1.2.0
[1.1.0]: https://github.com/Automattic/jetpack-search-plugin/compare/1.1.0-beta...1.1.0
