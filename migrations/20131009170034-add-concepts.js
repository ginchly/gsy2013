var dbm = require('db-migrate');
var type = dbm.dataType;

var async = require('async');

exports.up = function (db, callback) {
	async.series([
		db.createTable.bind(db, 'concepts', {
			id: { type: 'int', primaryKey: true, autoIncrement: true },
			name: 'string',
			session: 'int'
		}),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Problem', 1]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Market', 1]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Solution', 1]),
		db.insert.bind(db, 'concepts', ['name', 'session'] , ['Business Model', 1]),
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
