///// ***** OpenStates.org API Documentation: ***** /////
//http://docs.openstates.org/en/latest/api/index.html

// const request = require("request"); //can uninstall?
// const _ = require('lodash'); //can uninstall?
// const argv = require('yargs').argv;  //can uninstall?


const axios = require("axios");
const fs = require('fs');
const json2csvParser = require('json2csv').Parser;

var openStatesKey = "5894d791-dfab-4a95-9e60-2613f8d9ea90";
var openStatesURL = "https://openstates.org/api/v1/";
var fields = "bill_id,title,state,session,action_dates.last,action_dates.signed,sources"  //passed directly into API URL

// var queries = ["unmanned", "drones", "drone"]; //for future use DRY code? Loop over each query and make an API?
// var states = ["NY", "MA", "NJ"]; //(used for testing purposes)
var states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE",
"FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA",
"MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH",
"NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
"TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

var allBills = [];

//Loop through each state and make API calls
states.forEach(function(state){
  function runUnmannedCall(){
    //First, run API call for the keyword "Unmanned"
    // -- need to run calls for both "unmanned" and "drone" because most bills only refer to one or the other exclusively
    return axios.get(`https://openstates.org/api/v1/bills/?state=${state}&search_window=term&q=unmanned&fields=${fields}&apikey=${openStatesKey}`);
    //'search_window=term' limits results to only the state's current legislative term/session/year, prevents old data from being pulled
  }
    runUnmannedCall().then((response) => {

      //With the data returned from the API call, run a for-loop
      //to cycle through each object and add it to the allBills array.

      //Originally I used allBills.push(response.data), which was much shorter & cleaner, but that returned
      //an array into an array, thus turning allBills into an array of arrays containing objects.
      //This created problems when the second set of data (from the API call below) was also added to
      //allBills, and caused the csv-parser to become buggy. There's probably an easier/cleaner way to solve
      //this problem, but this works for now
      for(var i=0; i<response.data.length; i++){
        allBills.push(response.data[i]);
      }

      return new Promise ((resolve, reject) => {
          resolve(allBills);

        }).then((response) => {
          //Run second API call for the same state, using 'drone' keyword
          return axios.get(`https://openstates.org/api/v1/bills/?state=${state}&search_window=term&q=drone&fields=${fields}&apikey=${openStatesKey}`);

        }).then((response) => {
          //Loop through responses and add to allBills array
          for(var i=0; i<response.data.length; i++){
            allBills.push(response.data[i]);
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
