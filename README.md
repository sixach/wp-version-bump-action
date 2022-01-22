# ✨ WordPress Version Bump

This is a custom action to bump version of WordPress plugin/theme. Can be used for PHP files, as well as for style.css (in case of a theme).

Every WordPress theme/plugin is required to have header with all the information, such as title, tagging, author, donate link etc. This action tried to find `Version:` string inside the header and replace number with a new one. The version string should follow the [SemVer](https://semver.org/) standard.

## Example

Let's say you have this header:

```php
<?php
/**
 * Gutenberg Block.
 *
 * Plugin Name:          Sixa - Gutenberg Block
 * Description:          Here goes custom description of the plugin
 * Version:              1.0.0
 * Tags:                 block, gutenberg, sixa
 * Author:               sixa AG
 * Author URI:           https://sixa.ch
 * License:              GPLv3 or later
 */
```

If you run this action with param `version` set to `1.1.0`, it's gonna change header accordingly.

```php
<?php
/**
 * Gutenberg Block.
 *
 * Plugin Name:          Sixa - Gutenberg Block
 * Description:          Here goes custom description of the plugin
 * Version:              1.1.0
 * Tags:                 block, gutenberg, sixa
 * Author:               sixa AG
 * Author URI:           https://sixa.ch
 * License:              GPLv3 or later
 */
```

## Typical Usage

Add the following step to your job.

```yml
- uses: sixach/wp-version-bump-action@v1
  with:
    # Required. New version.
    # Action will try to replace current version with a new one.
    # Version string should follow SemVer standard.
    version: 1.3.5

    # Required. Relative path to the working directory
    # File to be modified, the action will look for doc comment
    # For example: "Version: 1.3.4", the version number will be
    # replaced with provided version.
    file_path: ./plugin-file.php
```