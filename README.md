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
