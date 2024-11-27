# Essential Server (Node.js, Express.js, TypeScript)

__Essential Server__ is just your everyday [Node.js](https://nodejs.org/) server written in [TypeScript](https://www.typescriptlang.org/), based on the [Express.js](https://expressjs.com/) web framework — designed to get new projects off the ground as quickly as possible.

[See below on how to get started ASAP.](#getting-started)

## Features

### Validation and Parsing

✅ Schema-validated environment variables (using [zod](https://www.npmjs.com/package/zod))

✅ Deeply-engrained semantic versioning ([Semantic Version 2.0.0](https://semver.org/spec/v2.0.0.html))

* Captures and validates `version` stipulated in `package.json` to avoid discrepancies

✅ Advanced parsing of URL-encoded query strings for richer query data (using [qs](https://www.npmjs.com/package/qs))

✅ JSON requests (`request.body`) and responses

✅ Thorough schema validation of requests (using [zod](https://www.npmjs.com/package/zod))

* __Route parameters:__ schema sensibly constrained to `Record<string, string>`
* __Query parameters:__ schema sensibly constrained to [qs](https://www.npmjs.com/package/qs)-compatible output
* __Body:__ schema sensibly constrained to JSON-serialisable object

### Logging

✅ Automatic, configurable request logging (using [morgan](https://www.npmjs.com/package/morgan))

### Error Handling

✅ Basic error handling, out of the boxes

* Throws `500 Internal Server Error` on exception.
* If an Error object is caught, displays `error.message` in body of the error response.

### Security

✅ Appends "best practice" security headers (using [helmet](https://www.npmjs.com/package/helmet))

✅ Implements Cross-Origin Resource Sharing (CORS) controls (using [helmet](https://www.npmjs.com/package/helmet) and [cors](https://www.npmjs.com/package/cors))

✅ Rate limiting, out of the box (using [express-rate-limit](https://www.npmjs.com/package/express-rate-limit))

* IP based.
* Currently uses internal memory store.

### Performance

✅ Caching, out of the box

* Useful `cacheHandler` middleware to enable appropriate response caching on individual routes or across router(s)
    * Control own caching behaviour (through middleware options)
    * Control caching behaviour of external caches (through middleware options pertaining to `Cache-Control` headers)
* Currently uses internal memory store ([node-cache](https://www.npmjs.com/package/node-cache)).

## Prerequisites

* Node.js v22+

## Getting Started

### 1. Create a New Project

#### Option A: Local Clone

1. Using a terminal, run the command below to clone Essential Server into a new project directory: 

    `npx degit TejBirringTM/EssentialServer <your_project_name>`

2. Navigate to the local clone:

    `cd <your_project_name>`

#### Option B: New GitHub Repository

1. Navigate to the [Essential Server GitHub repository](https://github.com/TejBirringTM/EssentialServer).
2. Click 'Use this template' followed by ;Create a new repository'.
3. Follow the instructions provided by GitHub to clone Essential Server into a new repository for your project.
4. Using a terminal, clone the newly-created project repository to your local machine.
5. Navigate to the local clone:

    `cd <your_project_name>`

### 2. Install Dependencies

From the terminal, install project dependencies: `npm install`

### 3. (Optional) Perform Sanity Checks

1. Ensure all tests pass.

    From the terminal, run:
`npm test`

    If any test fails, please [submit a report here.](https://github.com/TejBirringTM/EssentialServer/issues)

2. Run the server and test its endpoints.

    From the terminal, run: `npm run start`

    You can test the server by sending HTTP requests to the endpoints implemented in `src/routes/*.ts` files from a HTTP client like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/).

    Once you're done, exit the server by pressing `Ctrl + C` while in the terminal.

### 4. Implement Server

__Congratulations!__

Now, it's time for you to implement your own server!

[See here for more information about this.](#how-to-use)

While you are developing, you will find this command helpful to start the server; it will restart the server every time a source file is modified: `npm run dev`

## How to Use

### Folder Structure

Before proceeding, it would be a good idea to understand the folder structure of Essential Server:

```
src/
├─ config/
|  code that parses environment variables and 
|  exports a configuration object to the rest 
|  of the codebase.
|
├─ middlewares/
|  top-level files export Express.js middleware(s)
|  (i.e. route handler functions) for use by the
|  server application, a router, or individual
|  routes.
|
├─ routes/
|  top-level files default export a Router
|  object describing routes to serve.
|  Note: the routers are loaded and served
|  automatically!
|
├─ services/
|  modules that provide foundational services
|  to the rest of the system.
|
├─ utils/
|  simple utility classes, modules, and functions; 
|  stateless and pure (i.e. no side effects).
```

The `tests/` folder should follow the same pattern as the `src/` folder.

### Configuration

Currently, all configurations (but one) are determined by the environment variables of the
server's execution environment. All environment variables are described in
`src/config/schema.ts` – see the `describe(...)` calls.

__Note:__ When running in `debug` mode, the `.env` file in the project's root directory will be loaded by default.

The other configuration used by the system is the `version` value from the project's `package.json` file. The version string must abide by [Semantic Version 2.0.0](https://semver.org/spec/v2.0.0.html). The 'major' part of the version will determine the base
path of the server.

__Example__

If `src/routes/public.ts` exports a route called `my/test/`, and the `version` number in `package.json` is set to `'2.4.1'`, the route will be served from `/api/v2/public/my/test/` (with or without the trailing `/`).

The general pattern for endpoints is: `/api/v<version_major>/<router_file_name>/<route_path>`

#### Adding New Configurations

To add a new configuration, you should first append any new environment variables to the environment variables schema in `src/config/schema.ts`.

Then, you should export the _parsed_ variable via the default export in `src/config/index.ts`

__Example__

In `src/config/schema.ts`:

```ts
export const envSchema = z.object({
  // ... omitted for brevity
  
  COOLNESS: z.enum(['not cool', 'cool', 'very cool', 'uber cool'])
    .describe('The perceived level of coolness of the server.')
    .default('uber cool')

  // ... omitted for brevity
 });
```

In `src/config/index.ts`:
```ts
const config = {
    env: env.NODE_ENV,
    port: env.PORT,
    // ... omitted for brevity
    perception: {
        of: {
            server: {
                coolness: env.COOLNESS,
            },
        },
    },
} as const;

export default config;
```

### Development

#### Adding New Routes

To add a new route, either:

a. Add routes to an existing router object default exported by a top-level source file in the `src/routes` folder.

b. Create a new source file in the `src/routes` folder and `export default` a new router object from it.

__Note:__ The general pattern for endpoints is: `/api/v<version_major>/<router_file_name>/<route_path>`

##### Adding Validated Routes


##### Adding Unvalidated Routes


### Testing

_Test infrastructure is currently being implemented._

### Deployment

Essential Server is designed to allow maximum flexibility around deployment by not making design decisions that might ordinarily restrict deployment options.

## Issues

If you encounter a bug or want to see something added or improved, please go ahead and [open an issue!](https://github.com/TejBirringTM/EssentialServer/issues)

If you need help with something, feel free to [start a discussion!](https://github.com/TejBirringTM/EssentialServer/discussions)

## Contributing

Thank you, feel free!

Contributions can take many forms, from code for bug fixes and enhancements, to documentation work, writing additional tests, triaging incoming pull requests and issues, and more!

Before submitting a PR, ensure that:

1. Code is functional.
2. Code is linted.
3. Code passes all tests.
4. Any requisite updates or additions to documentation have been made.

Feel free to [reach out](mailto:tejbirring@gmail.com?subject=The%20Essential%20Server%20Project&body=Hey%20Tej%2C%0A%0A...) if you're not sure!

## License
```
MIT License

Copyright © 2024 Tej Birring

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```