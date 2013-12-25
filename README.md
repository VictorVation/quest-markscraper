quest-markscraper
=================

Mark scraper for UWaterloo Quest written in Node.js. A HTTP GET request to the server returns a JSON object:

* If all marks are available: 
```JSON
{
	"allAvailable": true
	grades: {
    	"CHE 102": 95,
    	"ECE 100A": 100,
    	"ECE 105": 89
    	"ECE 140": 95,
    	"ECE 150": 99,
    	"MATH 117": 92
    }
}
```
* Otherwise:
```JSON
{
    "allAvailable": false
}
```

Installation:

1. `git clone https://github.com/VictorVation/quest-markscraper.git`
2. `cd quest-markscraper`
3. `npm install .`
4. Replace lines 9-10 with your Quest username and password (in a `string`) 
5. `node quest-markscraper.js`
6. Point your browser to `localhost:5000`