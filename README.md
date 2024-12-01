# Companies House UK Proxy

Fetching data from Companies House UK via the official API requires a secure transport-layer connection (TLS 1.2) and a non-localhost domain.

This proxy implementation, based on the [Essential Server](https://github.com/TejBirringTM/EssentialServer), is designed to be hosted on a free/cost-effective computing resource to do just that.

## How to Use

### 1. Install Dependencies

```
npm install
```

### 2. Develop Locally

```
npm run dev
```

### 3. Deploy and Run

Currently, only Heroku deploy is supported by scripts. Feel free to add additional support.

#### Deploy on Heroku

Make sure to create a [Heroku](https://www.heroku.com/) project. Then, install the Heroku command-line interface (CLI) on your development machine.

Finally, for the purpose of orchestrating deployments, ensure that your project (local repository) is connected to the Heroku remote repository used by Heroku to trigger deployments: `heroku git:remote -a <HEROKU APP NAME> -r <NAME OF REMOTE TO CREATE>"`

```
npm run deploy:heroku
```

#### Run

The following command is used to run the server:

```
npm run start
```

Note: When using a deployment script, such as `npm run deploy:heroku`, this command will be run automatically on the hosting machine.

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