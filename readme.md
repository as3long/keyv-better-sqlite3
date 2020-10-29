# keyv-better-sqlite3 [<img width="100" align="right" src="https://rawgit.com/lukechilds/keyv/master/media/logo.svg" alt="keyv">](https://github.com/lukechilds/keyv)

> SQLite storage adapter for Keyv

SQLite storage adapter for [Keyv](https://github.com/lukechilds/keyv).

## Install

```shell
npm install --save keyv keyv-better-sqlite3
```

## Usage

```js
const Keyv = require('keyv');
const KeyvBetterSqlite3 = require('keyv-better-sqlite3');

const keyv = new Keyv({
    store: new KeyvBetterSqlite3({
        uri: 'sqlite://path/to/database.sqlite'
    })
});
```

You can specify the `table` and [`busyTimeout`](https://sqlite.org/c3ref/busy_timeout.html) option.

e.g:

```js
const keyv = new Keyv({
    store: new KeyvBetterSqlite3({
        uri: 'sqlite://path/to/database.sqlite',
        table: 'cache',
        busyTimeout: 10000
    })
});
```

## License

MIT ©