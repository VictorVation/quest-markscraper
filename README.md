# quest-markscraper

Mark scraper for UWaterloo Quest written in Node.js. A HTTP GET request to the server returns a JSON object containing a bool stating whether all grades are available, and an object containing the actual grades.

### Request
To get the grades, simply send the following request, where `{term}` is the term that you want grades for - in the format one letter, followed by the last two digits of the year e.g. `W13`, `F13`. It's optional, if you leave it blank then you'll get the grades for the third oldest term.

Default term:

```
>> GET /
<< {
    "allAvailable": true,
    "term": "Fall 2013",
    "grades": {
        "CHE 102": "95",
        "ECE 100A": "100",
        "ECE 105": "89",
        "ECE 140": "95",
        "ECE 150": "99",
        "MATH 117": "92"
    }
}
```

Get marks from Fall 2014:
```
>> GET /f14
<< {
    "allAvailable":true,
    "term":"Fall 2014",
    "grades": {
        "ECE 200A": "CR",
        "ECE 205": "99",
        "ECE 222": "98",
        "ECE 240": "99",
        "ECE 250": "97",
        "ECE 290": "100",
        "MATH 215": "100"
    }
}
```

### Response

* If all marks are available: 

```JSON
{
	"allAvailable": true,
    "term": "Fall 2013",
	"grades": {
    	"CHE 102": 95,
    	"ECE 100A": 100,
    	"ECE 105": 89,
    	"ECE 140": 95,
    	"ECE 150": 99,
    	"MATH 117": 92
    }
}
```

* Otherwise:

```JSON
{   
    "allAvailable": false,
    "term": "Fall 2013"
}
```

## Installation:

1. `git clone https://github.com/VictorVation/quest-markscraper.git`
2. `cd quest-markscraper`
3. `npm install`
4. Replace lines 9-10 with your Quest username and password (in a `string`) 
5. `node quest-markscraper.js`
6. Point your browser to `localhost:5000/{term}`
