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

	async getMany(keys) {
		const select = this.entry.select().where(this.entry.key.in(keys)).toString();
		const rows = this.db.prepare(select).all();
		console.log('getMany', select, rows)
		return keys.map(key => {
			const row = rows.find((row) => row.key === key);
			return (row ? row.value : undefined);
		});
	}

	set(key, value) {
		let upsert = this.entry.replace({ key, value }).toString();

		const info = this.db.prepare(upsert).run();
		return info.changes > 0;
	}

	delete(key) {
		const del = this.entry.delete().where({ key }).toString();
		this.db.prepare(del).run();
		return true;
	}

	deleteMany(keys) {
		const results = this.getMany(keys);
		if (results.every(x => x === undefined)) {
			return false;
		}
		const del = this.entry.delete().where(this.entry.key.in(keys)).toString();
		this.db.prepare(del).run();
		return true;
	}

	clear() {
		const del = this.entry.delete(this.entry.key.like(this.namespace ? `${this.namespace}:%` : '%')).toString();
		const info = this.db.prepare(del).run();
		return info.changes;
	}

	* iterator(namespace) {
		const limit = Number.parseInt(this.opts.iterationLimit, 10) || 10;

		// @ts-expect-error - iterate
		function * iterate(offset, options, query, db) {
			const select = query.select().where(query.key.like(`${namespace ? namespace + ':' : ''}%`)).limit(limit).offset(offset).toString();
			const iterator = db.prepare(select).all();
			const entries = [...iterator];
			if (entries.length === 0) {
				return;
			}

			for (const entry of entries) {
				offset += 1;
				yield [entry.key, entry.value];
			}

			yield * iterate(offset, options, query, db);
		}

		yield * iterate(0, this.opts, this.entry, this.db);
	}
}

module.exports = KeyvBetterSqlite3;