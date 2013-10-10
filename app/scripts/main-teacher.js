

$( document ).ready(function() {
	'use strict';

	var recognizing;

	var prod;

	var course, session;
	var Recognition, finalTranscript = 'START [TIME=' + new Date().getTime() + '] ';
	var recordingStopped, addTimestampInt;

	if (document.location.hostname.indexOf('heroku') !== 0) {
		prod = true;
	}

	if (!('webkitSpeechRecognition' in window)) {
		console.log('not supported');
	} else {
		Recognition = new webkitSpeechRecognition();
		Recognition.continuous = true;
		Recognition.lang = 'en-US';
	}

	function getCourses() {
		var url;
		if (prod) {
			url = '../api/courses';
		} else {
			url = 'http://localhost:5000/api/courses';
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			var courseList = '';
			for (var i = 0; i < data.length; i++) {
				courseList += '<div class="row-fluid text-center"><div class="span12"><section class="panel"><div class="js-link-course" data-id=' + data[i].id + '>' + data[i].name + '</section></div></div>';
			}
			$('#js-content').html(courseList);

			$('.js-link-course').click(function() {
				var courseId = $(this).data('id');
				course = courseId;
				getSessions(courseId);
			});
		});


	}

	function getSessions(courseId) {
		var url;
		if (prod) {
			url = '../api/courses/' + courseId + '/sessions';
		} else {
			url = 'http://localhost:5000/api/courses/' + courseId + '/sessions' ;
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			var sessionList = '<ul id="js-list">';
			for (var i = 0; i < data.length; i++) {
				sessionList += '<div class="row-fluid text-center"><div class="span12"><section class="panel"><div class="js-link-session" data-id=' + data[i].id + '>' + data[i].name + ' <span class="js-delete btn btn-mini btn-warning" data-id=' + data[i].id + '> (Delete)</span></div></section></div></div>';
			}
			sessionList += '</ul>';
			sessionList += '<form class="form-inline" role="form"><div class="form-group">' +
			  '<input type="email" class="form-control" id="js-add-session" placeholder="New session"></div>' +
			  '<button id="js-btn-add-session" class="btn btn-default">Add</button></form>';

			$('#js-content').html(sessionList);

			$('.js-link-session').click(function() {
				var sessionId = $(this).data('id');
				session = sessionId;
				getConcepts(sessionId);
			});

			$('.js-delete').click(function() {
				var thisId = $(this).data('id');
				$('#' + thisId).remove();
				if (prod) {
					url = '../api/sessions/' + thisId;
				} else {
					url = 'http://localhost:5000/api/sessions/' + thisId;
				}
				$.ajax({
				    url : url,
				    type: 'DELETE'
				}).done(function() {
					console.log('session deleted');
				});
			});

			$('#js-btn-add-session').click(function() {
				event.preventDefault();
				var newSession = $('#js-add-session').val();

				$('#js-list').append('<li>' + newSession + '</li>');

				var formData = {};
				formData.name = newSession;

				var postUrl;
				if (prod) {
					postUrl = '../api/courses/' + course + '/sessions';
				} else {
					postUrl = 'http://localhost:5000/api/courses/' + course + '/sessions';
				}
				$.ajax({
				    url : postUrl,
				    type: 'POST',
				    data : formData,
				    success: function()
				    {
				        console.log('new session created successfully');
				    },
				    error: function ()
				    {
						console.log('error trying to create new session');
				    }
				});
			});
		});
	}

	// I'm sure this could be abstracted somewhat rather than having multiple similar functions
	function getConcepts(sessionId) {
		var url;
		if (prod) {
			url = '../api/sessions/' + sessionId + '/concepts';
		} else {
			url = 'http://localhost:5000/api/sessions/' + sessionId + '/concepts';
		}

		var scoreUrl;
		if (prod) {
			scoreUrl = '../api/understandScores';
		} else {
			scoreUrl = 'http://localhost:5000/api/understandScores';
		}


		$.ajax({
			url: scoreUrl
		})
		.done(function( data ) {
			var scores = data;
			$.ajax({
				url: url
			}).done(function( data ) {
				console.log(data);
				var conceptList = '<ul id="js-list-admin">';
				for (var i = 0; i < data.length; i++) {
					var thisId = data[i].id;
					var thisScore = scores[thisId] || 0;
					conceptList += '<div class="row-fluid text-center"><div class="span12"><section class="panel"><div class="js-link-concepts" data-id=' + thisId + '>' + data[i].name +
						' <span class="js-delete btn btn-mini btn-warning" data-id=' + thisId + '> (Delete)</span><span id=understand-' + thisId + '></span><span> - ' + thisScore + " person doesn't understand this </div></div></section></div></div>";
				}
				conceptList = conceptList + '</ul>';
				conceptList += '<form class="form-inline" role="form"><div class="form-group">' +
				  '<input class="form-control" id="js-add-concept" placeholder="New concept"></div>' +
				  '<button id="js-btn-add-concept"  class="btn btn-default">Add</button></form>';
				conceptList += '<button type="button" class="btn btn-default" id="js-start-recording">Start recording</button>' +
	                        '<button type="button" class="btn btn-default" id="js-stop-recording">Stop recording</button>';
	            conceptList += '<div class="row-fluid"><button type="button" class="btn btn-default" id="js-refresh">Refresh</button></div>';

				$('#js-content').html(conceptList);

				$('.js-delete').click(function() {
					var thisId = $(this).data('id');
					$('#' + thisId).remove();
					if (prod) {
						url = '../api/concepts/' + thisId;
					} else {
						url = 'http://localhost:5000/api/concepts/' + thisId;
					}
					$.ajax({
					    url : url,
					    type: 'DELETE'
					}).done(function() {
						console.log('concept deleted');
					});
				});

				$('#js-refresh').click(function() {
					event.preventDefault();
					getConcepts(session);
				});

				$('#js-start-recording').click(function() {
					recordingStopped = false;
					Recognition.start();
				});

				$('#js-stop-recording').click(function() {
					Recognition.stop();
					recordingStopped = true;
				});

				$('#js-btn-add-concept').click(function() {
					event.preventDefault();
					var newConcept = $('#js-add-concept').val();
					$('#js-list-admin').append('<li>' + newConcept + '</li>');
					var formData = {};
					formData.name = newConcept;

					var postUrl;

					if (prod) {
						postUrl = '../api/sessions/' + session + '/concepts';
					} else {
						postUrl = 'http://localhost:5000/api/sessions/' + session + '/concepts';
					}
					$.ajax({
					    url : postUrl,
					    type: 'POST',
					    data : formData,
					    success: function()
					    {
					        console.log('new concept created successfully');
					    },
					    error: function ()
					    {
							console.log('error trying to create new concept');
					    }
					});
				});
			});
		});
	}

	Recognition.onstart = function() {
		recognizing = true;
	};

	Recognition.onresult = function(event) {
		var interimTranscript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				finalTranscript += event.results[i][0].transcript;
				if (event.results[i][0].transcript !== '') {
					var timeNow = new Date().getTime();
					finalTranscript += '[TIME=' + timeNow + ']';
				}
			} else {
				interimTranscript += event.results[i][0].transcript;
			}
		}
		if (recordingStopped) {
			console.log(finalTranscript);
		}
	};

	Recognition.onerror = function(event) {
		console.log('error' + event);
	};

	Recognition.onend = function() {
		recognizing = false;
		console.log(finalTranscript);
		var body = encodeURI(finalTranscript);

		//TODO post to db
		var postUrl;
		if (prod) {
			postUrl = '../api/sessions/' + session + '/transcript';
		} else {
			postUrl = 'http://localhost:5000/api/sessions/' + session + '/transcript';
		}
		var timeNow = new Date().getTime();
		$.ajax({
		    url : postUrl,
		    type: 'POST',
		    data : {transcript: body, time: timeNow},
		    success: function()
		    {
		        console.log('new session created successfully');
		    },
		    error: function ()
		    {
				console.log('error trying to create new session');
		    }
		});
	};

	getCourses();
});