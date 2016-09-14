# Usage
Execute the code in 'lpprizetableconvert-use.js' in JavaScript console.
Change the URL to the path to your 'lpprizetableconvert.js' file.

# Conversion rates
The conversion rates are stored in JSON files located in the 'json' folder.
Most conversion stop at the end of 2014, because after that the new prize pool templates were used.

## To add a currency
*Create a 'xxxtousd.json' file and fill it like the other JSON files.
*In 'getRate.php', add a line `case 'xxxtousd':`
With 'xxx' the abbreviation of the currency in lowercase

## Getting rates from xe.com
In the 'special' folder, there is a script named 'xedotcom.js' to help scrap conversion rates from the websites.
A special string must be given as a parameter, in `var text = "..."`

Example with EUR to USD conversion:

1. In Chrome, press F12 to get the development tools, and go to the 'Network' tab.
2. Go to http://www.xe.com/fr/currencycharts/?from=EUR&to=USD&view=10Y
3. In the Network list, find currates.php?from=EUR&to=USD&amount=1&extended=true&_=...
4. Right-click on this item and click on 'Open link in new tab'.
5. Copy-paste the whole contents of this page (one big string) as value of text in 'xedotcom.js'.
6. Copy-paste the whole JavaScript to the JS console (available as a tab next to the 'Network' tab).
7. Execute the code that will output a JSON array of conversion rates per day.
8. Use this array to update eurtousd.json
