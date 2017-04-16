
# About

TODO: Write this

# How to run locally

## Install everything

Clone this repository

Install postgres https://postgresapp.com/

Create database

```
createdb piikki
```

Create python virtualenv

```
mkvirtualenv piikki --python=`which python3.5`
```

Put these to `.env` file

```
workon piikki
export FLASK_DEBUG=1
export FLASK_APP='autoapp.py'
export SECRET_KEY='super-secret'
export DATABASE_URL='postgresql://localhost:5432/piikki'
export API_URL='http://127.0.0.1:5000'
```

Install python packages

```
pip install -r requirements.txt

```

Install node packages

```
npm install
```

Initialize the database

```
flask initdb
```

## Starting server

Start backend server

```
flask threaded
```

Start webpack dev server with autoreloading.
On production assets are server by flask.

```
./node_modules/webpack-dev-server/bin/webpack-dev-server.js
```

You can now go to http://localhost:8080/ with your browser

# How to run automated tests

## Python unit tests

Create test database

```
createdb piikki_test
```

Run unit tests

```
py.test
```

## End to end (e2e) tests

Make sure flask server and webpack-dev-server are running

Make sure selenium is installed and started

```
./node_modules/selenium-standalone/bin/selenium-standalone install
./node_modules/selenium-standalone/bin/selenium-standalone start
```

Run the tests

```
./node_modules/nightwatch/bin/nightwatch
```

