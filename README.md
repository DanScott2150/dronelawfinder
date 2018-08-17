- For use with StateDroneLaw.com
- Goal: Use OpenStates.org API to keep track of all drone-related laws across all 50 states

- Ideal end result:
--- Program makes API call to OpenStates.org, searches all 50 states for laws with keywords "drone" or "unmanned",
--- Returns JSON data containing all relevant bills & related info,
--- Saves JSON data into .CSV format, to create an excel spreadsheet
--- ##Figure out a way to check new data vs data from last time the program was run? i.e. auto-alert me to new or changed bills?
--- ##Figure out a way to somehow integrate directly with WordPress?

=====8.11=====
  - Core functionality seems to be working. Feel like the code is super messy, will try to re-factor at a later date.
  - Currently, making an API call for "unmanned" keyword and putting the results into an 'allBills' array via a promise. Then,
      second API call for "drone" keyword adds results into same 'allBills' array. Accomplishing this via forEach loop to iterate over each item returned in JSON. Tried using allBills.push() with the JSON data as a whole, but this resulted in nested arrays. Tried using lodash's .merge() function but that didn't seem to work, or maybe I just didn't understand
      how to use it correctly.
  - To-do's:
      -- Add error handling/promise rejection
      -- Right now, .csv data includes brackets & curly brackets for the "sources" and "Action Dates" fields. Find way to remove these when printing to .csv? Also 'Action Dates' includes two name/value pairs, find way to break out into two separate columns?
      -- In the event that a bill uses BOTH keywords "drone" and "unmanned", we end up with a duplicate value in the data.
      -- Break out API key into env variable, so it's not public
      -- Look into specifics/quirks of API. For example, current program should only be returning bills from the "current term", however data for Alabama includes mulitple bills from 2015 & 2016. Also, I remember reading somewhere that OpenStates had issues with certain states due to how their sites/databases are setup
  - Next project:
      -- Is there a way to compare the .csv data to the .csv export from the previous time the program was run? i.e. if I run it for the first time, I get a .csv file back with ~250 bills. If I then run the program again a week later, it shows/alerts me to the specific bills that are either new or have changed since the original run. OpenStates gives each bill a unique ID, so it should be possible to check only for IDs that don't exist. For bills that have changed, should be possible to compare the "last action date" fields?
      -- Is there a way to somehow integrate with WordPress? Or at least get certain values to auto-fill into ACF fields?

===== 8.17 =====
  - Updated data output formatting. Removed unnecessary brackets & curly braces from certain fields, and re-ordered the columns to a more meaningful order. To do this, it now creates a "currentBill" object each time it loops through the API results data., which lets me make minor adjustments to the output of the sources/url field, as well as the last updated dates. Also lets me re-order the output columns just by altering the order that the object properties are defined.
  - API key successfully broken out into .env variable
  - To-do's:
      - Minor UI improvements: app currently takes about 20 seconds to run, show some sort of "loading..." progress update? Also some sort of "success" message upon completion? Maybe some quick stats about how many bills gathered? Also maybe add some metadata to the .csv file, showing 'Date Run:' and maybe other stuff?
      - When Bill has multiple url's under "sources". NY is good case of this. Current code loops through and prints them all, but it's kinda messy/buggy. Look into cleaning up & test it more thoroughly
      - Function for looping through API results and converting to currentBill object => Can we split this into a function and just call that function after each API call? Right now we're copy/pasting the entire process, not very DRY. Also would be useful if I want to expand the search terms at a later time.
      - On that note, could I also make the actual axios API call a function, and pass in the keywords 'drone' and 'unmanned' as parameters? Since there's only two searches, maybe this is unnecessary?
      - Figure out way to compare data.csv to the data.csv from previous app run and auto-show any new or updated bills. Maybe there's an npm package that can just compare the .csv files? Otherwise, maybe I can find a way to look through 'bill id' (OpenStates-assigned unique ID) and compare "last action" dates.
          ---> Another idea, have app search the previous data.csv file and find the most recent "last action" date for any bill in that file. Then, look at the current data.csv and only return values where the last action date is more recent?
      - Find way to incorporate state-specific temporary outages? Per OpenStates, individual states are constantly updating or tweaking their websites/data structures, occasionally API will break or go down for certain states. Way to somehow incorporate this data into app? i.e. Show user "Data not gathered for <states>"
          ---> http://bobsled.openstates.org/ => shows current API status for each state. Could just scrape data from that webpage? In table format, return value of first two <td>'s in each row, with the first one always being the name of the state, and the second always being the status with a class of either "good", "bad", or "empty"
