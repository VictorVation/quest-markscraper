var app = require("express")();
var request = require("request").defaults({jar: true}); // We need cookies
var cheerio = require("cheerio");
var _ = require("lodash");

// Replace the following two lines with your username and password
var username = process.env.qUsername    // "questUsername"
var password = process.env.qPWD         // "questPassword"
var base = 'https://quest.pecs.uwaterloo.ca/';

app.get('/', function(req, res) {
    if( !username || !password) {
        res.end("Quest username or password is empty.")
        return;
	}

    var reqOpts =  {
		form: {
			timezoneOffset: 0,
			userid: username,
			pwd: password,
			Submit: "Sign in",
			httpPort: ""
		},
	    headers: {
	        'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:2.0b6) Gecko/20100101 Firefox'
	    }
	}

    // Logging in
	reqOpts.url = base + "psp/SS/?cmd=login&languageCd=ENG";
	request.post(reqOpts, function(error, response, body) {
		console.log("Logged in as " + username)
		reqOpts.form = {};

		// Landing page
		reqOpts.url = base + "psp/SS/ACADEMIC/SA/h/?tab=DEFAULT";
		request.get( reqOpts, function(error, response, body) {
		console.log("Opened landing page")

			// Follow redirect
			reqOpts.url = base + "psp/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL?FolderPath=PORTAL_ROOT_OBJECT.HC_SSS_STUDENT_CENTER&IsFolder=false&IgnoreParamTempl=FolderPath%2cIsFolder";
			request.get (reqOpts, function(error, response, body) {
			console.log("Landing page redirect followed")

				// Student center
				reqOpts.url = base + "psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL?FolderPath=PORTAL_ROOT_OBJECT.HC_SSS_STUDENT_CENTER&amp;IsFolder=false&amp;IgnoreParamTempl=FolderPath%2cIsFolder&amp;PortalActualURL=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsc%2fSS%2fACADEMIC%2fHRMS%2fc%2fSA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL&amp;PortalContentURL=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsc%2fSS%2fACADEMIC%2fHRMS%2fc%2fSA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL&amp;PortalContentProvider=HRMS&amp;PortalCRefLabel=Student%20Center&amp;PortalRegistryName=ACADEMIC&amp;PortalServletURI=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsp%2fSS%2f&amp;PortalURI=https%3a%2f%2fquest.pecs.uwaterloo.ca%2fpsc%2fSS%2f&amp;PortalHostNode=SA&amp;NoCrumbs=yes"
				request.get(reqOpts, function(error, response, body) {
				console.log("Clicked \"Student Center\"")

					// "My Academics" POST
					reqOpts.url = base + "psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.GBL";
					reqOpts.form = {
				    	ICAction:'DERIVED_SSS_SCR_SSS_LINK_ANCHOR1',
					}
					request.post(reqOpts, function(error, response, body) {
						console.log("Clicked \"My Academics\"")
						reqOpts.form = {};

						// Following redirect
						reqOpts.url = base + "psc/SS/ACADEMIC/HRMS/c/UW_SS_MENU.UW_SS_MYPROG_UG.GBL?Page=UW_SS_MYPROG_UG&Action=U&ExactKeys=Y";
						request.get(reqOpts, function(error, response, body) {
						console.log("\"My Academics\" redirect followed")

							// Click "Grades"
							reqOpts.url = base + "psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL?Page=SSR_SSENRL_GRADE&Action=A";
							request.get(reqOpts, function(error, response, body) {
								console.log("Clicked \"Grades\"")

								// Select current term
								reqOpts.url = base + "psc/SS/ACADEMIC/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL"
								reqOpts.form = {
									ICAction : "DERIVED_SSS_SCT_SSR_PB_GO",
									SSR_DUMMY_RECV1$sels$0 : 1	// Current term
								}
								request.post(reqOpts, function(error, response, body) {
									console.log("Term selected")
									var classes = []
									var grades = []
									var $ = cheerio.load(body);
									$('a.PSHYPERLINK').each( function(i,element) {
										classes.push( $(this).text() )
									})
									console.log ("Classes scraped")
									$('.PABOLDTEXT').each( function(i,element) {
										grades.push( $(this).text() )
									})
									console.log ("Grades scraped")
    								classes.shift();
									var allAvailable = (classes.length == grades.length && classes.length > 1);
									var gradeObj = _.object(classes, grades);
									if (allAvailable)
										returnJSON = _.extend({"allAvailable" : allAvailable}, {grades: gradeObj});
									else
										returnJSON = {"allAvailable" : allAvailable}

                                    res.setHeader('Access-Control-Allow-Origin', '*');
  									res.send(returnJSON);

                                    console.log("Response sent");
                                    return;
								})
							})
						})
					})
				})
			})
		})
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
console.log("Listening on " + port);
});
