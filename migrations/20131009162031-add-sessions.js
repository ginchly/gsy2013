var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
	db.createTable('sessions', {
		id: { type: 'int', primaryKey: true, autoIncrement: true  },
		name: { type: 'string' },
		course: { type: 'int' }
	}, function() {
		db.insert('sessions', ['name', 'course'] , ['Team 25 - Education', 1], function() {
			db.insert('sessions', ['name', 'course'] , ['Team 79 - Environment', 1], function() {
				db.insert('sessions', ['name', 'course'] , ['Team 85 - Health', 1], callback);
				});
			});
		});
	};

exports.down = function (db, callback) {
  db.dropTable('sessions', callback);
};