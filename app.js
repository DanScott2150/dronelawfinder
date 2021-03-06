///// ***** OpenStates.org API Documentation: ***** /////
//http://docs.openstates.org/en/latest/api/index.html

//Currently using v1 of the API. v2 still in alpha mode and doesn't seem to provide
//bill-search functionality (yet). Also uses GraphQL rather than REST api calls.

// const request = require("request"); //can uninstall?
// const _ = require('lodash'); //can uninstall?
// const argv = require('yargs').argv;  //can uninstall?

require('dotenv').config();
const axios = require("axios");
const fs = require('fs');
const json2csvParser = require('json2csv').Parser;

var openStatesKey = process.env.OPENSTATESAPIKEY;     //API key stored as environment variable
var openStatesURL = "https://openstates.org/api/v1/";
var fields = "bill_id,title,state,session,action_dates.last,action_dates.signed,sources"  //string passed directly into API URL

// var queries = ["unmanned", "drones", "drone"]; //for future use DRY code? Loop over each query and make an API?

// var states = ["MN", "MA", "NY"]; //(used for testing purposes to prevent excessive lenghty API calls. Comment in/out based on development/production)
var states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE",
"FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA",
"MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH",
"NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
"TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

var allBills = [];

//Basic overview:
// -> For Each state in States array:
// --> Run API call to OpenStates, return promise via axios
// ---> Loop through results, add each to allBills array. Return allBills as promise
// --> Run second API call to OpenStates, return promise via axios
// ---> Loop through second set of results, adding each to allBills array. Return allBills as promise
// --> Using json2csv package, parse allBills data into .csv format & export to external file


//Loop through each state and make API calls via axios
states.forEach(function(state){
  function runUnmannedCall(){
    //First, run API call for the keyword "Unmanned"
    // -- need to run calls for both "unmanned" and "drone" because bills sometimes refer to "unmanned aerial vehicles" in place of "drones"
    return axios.get(`https://openstates.org/api/v1/bills/?state=${state}&search_window=term&q=unmanned&fields=${fields}&apikey=${openStatesKey}`);
    //'search_window=term' limits results to only the state's current legislative term/session/year, prevents old data from prior years being pulled
  }
    runUnmannedCall().then((response) => {

      //With the data returned from the API call, run a for-loop
      //to cycle through each object and add it to the allBills array.

      //Can't just use allBills.push(response.data) since this ultimately creats an array of arrays contianing objects
      //This creates problems when the second set of data (from the second API call below) was also added to allBills,
      //and ultimately caused the csv-parser to become really buggy.


      for(var i=0; i<response.data.length; i++){

        let currentBill = {};
          //order properties based on desired .csv column order
          currentBill.state = response.data[i].state;
          currentBill.bill_id = response.data[i].bill_id;
          currentBill.title = response.data[i].title;
          currentBill.session = response.data[i].session;

          //action_dates field returns an object with "last update" and "signed date", need to parse out into two separate values
          let lastActionFull = response.data[i].action_dates.last;
            currentBill.lastAction = lastActionFull.slice(0, -9);         //Remove the timestamp (format 00:00:00), leaving just the date
            currentBill.signed = response.data[i].action_dates.signed;    //returns null if bill hasn't been signed into law

        if(response.data[i].sources.length === 1){
          //"source" data returns as an array of {'url':url} objects
          //NY has this happen frequently, for example.
          //We need to extract just the actual url, rather than [{'url':url}] which is an inconvenience in spreadsheet format
          currentBill.source = response.data[i].sources[0].url;   //extract only the URL from the response
        } else {
          //If there's multiple sources, print them all.
          //I haven't actually seen an instance with multiple sources, so this code is still untested
          for(j=0; j<response.data[i].sources.length; j++){
            currentBill.source += response.data[i].sources[j].url + "|"
          }
        }

        //unique ID generated by OpenStates system. Ultimately don't think I'll actually need this, but
        //including it for now, might be helpful for investigating things like results containing duplicate Bills
        currentBill.id = response.data[i].id;

        // console.log(currentBill);
        allBills.push(currentBill);
      }

      return new Promise ((resolve, reject) => {
          resolve(allBills);

        }).then((response) => {
          //Run second API call for the same state, using 'drone' keyword
          return axios.get(`https://openstates.org/api/v1/bills/?state=${state}&search_window=term&q=drone&fields=${fields}&apikey=${openStatesKey}`);

        }).then((response) => {
          //Loop through responses and add to allBills array
          // *** This is the same as above. Can we split this out into a function for more DRY-code?
          for(var i=0; i<response.data.length; i++){
            let currentBill = {};
              currentBill.state = response.data[i].state;
              currentBill.bill_id = response.data[i].bill_id;
              currentBill.title = response.data[i].title;
              currentBill.session = response.data[i].session;
            let lastActionFull = response.data[i].action_dates.last;
              currentBill.lastAction = lastActionFull.slice(0, -9);
              currentBill.signed = response.data[i].action_dates.signed;

            if(response.data[i].sources.length === 1){
              currentBill.source = response.data[i].sources[0].url;
            } else {
              for(j=0; j<response.data[i].sources.length; j++){
                currentBill.source += response.data[i].sources[j].url + "|"
              }
            }

            currentBill.id = response.data[i].id;
            allBills.push(currentBill);
          }

          return new Promise((resolve, reject) => {
            resolve(allBills);

          }).then((response) => {

            //Parse data from allBills into .csv format
            //uses 'json2csv' module: https://www.npmjs.com/package/json2csv
            var csvData = allBills;
            const parser = new json2csvParser();
            const csv = parser.parse(csvData);

            //Save .CSV formatted data into external file
            fs.writeFile('data.csv', csv, (err) => {
              if(err){console.log(err)}
            });

          }); //.then => Parse to CSV
        }); //.then => Add 'drone' API call to allBills
    }); //initial 'unmanned' API call
  }); //forEach(states)
