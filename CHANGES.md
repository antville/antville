# Change Log

## 2024 January 7

* Upgrade third-party dependencies

## 2023 December 30

* Fix initialization of MarkDown in UIKit editor
* Add support for images in webp format

## 2023 August 26

* Migrate from Yarn back to NPM
* Some major upgrades of third-party dependencies
* Rewrite `for…each` loops with `for…of` (needs enabled ES6 features in Rhino)

## 2023 March 5

* Fix SQL injection vulnerability

## 2020 May 23

* Render tables with stripes and hover colors extrapolated from layout settings
* Replaced Google’s ReCaptcha with [hCaptcha](https://hcaptcha.com)

## 2020 May 17

* Reverted Yarn scripts into Gradle tasks
* Implemented complete build system in Gradle
* Added color support for console messages
* Replaced Node module for rendering Markdown (marked) with Java implementation ([CommonMark](https://github.com/atlassian/commonmark-java))
* Replaced Node module for sanitizing HTML (string-strip-html) with Java implementation ([jsoup](https://jsoup.org))

## 2020 May 1

* Upgraded jQuery to version 3
* Refactored remaining cient-side jQuery code using [Alpine](https://github.com/alpinejs/alpine) (jQuery is still a dependency of UIkit, though)
* Moved code for jQuery [CollagePlus](https://github.com/antville/jquery-collagePlus) plugin into extra file

## 2020 April 13

* Rewrote most client-side code without using jQuery
* Refactored Formica bookmarklet
* Improved Proxy Claustra for use with Formica bookmarklet
* Fixed output missing Markdown filter in multiple places
* Replaced Gradle and Ant build tasks with Yarn scripts
* Removed support for Instant Articles
* Removed support for Accelerated Mobile Pages
* Replaced Rhino-incompatible sanitize-html NPM package with string-strip-html
* Upgraded NPM dependencies to latest compatible versions
* Incorporated some claustra as integral part of Antville
