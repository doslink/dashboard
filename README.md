# Dashboard

## Development

#### Setup

Install Node.js:

```
brew install node
```

Install dependencies:

```
npm install
```

Start the development server with

```
npm start
```

By default, the development server uses the following environment variables
with default values to connect to a local server instance:

```
API_URL=http://localhost:3000/api
PROXY_API_HOST=http://localhost:6051
```

#### Style Guide

We use `eslint` to maintain a consistent code style. To check the source
directory with `eslint`, run:

```
npm run lint src
```

### React + Redux

#### ES6

Babel is used to transpile the latest ES6 syntax into a format understood by
both Node.js and browsers. To get an ES6-compatible REPL (or run a one-off script)
you can use the `babel-node` command:

`$(npm bin)/babel-node`

#### Redux Actions

To inspect and debug Redux actions, we recommend the "Redux DevTools" Chrome
extension:

https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd


#### Creating new components

To generate a new component with a connected stylesheet, use the following
command:

```
npm run generate-component Common/MyComponent
```

The above command will create two new files in the `src/components` directory:

```
src/components/Common/MyComponent/MyComponent.jsx
src/components/Common/MyComponent/MyComponent.scss
```

with `MyComponent.scss` imported as a stylesheet into `MyComponent.jsx`.

Additionally, if there is an `index.js` file in `src/components/Common`, it
will appropriately add the newly created component to the index exports.


## Production

In production environments, Dashboard is served from within `server`. The contents
of the application are packaged into a single Go source file that maps generated
filenames to file contents.

To deploy an updated dashboard to production:

1. Package the dashboard in production mode using `webpack` with:

    ```sh
    $ npm run build
    ```

2. Bundle the packaged output into an updated `dashboard.go`:

    ```sh
    $ go install ./cmd/gobundle
    $ gobundle -package dashboard public > generated/dashboard.go
    $ gofmt -w generated/dashboard.go
    ```

3. Commit the resulting `dashboard.go`, then rebuild and start `server`

    ```sh
    $ go install ./cmd/server
    $ server
    ```

    Dashboard will be served at the root path from the server.
