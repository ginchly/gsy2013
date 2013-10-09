var async = require('async');

exports.up = function (db, callback) {
	async.series([
		db.createTable.bind(db, 'concepts', {
			id: { type: 'int', primaryKey: true },
			name: 'string',
			session: 'int'
		}),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [1, 'Concept 1a', 1]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [2, 'Concept 1b', 1]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [3, 'Concept 1c', 1]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [4, 'Concept 1d', 1]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [5, 'Concept 2a', 2]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [6, 'Concept 2b', 2]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [7, 'Concept 3a', 3]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [8, 'Concept 3b', 3]),
		db.insert.bind(db, 'concepts', ['id','name', 'session'] , [9, 'Concept 3c', 3])
	], callback);
};

exports.down = function(db, callback) {
	db.dropTable('concepts', callback);
};
