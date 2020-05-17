# Change Log

## May 17, 2020

* Reverted Yarn scripts into Gradle tasks
* Implemented complete build system in Gradle
* Added color support for console messages
* Replaced Node module for rendering Markdown (marked) with Java implementation (CommonMark)
* Replaced Node module for sanitizing HTML (string-strip-html) with Java implementation (jsoup)

## May 1, 2020

* Upgraded jQuery to version 3
* Refactored most client-side scripts using Alpine
* Moved code for jQuery collage plugin into extra file

## April 13, 2020

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
