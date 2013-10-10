var dbm = require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function (db, callback) {
	async.series([
		db.createTable.bind(db, 'understandScore', {
			id: { type: 'int', primaryKey: true, autoIncrement: true },
			concept: 'int',
			score: 'int',
			time: 'bigint'
		}),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [1, 1, 1381361972576]),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [1, 1, 1381362972576]),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [1, 1, 1381363972576]),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [1, -1, 1381364972576]),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [2, 1, 1381361972576]),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [2, 1, 1381362972576]),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [2, 1, 1381363972576]),
		db.insert.bind(db, 'understandScore', ['concept', 'score', 'time'] , [2, 1, 1381364972576])
	], callback);
};

exports.down = function (db, callback) {
  db.dropTable('understandScore', callback);
};
