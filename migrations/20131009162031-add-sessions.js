var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
	db.createTable('sessions', {
		id: { type: 'int', primaryKey: true, autoIncrement: true  },
		name: { type: 'string' },
		course: { type: 'int' }
	}, function() {
		db.insert('sessions', ['name', 'course'] , ['Introduction To Computer Science', 1], function() {
			db.insert('sessions', ['name', 'course'] , ['Efficiency and Order of Growth', 1], function() {
				db.insert('sessions', ['name', 'course'] , ['Memory and Search Methods', 1], callback);
				});
			});
		});
	};

exports.down = function (db, callback) {
  db.dropTable('sessions', callback);
};