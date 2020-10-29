const Database = require('better-sqlite3');
const EventEmitter = require('events');
const Sql = require('sql').Sql;



class KeyvBetterSqlite3 extends EventEmitter {
	constructor(opts) {
		super(opts);
		opts = Object.assign({
			dialect: 'sqlite',
			uri: 'sqlite://:memory:'
		}, opts);
		opts.db = opts.uri.replace(/^sqlite:\/\//, '');

		opts.connect = () => {
			const dbOptions = {};
			if (opts.busyTimeout) {
				dbOptions.timeout = opts.busyTimeout;
			}
			const db = Database(opts.db, dbOptions);
			this.db = db;
		};

		this.opts = Object.assign({
			table: 'keyv',
			keySize: 255
		}, opts);

		const sql = new Sql(opts.dialect);

		this.entry = sql.define({
			name: this.opts.table,
			columns: [
				{
					name: 'key',
					primaryKey: true,
					dataType: `VARCHAR(${Number(this.opts.keySize)})`
				},
				{
					name: 'value',
					dataType: 'TEXT'
				}
			]
		});
		const createTable = this.entry.create().ifNotExists().toString();

		this.opts.connect();
		this.db.prepare(createTable).run();
	}

	get(key) {
		const select = this.entry.select().where({ key }).toString();
		const info = this.db.prepare(select).get();
		if (info && info.value) {
			return info.value;
		} 
		return undefined;
	}

	set(key, value) {
		let upsert = this.entry.replace({ key, value }).toString();

		const info = this.db.prepare(upsert).run();
		return info.changes > 0;
	}

	delete(key) {
		const del = this.entry.delete().where({ key }).toString();
		const info = this.db.prepare(del).run();
		return info.changes > 0;
	}

	clear() {
		const del = this.entry.delete(this.entry.key.like(`${this.namespace}:%`)).toString();
		const info = this.db.prepare(del).run();
		return undefined;
	}
}

module.exports = KeyvBetterSqlite3;