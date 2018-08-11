
// const request = require("request");
const axios = require("axios");
const _ = require('lodash');
const argv = require('yargs').argv;

const fs = require('fs');
const json2csvParser = require('json2csv').Parser;

//OpenStates.org API Documentation:
//http://docs.openstates.org/en/latest/api/index.html

var openStatesKey = "5894d791-dfab-4a95-9e60-2613f8d9ea90";
var openStatesURL = "https://openstates.org/api/v1/";
var fieldsTemp = "bill_id,title,state,session,action_dates.last,action_dates.signed,sources"

//session,action_dates.last,action_dates.signed,sources
// var fields = ['bill_id','title','session','action_dates.last','action_dates.signed','sources'];
const searchFields = ['bill_id','title','state'];
//'session','action_dates.last','action_dates.signed','sources'
// const opts = { searchFields };

var currentBills = [];

var queries = ["unmanned", "drones", "drone"];
var allBills = [];
// var states = ["NY", "MA", "NJ"];
var states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE",
"FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA",
"MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH",
"NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
"TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];

var billData;

var tempState = "nj";

states.forEach(function(state){
  function runUnmannedCall(){
    return axios.get(`https://openstates.org/api/v1/bills/?state=${state}&search_window=term&q=unmanned&fields=${fieldsTemp}&apikey=${openStatesKey}`);
  }
    runUnmannedCall().then((response) => {
      for(var i=0; i<response.data.length; i++){
        allBills.push(response.data[i]);
      }
      // console.log(allBills);
      var unmannedResults = response.data[0];  //SAVED AS A JSON OBJECT
      // console.log("Unmanned: ", unmannedResults);
      // console.log(typeof(unmannedResults));
      // console.log(response.data[]);
      return new Promise ((resolve, reject) => {
          // allBills.push(unmannedResults);
          // console.log("UR: ", allBills);
          resolve(allBills);
        }).then((response) => {   //AllBills currently JSON object
          return axios.get(`https://openstates.org/api/v1/bills/?state=${state}&search_window=term&q=drone&fields=${fieldsTemp}&apikey=${openStatesKey}`);
        }).then((response) => {
          for(var i=0; i<response.data.length; i++){
            allBills.push(response.data[i]);
          }
          // console.log(allBills);
          // var droneResults = response.data;
          // console.log("DR: ", typeof(droneResults));
          // console.log("Drone Results:", droneResults);
          // var newAll = _.concat(allBills, droneResults);
          // console.log(newAll);
          // _.merge()
          // _.merge(droneResults, unmannedResults);
          // console.log(unmannedResults);
          // allBills.push(droneResults);
          // console.log(allBills);
          return new Promise((resolve, reject) => {
            resolve(allBills);
          }).then((response) => {
            var tempVar = allBills;
            // console.log(tempVar);
            // console.log(tempVar);
            // console.log(allBills[0]);
            // console.log(allBills);
            // let fields = ['title', 'state', 'id', 'bill_id'];
            // var parserOpts = { fields };
            // console.log(parserOpts);
            const parser = new json2csvParser();
            // console.log(parser);
            const csv = parser.parse(tempVar);
            // console.log(csv);

            // var data = JSON.stringify(allBills);
            // var data2 = JSON.parse(data);
            // console.log(csv);
            fs.writeFile('data.csv', csv, (err) => {
              if(err){console.log(err)}
            });

          });
        });
    });




  });


//
// request(`https://openstates.org/api/v1/bills/?state=nj&search_window=term&q=unmanned&fields=${fields}&apikey=${openStatesKey}`,
//   (error, response, body) => {
//     if(error){
//       console.log(error);
//     } else {
//       //Loop through each object
//       let bills = JSON.parse(body);
//
//       const parser = new json2csvParser(opts);
//       const csv = parser.parse(bills);
//       // fs.writeFile('data.csv', csv, (err) => {
//       //   if (err){console.log(err);}
//       // });
//       // return bills;
//       bills.forEach(function(bill){
//         return new Promise((resolve, reject) => {
//           if(bill){
//             resolve(bill);
//           }
//         });
//         currentBills.push(bill);
//       });
//       console.log(currentBills);
//
//     }
// }).then((response) => {
//   currentBills.push(response);
// }).then((response) => {
//   console.log(currentBills);
// });
