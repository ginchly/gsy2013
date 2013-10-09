var async = require('async');

exports.up = function (db, callback) {
	async.series([
		db.createTable.bind(db, 'concepts', {
			id: { type: 'int', primaryKey: true, autoIncrement: true },
			name: 'string',
			session: 'int'
		}),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 1a', 1]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 1b', 1]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 1c', 1]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 1d', 1]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 2a', 2]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 2b', 2]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 3a', 3]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 3b', 3]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Concept 3c', 3])
	], callback);
};

exports.down = function(db, callback) {
	db.dropTable('concepts', callback);
};
