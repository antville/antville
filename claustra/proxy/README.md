# The Proxy Claustra

The Antville Proxy Claustra allows to retrieve URLs via HTTP from outside Antville’s domain, e.g. for fetching site content with JavaScript.

It is required for using the Formica bookmarklet available from the settings of each Antville site.

## Installation

Enable the Claustra in your application’s `app.properties` file:

```properties
# Multiple claustra can be enabled comma-separated
claustra = proxy
```

## Usage

To use the proxy you must be logged in to the corresponding Antville installation.

It is available under the path `/claustra/proxy`, e.g. under the URL `http://localhost:8080/claustra/proxy`.

Use the `url` query parameter to retrieve a URL via the Proxy Claustra:

```sh
curl -G --data-urlencode 'url=https://postman-echo.com/time/now' 'http://localhost:8080/claustra/proxy'
Fri, 24 Apr 2020 19:00:43 GMT
```

The proxy also supports JSONP requests simply by appending the `callback` query parameter:

```sh
curl -G --data-urlencode 'url=https://postman-echo.com/time/now' 'http://localhost:8080/claustra/proxy?callback=evaluate'
evaluate({"content":"Fri, 24 Apr 2020 19:00:43 GMT"});
```
