# Development Environment

## Table of contents

- [Setting up your environment](#setting-up-your-environment)
	- [Overview](#overview)
	- [Running Jetpack locally](#running-jetpack-locally)
		- [Docker (Supported Recommended)](#docker-supported-recommended)
		- [VVV](#vvv)
		- [Local web and database servers](#local-web-and-database-servers)
		- [Developing and contributing code to Jetpack from a Windows machine](#developing-and-contributing-code-to-jetpack-from-a-windows-machine)
	- [Get started with development](#get-started-with-development)
		- [Clone the repository](#clone-the-repository)
		- [Install development tools](#install-development-tools)
			- [Node.js](#nodejs)
			- [Pnpm](#pnpm)
			- [PHP](#php)
			- [Composer](#composer)
			- [jetpack CLI](#jetpack-cli)
		- [Check if your environment is ready for Jetpack development](#check-if-your-environment-is-ready-for-jetpack-development)
		- [Testing Jetpack cloud features](#testing-jetpack-cloud-features)
- [Development workflow](#development-workflow)
	- [Building your project](#building-your-project)
		- [Syncing local changes with Unison](#syncing-local-changes-with-unison)
			- [Installing Unison](#installing-unison)
			- [Configuring Unison](#configuring-unison)
			- [Running Unison](#running-unison)
- [Unit-testing](#unit-testing)
	- [PHP unit tests](#php-unit-tests)
	- [JavaScript unit tests](#javascript-unit-tests)
- [Good code - linting, standards, compatibility, etc.](#good-code---linting-standards-compatibility-etc)
	- [Coding standards](#coding-standards)
	- [Linting](#linting)
- [Standard development \& debugging tools](#standard-development--debugging-tools)

# Setting up your environment

## Overview

In order to start developing the Jetpack plugin you want to have access to a WordPress installation where you can install the plugin and work on it.

To do that you need to set up a WordPress site and give it the ability to run your local build of the Jetpack plugin code repository.

There are several ways to achieve this, listed in the next section.

## Running Jetpack locally

To get a local WordPress site up and running you need a web server (Apache, Nginx), PHP and MySQL (or MariaDB).

**Important:** Docker is the only solution that we recommend and can provide support for. The others are listed here as reference if you want to try something different. We won't be able to provide support for them

* ### Docker (Supported Recommended)

	This would be the easiest and most straight-forward way to start your journey in Jetpack development. Docker offers a containerized install of WordPress with all of its dependencies installed and set up. You just need to start working on the plugin code.

	To set up your environment with Docker, follow the [Docker environment for Jetpack Development guide](../tools/docker/README.md).

* ### VVV

	VVV is similar to Docker in how it works, but instead of setting up separate containers for the different parts it uses a single Linux virtual machine to set everything up with a nice interface.

	You can read up more about setting up VVV on [the project's official page](https://varyingvagrantvagrants.org/).

* ### Local web and database servers

	This is the most involved set up way among the three. Since the installation steps are very dependent on the operating system and it's flavor, we're not going to cover them here for the time being. You can refer to the [WordPress recommended system requirements](https://wordpress.org/about/requirements/) to see what you need to install to get WordPress up and running on your system.

* ### Developing and contributing code to Jetpack from a Windows machine

	When working on a Windows machine, you will need to use [Windows Subsystem for Linux version 2](https://docs.microsoft.com/en-us/windows/wsl/install). If you are currently using WSL version 1, you will need to update to version 2 first.

	If you use VS Code, you can use [their Remote Development extension pack](https://code.visualstudio.com/docs/remote/wsl) to develop in WSL.

	You may, however, run into issues when you want to commit your changes. In this case, and if you use an IDE like PHPStorm, you can follow the recommendations in [this post](https://alex.blog/2018/02/21/guide-to-having-phpstorm-use-windows-subsystem-for-linux-git/) to have PhpStorm Use Windows Subsystem For Linux’s Git.

## Get started with development

Here are the different steps you must follow to set up your Jetpack development environment:

1. [Clone the repository](#clone-the-repository)
2. [Install development tools](#install-development-tools)
3. [Check if your environment is ready for Jetpack development](#check-if-your-environment-is-ready-for-jetpack-development)

### Clone the repository

Before you get started, we recommend that you set up a public SSH key setup with GitHub, which is more secure than saving your GitHub credentials in your keychain. There are more details about [setting up a public key on GitHub.com](https://help.github.com/en/articles/adding-a-new-ssh-key-to-your-github-account).

Fork this repository to your own GitHub account and clone it to your local machine, as explained [in this guide](https://guides.github.com/activities/forking/). **If you are an Automattician, you can clone the repository directly.**

If you use [our Docker setup](../tools/docker/README.md), you can now move on to the next step. 

If you are not using a Docker setup, you'll first need to create symlinks from the plugin directory in your local installation of WordPress to each of the plugins' directories in the monorepo (under `projects/plugins/`).

Note that the Monorepo should not be cloned into the WordPress plugins directory (you will see a warning on your plugins page in that case saying that the Jetpack Monorepo is not a plugin and shouldn't be installed as one). 

### Install development tools

You'll need all the tools below to work in the Jetpack monorepo.

* #### Node.js

	Node.js is used in the build process of some of our tools. If it's not already installed on your system, you can [visit the Node.js website and install the latest Long Term Support (LTS) version](https://nodejs.org/).

	You'll find the minimum required version in the [engines section](https://github.com/Automattic/jetpack/blob/trunk/package.json#L36) of package.json.

	We recommend usage of [nvm](https://github.com/nvm-sh/nvm/) for managing different Node versions on the same environment.

* #### Pnpm

	Pnpm is a Node.js package manager and it's used to install packages that are required to run development tools and build projects. To install it, either run `npm install -g pnpm` or you can [visit the Installation page of the project](https://pnpm.io/installation) for other methods.

	You'll find the minimum required version in the [engines section](https://github.com/Automattic/jetpack/blob/trunk/package.json#L36) of package.json.

* #### PHP

	PHP is a popular general-purpose scripting language that is especially suited to web development and it's at the core of the WordPress ecosystem.

	If you use [our Docker setup](../tools/docker/README.md), PHP will be available to you in the container.

	If you use a different setup, you'll need to install PHP on your operating system. As it's very dependent on your operating system and its flavor, we're not going to cover it in this document at this time. You can check out the [official installation instructions from the project website](https://www.php.net/manual/en/install.php).

* #### Composer

	Composer is a PHP package manager and it's used to install packages that are required to run development tools and build projects.

	The monorepo requires version 2.3.x.

	 * ##### Installing Composer on macOS

		Composer can be installed using [Homebrew](https://brew.sh/). If you don't have Homebrew, install it with

		```sh
		bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
		```

		And then install Composer:

		```sh
		brew install composer
		```

	 * ##### Installing Composer on other systems

		We recommend visiting the [official Composer download instructions](https://getcomposer.org/download/) to install composer on other operating systems.

		Most Linux distributions may have an older version of Composer as an installable package, but installing from the official source ensures you have the most up to date version.
		Note that [we recommend using the Windows Subsystem for Linux](#developing-and-contributing-code-to-jetpack-from-a-windows-machine) to run Composer and PHP.

* #### jetpack CLI

	The `jetpack` CLI tool is used to help with development in the Jetpack monorepo. Find out more and install it by following the instructions on the [Jetpack CLI page](https://github.com/Automattic/jetpack/blob/trunk/tools/cli/README.md).

### Check if your environment is ready for Jetpack development

We provide a script to help you in assessing if everything's ready on your system to contribute to Jetpack.

```sh
tools/check-development-environment.sh
```

Running the script will tell you if you have your environment already set up and what you need to do in order to get it ready for Jetpack development.

If you're ready to start, you should see all green `SUCCESS` messages. If the script detect issues, you will see a red `FAILED` note and a link that will help you figure out what you need to change/fix to address the issue.

Once you're all set here, you can continue developing. If you're setting up an local environment and want to start testing immediately, please ensure you build the projects you need.

`jetpack build` will provide prompts to determine the project you need or you can pass it a complete command, like `jetpack build plugins/jetpack --deps`

### Testing Jetpack cloud features

In order to test features that require a WordPress.com connection and other network related Jetpack features, you'll need a test site that can create local HTTP tunnels.

If you're an Automattician, we recommend using [Jurassic Tube](./quick-start.md#setting-up-jurassic-tube).

For other methods, check out [ngrok](../tools/docker/README.md#using-ngrok-with-jetpack) or [another similar service](https://alternativeto.net/software/ngrok/).

# Development workflow

Once you have a local copy of Jetpack and all development tools installed, you can start developing.

1. Make sure the plugin you're developing is activated on your WordPress site.
2. [Build your project](#building-your-project)
3. Access the plugin's dashboard in your browser.

## Building your project

The Jetpack monorepo is home to different projects, with different needs. Some require that you build PHP, JavaScript, and CSS components. [The Jetpack CLI tool](https://github.com/Automattic/jetpack/blob/trunk/tools/cli/README.md) will help you with all building steps.

There are different types of builds:

* ### Development build
	A standard development build will create un-minified versions of the JavaScript and CSS files. To build a project, run:

	```sh
	jetpack build
	```

	The Jetpack CLI tool will then guide you so you can build the project you are interested in.

* ### Continuous Development build
	By default the development build above will run once and if you change any of the files, you need to run `jetpack build` again to see the changes on the site. If you want to avoid that, you can run a continuous build that will rebuild anytime it sees any changes on your local filesystem. To run it, use:

	```sh
	jetpack watch
	```

* ### Draft Mode
	This is an experimental feature as of August 2021.

	Are pre-commit and pre-push hooks slowing down a major refactor or draft PR? Run `jetpack draft enable` to make them less aggressive (they will still run, but won't block for warnings), and `jetpack draft disable` when you're ready for them again.

### Syncing local changes with Unison
  
  In some cases, you may need to test Jetpack (jetpack-mu-wpcom, in particular) changes by syncing your changes to another machine (rather than using Docker). This outlines a strategy for syncing changes in real-time using the [Unison](https://github.com/bcpierce00/unison) file sync tool combined with the [unison-fsmonitor](https://github.com/benesch/unison-fsmonitor) (Note that unison-fsmonitor is OSX-only).

  This approach may be especially useful for Automatticians who are testing changes on their WordPress.com sandbox. Using Unison can be more continuous than rsync (or `jetpack rsync`).

  #### Installing Unison

  Please see the respective [Unison](https://github.com/bcpierce00/unison) and [unison-fsmonitor](https://github.com/benesch/unison-fsmonitor) repositories for full installation instructions. 

  On OSX, you can use [Homebrew](https://brew.sh/) to quickly install both tools:

  - `brew install unison autozimu/formulas/unison-fsmonitor`

  #### Configuring Unison

  Once Unison is installed, you'll want to create a preferences file. On OSX/Linux, that preferences file would be placed in `~/.unison` and could be called something like `jetpack-plugin-sync.prf`. See the Unison documentation for instructions for other platforms.

  The built-in Unison help documentation may be useful:

  - unison -doc tutorial | less
  - unison -doc basics | less
  - unison -doc running | less
  
  Here is a [sample preferences file](examples/unison-sample.prf). Please note that this example preferences file is set to _always_ prefer local changes over remote changes. You'll need to adjust the file if you require a two-way sync instead. See the Unison documentation (or run `unison -doc running | less`) for full configuration details.

  #### Running Unison

  Once your preference file is configured, you can simply run something like the following in a terminal:

  ```
  unison -ui text -repeat watch jetpack-plugin-sync
  ```

  Unison will watch for any local changes to the Jetpack files and sync them to your remote host.
  
  * For more advanced configuration when working on WordPress.com, see the [advanced unison configuration](unison-wordpress-com.md).
---

# Unit-testing


The Jetpack plugin includes several [unit tests](https://github.com/Automattic/jetpack/tree/trunk/projects/plugins/jetpack/tests) that you can run in your local environment before submitting a new Pull Request.

If you're not familiar with PHP Unit Testing, you can also check [this tutorial](https://pippinsplugins.com/series/unit-tests-wordpress-plugins/)

To get started, there are several ways to run the unit tests, depending on how you set up your development environment.

## PHP unit tests

* ### Docker

	To run the PHP unit tests for Jetpack if you're running Docker, you can run the following:

	```sh
	jetpack docker phpunit jetpack
	```

	This will run unit tests for Jetpack. You can pass arguments to phpunit like so:

	```sh
	jetpack docker phpunit jetpack -- --filter=Protect
	```

	This command runs the tests as a multi site install

	```sh
	jetpack docker phpunit jp-multisite -- --filter=Protect
	```

	To run tests for specific packages, you can run the tests locally. The most straightforward way is to use `jetpack test`, for example
	```sh
	jetpack test -v php packages/assets
	```
	or you can usually run them manually like
	```sh
	cd projects/packages/assets
	composer phpunit
	```

	If you want to run a package's tests inside the Docker environment, you can get a shell inside the Docker environment with `jetpack docker sh` and then
	```sh
	cd /usr/local/src/jetpack-monorepo/
	pnpm jetpack test -v php packages/assets
	```
	or
	```sh
	cd /usr/local/src/jetpack-monorepo/projects/packages/assets
	composer phpunit
	```

* ### VVV & Local Installs

	If you are running a recent version of [VVV](https://github.com/Varying-Vagrant-Vagrants/VVV) then Jetpack will automatically detect your wordpress-develop install and you can just run `phpunit` directly.

	Otherwise you'll need to manually install the `wordpress-develop` branch, as follows:

	```sh
	svn co https://develop.svn.wordpress.org/trunk/ /tmp/wordpress-develop
	cd /tmp/wordpress-develop
	cp wp-tests-config-sample.php wp-tests-config.php
	```

	Set the database information for your testing DB in the file `/tmp/wordpress-develop/wp-tests-config.php`. You may need to create this database.

	To run tests on your machine, you can run `phpunit` while in the Jetpack directory.

	To run WooCommerce integration tests, you'll need the WooCommerce plugin installed alongside Jetpack (in `../woocommerce`), and you can run:

	```sh
	JETPACK_TEST_WOOCOMMERCE=1 phpunit
	```

	To run multisite tests, run:

	```sh
	phpunit -c tests/php.multisite.${PHPUNIT_MAJOR_VERSION}.xml
	```

	To filter and run just a particular test, you can run:

	```sh
	phpunit --filter my_test_name
	```

## JavaScript unit tests

The `jetpack test` command can be used from the monorepo's root to run a specific project's tests.

This may be of limited benefit locally during development since it isn't possible to use watch mode or run tests only for an individual file.

Each project within the monorepo may also have its own test commands, so an alternative is to `cd` into the project's root, and run the test commands from there.

### Packages

Packages may have a package.json in the root that has a `scripts` entry, and this details the different types of test commands that can be run, `pnpm test` is the usual command for JavaScript unit tests.

For example, to run an individual test file in watch mode:
```sh
cd projects/packages/forms
pnpm test --watch -- path/to/test/file.js
```

### Jetpack Plugin

The Jetpack plugin project also has some additional test commands that can be run from its root.

#### Admin Page unit tests

Tests for the Jetpack dashboard and settings pages can be run using the following command:

```sh
cd projects/plugins/jetpack
pnpm test-adminpage
```

This runs both the `client` (stores and other business logic) and `gui` (react component) tests, but they can also be run individually using `pnpm test-client` or `pnpm test-gui`.

You can also run only tests that match a specific pattern. To do that, use the argument `-g, --grep <pattern>`:

```sh
pnpm test-gui -g 'my custom pattern to filter tests'
```

To use a custom reporter, pass the argument `-R, --reporter <name>`:

```sh
pnpm test-client -R 'my_reporter'
```

#### Extension unit tests

Tests for editor extensions (including blocks, sidebars and more) can be run using the following command:

```sh
cd projects/plugins/jetpack
pnpm test-extensions
```

# Good code - linting, standards, compatibility, etc.

## Coding standards

We strongly recommend that you install tools to review your code in your IDE. It will make it easier for you to notice any missing documentation or coding standards you should respect. Most IDEs display warnings and notices inside the editor, making it even easier.

- Jetpack's custom Code Sniffer ruleset is located at `./projects/packages/codesniffer/Jetpack/ruleset.xml`. Depending on your IDE, you can use this path or you may need to use `.phpcs.xml.dist` in the monorepo root.
- For JavaScript, we recommend installing ESLint. Most IDEs come with an ESLint plugin that you can use. Jetpack includes a `eslint.config.mjs` file that defines our coding standards.

## Linting

* ### Linting Jetpack's PHP code

	You can easily run these commands to set up all the rulesets and then lint Jetpack's PHP code. You need Composer to run this tool so check how to [install Composer](#composer) if you don't have it yet.

	This will install all the CodeSniffer rulesets we need for linting Jetpack's PHP code. You may need to do this only once.

	```sh
	composer install
	```

	This runs the actual linting task.

	```sh
	composer phpcs:lint
	```

* ### Checking Jetpack's PHP for compatibility with different versions of PHP

	We have a handy `composer` script that will just run the PHP CodeSniffer `PHPCompatibilityWP` ruleset checking for code not compatible with supported PHP versions:

	```sh
	composer phpcs:compatibility
	```

* ### Linting Jetpack's JavaScript

	`pnpm lint` will check syntax and style in the following JavaScript pieces:

	* All the front end JavaScript that Jetpack relies on.
	* All the JavaScript present in the Admin Page Single Page App for Jetpack.

	```sh
	pnpm lint
	```

	_If you haven't done it yet, you may need to run `pnpm install` before `pnpm lint` for installing node modules for this task_.

---

# Standard development & debugging tools

* ### WP_DEBUG

	You should do all Jetpack development with `define( 'WP_DEBUG', true );` in your `wp-config.php`, making sure that you’re not generating any Notices or other PHP issues in your error_log.

* ### SCRIPT_DEBUG

	By default, WordPress loads minified versions of Jetpack's JS files. If you want to work with them, add `define( 'SCRIPT_DEBUG', true );` in your `wp-config.php`. This tells WordPress to load the non-minified JS version, allowing you to see your changes on page refresh. This applies to the JS files outside of `_inc/client/` and `extensions/`.

* ### WP-CLI

	Jetpack CLI is a command line interface for Jetpack, extending off of WP-CLI for WordPress. You can easily modify your installation of Jetpack with a just a few simple commands. All you need is SSH access and a basic understanding of command line tools.

	Usage:

	* `wp jetpack status [<full>]`
	* `wp jetpack module <list|activate|deactivate|toggle> [<module_name>]`
	* `wp jetpack options <list|get|delete|update> [<option_name>] [<option_value>]`
	* `wp jetpack protect <allow> [<ip|ip_low-ip_high|list|clear>]`
	* `wp jetpack reset <modules|options>`
	* `wp jetpack disconnect <blog|user> [<user_identifier>]`
	* `wp jetpack status`
	* `wp jetpack status [<full>]`

	More info can be found in [our support documentation](https://jetpack.com/support/jetpack-cli/).

* ### JETPACK_DEV_DEBUG

	`JETPACK_DEV_DEBUG` constant can be used to enable offline mode in Jetpack. Add `define( 'JETPACK_DEV_DEBUG', true );` in your `wp-config.php` to enable it. With Offline Mode, features that do not require a connection to WordPress.com servers can be activated on a local WordPress installation for testing.

	Offline mode automatically gets enabled if you don’t have a period in your site’s hostname, i.e. localhost. If you use a different URL, such as mycooltestsite.local, then you will need to define the `JETPACK_DEV_DEBUG` constant.

	You can also enable Jetpack’s offline mode through a plugin, thanks to the jetpack_offline_mode filter:

	`add_filter( 'jetpack_offline_mode', '__return_true' );`

	See the [Custom code snippets](#custom-code-snippets-mu-plugins) section for more information on how to add custom code snippets.

	While in Offline Mode, some features will not be available at all as they require WordPress.com for all functionality—Related Posts and Jetpack Social, for example. Other features will have reduced functionality to give developers a good-faith representation of the feature. For example, Tiled Galleries requires the WordPress.com Photon CDN; however, in Offline Mode, Jetpack provides a fallback so developers can have a similar experience during development and testing. Find out more in [our support documentation](https://jetpack.com/support/jetpack-for-developers/).

* ### JETPACK__SANDBOX_DOMAIN

	External contributors do not need this constant.
	If you’re working on changes to the WordPress.com/server side of Jetpack, you’ll need to instruct your Jetpack installation to talk to your development server. Refer to internal documentation for detailed instructions.

## Custom code snippets (mu-plugins)

You can add [mu-plugins](https://developer.wordpress.org/advanced-administration/plugins/mu-plugins/) inside `tools/docker/mu-plugins` like `0-snippets.php` to add custom code snippets to your test site. Those files are gitignored. This is useful for testing specific features or debugging issues.

For example, you can add the following code to the `0-snippets.php` file to use local Calypso URLs instead of the production ones for connecting a site.

```php
add_filter(
	'jetpack_build_authorize_url',
	function ( $url ) {
		// Comment out this line when not using local Calypso development URL.
		$url = str_replace( 'https://wordpress.com', 'http://calypso.localhost:3000', $url );

		return $url;
	}
);
```
