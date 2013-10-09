$( document ).ready(function() {
	'use strict';

	var prod;
	var urlRoot = '';

	var course, session, concept;

	if (document.location.hostname.indexOf('heroku') === 0) {
		prod = true;
	}

	function getCourses() {
		var url;
		if (prod) {
			url = './api/courses';
		} else {
			url = 'http://localhost:5000/api/courses';
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			var courseList = '<ul>';
			for (var i = 0; i < data.length; i++) {
				courseList = courseList + '<li><div class="js-link-course" data-id=' + data[i].id + '>' + data[i].name + '</div></li>';
			}
			courseList = courseList + '</ul>';
			$('#js-all-courses').html(courseList);

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
			url = './api/courses/' + courseId + '/sessions';
		} else {
			url = 'http://localhost:5000/api/courses/' + courseId + '/sessions' ;
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			console.log(data);
			var sessionList = '<h2>Sessions</h2><ul>';
			for (var i = 0; i < data.length; i++) {
				sessionList += '<li><div class="js-link-session" data-id=' + data[i].id + '>' + data[i].name + '</div></li>';
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
			$('#js-btn-add-session').click(function() {
				event.preventDefault();
				var newSession = $('#js-add-session').val();
				var formData = {};
				formData.name = newSession;

				var postUrl;
				if (prod) {
					postUrl = './api/courses/' + course + '/sessions';
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
			url = './api/sessions/' + sessionId + '/concepts';
		} else {
			url = 'http://localhost:5000/api/sessions/' + sessionId + '/concepts';
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			console.log(data);
			var conceptList = '<h2>Concepts</h2><ul>';
			for (var i = 0; i < data.length; i++) {
				conceptList = conceptList + '<li><div class="js-link-concepts" data-id=' + data[i].id + '>' + data[i].name + '</div></li>';
			}
			conceptList = conceptList + '</ul>';
			conceptList += '<form class="form-inline" role="form"><div class="form-group">' +
			  '<input class="form-control" id="js-add-concept" placeholder="New concept"></div>' +
			  '<button id="js-btn-add-concept"  class="btn btn-default">Add</button></form>';
			$('#js-content').html(conceptList);

			$('#js-btn-add-concept').click(function() {
				event.preventDefault();
				var newConcept = $('#js-add-concept').val();
				var formData = {};
				formData.name = newConcept;

				var postUrl;

				if (prod) {
					postUrl = './api/sessions/' + session + '/concepts';
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
	}

	getCourses();
});