var app = require('express')();
var request = require('request').defaults({jar: true}); // We need cookies
var cheerio = require('cheerio');
var _ = require('lodash');

// Replace the following two lines with your username and password
var username = process.env.QUEST_USER    // 'questUsername';
var password = process.env.QUEST_PWD     // 'questPassword';
var base = 'https://quest.pecs.uwaterloo.ca/';

var getGrades = function(req, res) {
	if( !username || !password) {
    res.end('Quest username or password is empty.')
    return;
	}

	var path = req.path.slice(1);

	if (!_.isEmpty(path)) {
		var term = '';

		switch(_.first(path).toLowerCase()) {
			case 'f': term += 'Fall '; break;
			case 'w': term += 'Winter '; break;
			case 's': term += 'Spring '; break;
	    default: res.end('Invalid term.'); return;
		}

		term += '20' + path.slice(1);
	}

  var reqOpts =  {
		form: {
			timezoneOffset: 0,
			userid: username,
			pwd: password,
			Submit: 'Sign in',
			httpPort: ''
		},
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:2.0b6) Gecko/20100101 Firefox'
    }
	}

  // Logging in
	reqOpts.url = base + 'psp/SS/?cmd=login&languageCd=ENG';
	request.post(reqOpts, function(error, response, body) {
		console.log('Logged in as ' + username)
		reqOpts.form = {};

		// Landing page
		reqOpts.url = base + 'psp/SS/ACADEMIC/SA/h/?tab=DEFAULT';
		request.get( reqOpts, function(error, response, body) {

			// Follow redirect
			reqOpts.url = base + 'psp/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL?FolderPath=PORTAL_ROOT_OBJECT.HC_SSS_STUDENT_CENTER&IsFolder=false&IgnoreParamTempl=FolderPath%2cIsFolder';
			request.get (reqOpts, function(error, response, body) {

				// Student center
				reqOpts.url = base + 'psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL?FolderPath=PORTAL_ROOT_OBJECT.HC_SSS_STUDENT_CENTER&amp;IsFolder=false&amp;IgnoreParamTempl=FolderPath%2cIsFolder&amp;PortalActualURL=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsc%2fSS%2fACADEMIC%2fHRMS%2fc%2fSA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL&amp;PortalContentURL=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsc%2fSS%2fACADEMIC%2fHRMS%2fc%2fSA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL&amp;PortalContentProvider=HRMS&amp;PortalCRefLabel=Student%20Center&amp;PortalRegistryName=ACADEMIC&amp;PortalServletURI=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsp%2fSS%2f&amp;PortalURI=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsc%2fSS%2f&amp;PortalHostNode=SA&amp;NoCrumbs=yes'
				request.get(reqOpts, function(error, response, body) {

					// 'My Academics' POST
					reqOpts.url = base + 'psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL';
					reqOpts.form = {
				    	ICAction:'DERIVED_SSS_SCR_SSS_LINK_ANCHOR1',
					}
					request.post(reqOpts, function(error, response, body) {
						reqOpts.form = {};

						// Following redirect
						reqOpts.url = base + 'psc/SS/ACADEMIC/HRMS/c/UW_SS_MENU.UW_SS_MYPROG_UG.GBL?Page=UW_SS_MYPROG_UG&Action=U&ExactKeys=Y';
						request.get(reqOpts, function(error, response, body) {

							// Click 'Grades'
							reqOpts.url = base + 'psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL?Page=SSR_SSENRL_GRADE&Action=A';
							request.get(reqOpts, function(error, response, body) {

								var $ = cheerio.load(body);

								// Select current term using terrible dom/regex/whatever hack
								var re = /value="(\d)/;

								var termNumber = _.isEmpty(term)
									? '2'
									: re.exec($('tr:contains(' + term + ')').last().children().children().html())[1];

								if (_.isUndefined(termNumber)) {
									res.send("Invalid term.");
									return;
								}
								console.log('Term is', term, '['+termNumber+']');
								reqOpts.url = base + 'psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL'
								reqOpts.form = {
									ICAction : 'DERIVED_SSS_SCT_SSR_PB_GO',
									SSR_DUMMY_RECV1$sels$0: termNumber
								}
								request.post(reqOpts, function(error, response, body) {
									var classes = [];
									var grades = [];

									var $ = cheerio.load(body);
									$('a.PSHYPERLINK').each(function(i, element) {
										classes.push( $(this).text() )
									});
									$('.PABOLDTEXT').each(function(i, element) {
										grades.push( $(this).text() )
									});
  								classes.shift();

									var gradeObj = _.object(classes, grades);
									returnJSON = { term: term, grades: gradeObj };

	                res.setHeader('Access-Control-Allow-Origin', '*');
									res.send(returnJSON);
	                console.log('Response sent');
	                return;
								})
							})
						})
					})
				})
			})
		})
	})
}

app.get('/', getGrades);
app.get('/(^$|[fwsFWS]{1}\\d{2}$)', getGrades);

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Listening on ' + port);
});
