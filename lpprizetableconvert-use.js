$.getScript("http://www.tolueno.fr/liquipedia/lpprizetableconvert/lpprizetableconvert.js", function(){
	$.fn.lpprizetableconvert({
		tableOffset: 0,
		tableNumber: 1,
		defaultCurrency: 'USD',
		forceExchangeRate: true,
		showTotalPrize: true,
		game: 'smash'
	});
});