/*! https://mths.be/esrever v<%= version %> by @mathias */
!function(e){var o="object"==typeof exports&&exports,r="object"==typeof module&&module&&module.exports==o&&module,n="object"==typeof global&&global;(n.global===n||n.window===n)&&(e=n);var t=/(<%= allExceptCombiningMarks %>)(<%= combiningMarks %>+)/g,i=/([\uD800-\uDBFF])([\uDC00-\uDFFF])/g,f=function(e){e=e.replace(t,function(e,o,r){return f(r)+o}).replace(i,"$2$1");for(var o="",r=e.length;r--;)o+=e.charAt(r);return o},l={version:"<%= version %>",reverse:f};if("function"==typeof define&&"object"==typeof define.amd&&define.amd)define(function(){return l});else if(o&&!o.nodeType)if(r)r.exports=l;else for(var a in l)l.hasOwnProperty(a)&&(o[a]=l[a]);else e.esrever=l}(this);

$(document).ready(function() {

$.fn.lpprizetableconvert = function(options) {
var tableOffset = parseInt(options.tableOffset),
	tableNumber = parseInt(options.tableNumber),
	defaultCurrency = options.defaultCurrency,
	forceExchangeRate = options.forceExchangeRate,
	showTotalPrize = options.showTotalPrize,
	disableTeams = options.disableTeams !== undefined ? options.disableTeams : false,
	game = options.game !== undefined ? options.game : 'starcraft2',
	type = options.type !== undefined ? options.type : (game == 'starcraft' || game == 'starcraft2' || game == 'hearthstone' || game == 'smash' ? 'individual' : 'team'),
	special = options.special !== undefined ? options.special : false,
	output = options.output !== undefined ? options.output : 'console';

// xe.com is missing the July 4, 2010 for DKK/USD
// xe.com is missing the July 4, 2010 for NOK/USD
// xe.com is missing the July 4, 2010 for ZAR/USD
// xe.com is missing the July 4, 2010 for ILS/USD
// xe.com is missing the July 4, 2010 for CNY/USD

	var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
	var playersWithCaps = ['TBD', 'JYP', 'MMA', 'TOP', 'HSC', 'AMD',
		'ARC', 'CIZ', 'DEHF', 'ESAM', 'IVP', 'KDJ', 'KJH', 'NMW', 'PPMD', 'ROFL', 'SFAT', 'SSH', 'ZCK'];

	Date.prototype.toWikiDate = function() {
		return months[this.getMonth()] + ' ' + this.getDate() + ', ' + this.getFullYear();
	};
	Date.prototype.toISODateOnly = function() {
		return this.getFullYear() +
			'-' + (this.getMonth() < 9 ? 0 : "") + (this.getMonth() + 1) +
			'-' + (this.getDate() < 10 ? 0 : "") + this.getDate();
	};

	function playerWikitext(game, i, player) {
		var wikitext = '|';
		if (player.page !== undefined) {
			wikitext += player.page.replace(/_/g, ' ') + '{{!}}';
		}
		wikitext += player.name + ' ';
		wikitext += '|flag' + i + '=' + player.flag + ' ';
		if (game == 'starcraft' || game == 'starcraft2') {
			wikitext += '|race' + i + '=' + player.race + ' ';
		} else if (game == 'smash') {
			wikitext += '|heads' + i + '=' + player.heads.join(',') + ' ';
		}
		return wikitext;
	}

	function cleanTitle(str) {
		return str[0].toUpperCase() + str.substr(1).replace(/_/g, ' ');
	}

	function playerWithTeamWikitext(game, i, player, team) {
		var wikitext = playerWikitext(game, i, player);
		wikitext += '|team' + i + '=' + team;
		return wikitext;
	}

	function teamWikitext(i, team) {
		var wikitext = '|' + team;
		return wikitext;
	}

	function doublesWikitext(game, i, player1, player2) {
		var wikitext = playerWikitext(game, i + 'p1', player1);
		wikitext += ' ' + playerWikitext(game, i + 'p2', player2);
		return wikitext;
	}

	function parsePlayer(input, global) {
		var playerColumn = input.playerColumn -
			(input.rowspanOffsetEnable ? input.rowspanOffset : 0);
		var $playerCell = input.$this.find('td').eq(playerColumn);
		var player = {flag: '', race: '', heads: [], name: ''};
		var headsCount = 0;
		$playerCell.find('img').each(function() {
			var filename = $(this).attr('src').match(/[^\/]*\.(png|gif)$/)[0];
			if (filename.match(/^(P|T|Z|R)icon_small\.png$/) !== null) {
				player.race = filename.match(/^(P|T|Z|R)icon_small\.png$/)[1].toLowerCase();
			} else if (filename.match(/^18px-([A-Za-z]+)Icon?\.png$/) !== null) {
				player.heads.push(filename.match(/^18px-([A-Za-z]+)Icon?\.png$/)[1]
					.replace(/([A-Z])/g,' $1').replace(/^\s/,'').toLowerCase());
				headsCount++;
			} else if (filename.match(/^[A-Z][a-z][a-z]?\.(png|gif)$/) !== null) {
				player.flag = filename.match(/^([A-Z][a-z][a-z]?)\.(png|gif)$/)[1].toLowerCase();
			}
		});
		if (input.game == 'smash' && headsCount > global.maxheads) {
			global.maxheads = headsCount;
		}
		player.name = $playerCell.text().trim();
		if ($playerCell.find('span > a').length > 0) {
			var page = $playerCell.find('span > a').attr('title').replace(' (page does not exist)', '');
			if (cleanTitle(page) != cleanTitle(player.name)) {
				player.page = page;
			}
		}
		return player;
	}

	function templateTitle(element, game, type, special) {
		var title = ((special == 'challenger' || special == 'codea') && element == 'slot' ? 'Challenger' : 'Prize pool');
		title += ' ' + element;
		if (type == 'team') {
			if (game == 'starcraft' || game == 'starcraft2' || game == 'hearthstone' || game == 'smash') {
				title += ' team';
			}
		} else if (type == 'doubles') {
			title += ' doubles';
		}
		return title;
	}

	function numberWithCommas(x) {
		var parts = x.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	}

	function compareTableDataItems(a, b) {
		if (parseFloat(a.points) > parseFloat(b.points))
			return 1;
		if (parseFloat(a.points) < parseFloat(b.points))
			return -1;
		return 0;
	}

	function compareByPlaceAscThenPointsDesc(a, b) {
		var aSplit = a.split('_'),
			aPlace = parseInt(aSplit[0]),
			aPoints = aSplit[1],
			bSplit = b.split('_'),
			bPlace = parseInt(bSplit[0]),
			bPoints = bSplit[1];
		if (aPlace < bPlace) {
			return -1;
		}
		if (aPlace > bPlace) {
			return 1;
		}
		if (aPoints > bPoints) {
			return -1;
		}
		if (aPoints < bPoints) {
			return 1;
		}
		return 0;
	}

	var columns = {
			place: 0,
			prize1: 1,
			prize2: null,
			prize3: null,
			points: null,
			player: null,
			team: null,
			player1: null,
			player2: null
		},
		currency1, currency1match,
		currency2, currency2match,
		currency3, currency3match,
		usdprizePlace,
		localprizePlace,
		localcurrency,
		localToUsdRate,
		localToUsdRateDate,
		pointsType;

	$('.infobox-cell-2.infobox-description').each(function() {
		if ($(this).text() == 'Date:' || $(this).text() == 'End Date:') {
			var timeOfDay,
				localTimezoneOffset = new Date().getTimezoneOffset();
			if (localTimezoneOffset > 0) {
				timeOfDay = '23:59';
			} else {
				timeOfDay = '00:00';
			}
			localToUsdRateDate = new Date($(this).parent().find('.infobox-cell-2:not(.infobox-description)').text() + ' ' + timeOfDay + ' UTC');
			return;
		}
	});
	if (localToUsdRateDate) {
		console.log('localToUsdRateDate', localToUsdRateDate.toWikiDate(), '- ISO:', localToUsdRateDate.toISODateOnly());
	}

	var $tables = [$('.wikitable, .prizepooltable, .prettytable').eq(tableOffset)];
	console.log(tableOffset);
	for (var i = 1; i < tableNumber; i++) {
		$tables.push($('.wikitable, .prizepooltable, .prettytable').eq(tableOffset + i));
	}
	console.log($tables);

	currency1match = $tables[0].find('tr:first').find('th, td').eq(columns.prize1).text().match(/(^|[^A-Z])([A-Z\$]{3}|AU|Percent)(?![A-Z])/);
	if (currency1match !== null) {
		if (currency1match[2] !== 'WCS' && currency1match[2] !== 'OSC') {
			if (currency1match[2] == 'AU') {
				currency1 = 'AUD';
			} else if (currency1match[2] == 'RMB') {
				currency1 = 'CNY';
			} else if (currency1match[2] == 'Percent') {
				currency1 = 'pcnt';
			} else {
				currency1 = currency1match[2].replace('$','D');
			}
		}
	} else {
		if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1).text().match(/[0-9]/) !== null) {
			currency1match = $tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1).text().match(/(^|[^A-Z])([A-Z\$]{3})(?![A-Z])/);
			if (currency1match !== null	&& $.inArray(currency1match[2], playersWithCaps) === -1) {
				currency1 = currency1match[2].replace('$','D');
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1).text().indexOf('€') !== -1) {
				currency1 = 'EUR';
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1).text().indexOf('£') !== -1) {
				currency1 = 'GBP';
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1).text().indexOf('₩') !== -1) {
				currency1 = 'KRW';
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1).text().indexOf('AU$') !== -1) {
				currency1 = 'AUD';
			} else if (esrever.reverse($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1).text()).match(/\$(?!UA)/) !== null) {
				currency1 = 'USD';
			}
		}
		if (currency1 === undefined) {
			console.log('*** Currency could not be found! *** USD used as default');
			currency1 = defaultCurrency;
		}
	}
	currency2match = $tables[0].find('tr:first').find('th, td').eq(columns.prize1 + 1).text().match(/(^|[^A-Z])([A-Z\$]{3}|Percent|Seed)(?![A-Z])/);
	if (currency2match !== null) {
		if (currency2match[2] !== 'WCS' && currency2match[2] !== 'OSC') {
			columns.prize2 = columns.prize1 + 1;
			if (currency2match[2] == 'Percent') {
				currency2 = 'pcnt';
			} if (currency2match[2] == 'Seed') {
				if (special == 'seedaslocalcurrency')
					currency2 = 'seed';
			} else {
				currency2 = currency2match[2].replace('$','D');
			}
		}
	} else {
		if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1 + 1).text().match(/[0-9]/) !== null) {
			currency2match = $tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1 + 1).text().match(/(^|[^A-Z])([A-Z\$]{3})(?![A-Z])/);
			if (currency2match !== null	&& $.inArray(currency2match[2], playersWithCaps) === -1) {
				currency2 = currency2match[2].replace('$','D');
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1 + 1).text().indexOf('€') !== -1) {
				currency2 = 'EUR';
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1 + 1).text().indexOf('£') !== -1) {
				currency2 = 'GBP';
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1 + 1).text().indexOf('₩') !== -1) {
				currency2 = 'KRW';
			} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1 + 1).text().indexOf('AU$') !== -1) {
				currency2 = 'AUD';
			} else if (esrever.reverse($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize1 + 1).text()).match(/\$(?!UA)/) !== null) {
				currency2 = 'USD';
			}
		}
	}
	if (currency2) {
		columns.prize2 = columns.prize1 + 1;

		currency3match = $tables[0].find('tr:first').find('th, td').eq(columns.prize2 + 1).text().match(/(^|[^A-Z])([A-Z\$]{3})(?![A-Z])/);
		if (currency3match !== null) {
			if (currency3match[2] !== 'WCS' && currency3match[2] !== 'OSC') {
				columns.prize3 = columns.prize2 + 1;
				currency3 = currency3match[2].replace('$','D');
			}
		} else {
			if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize2 + 1).text().match(/[0-9]/) !== null) {
				currency3match = $tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize2 + 1).text().match(/(^|[^A-Z])([A-Z\$]{3})(?![A-Z])/);
				if (currency3match !== null && $.inArray(currency3match[2], playersWithCaps) === -1) {
					currency3 = currency3match[2].replace('$','D');
				} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize2 + 1).text().indexOf('€') !== -1) {
					currency3 = 'EUR';
				} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize2 + 1).text().indexOf('£') !== -1) {
					currency3 = 'GBP';
				} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize2 + 1).text().indexOf('₩') !== -1) {
					currency3 = 'KRW';
				} else if ($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize2 + 1).text().indexOf('AU$') !== -1) {
					currency3 = 'AUD';
				} else if (esrever.reverse($tables[0].find('tr:nth-child(2)').find('th, td').eq(columns.prize2 + 1).text()).match(/\$(?!UA)/) !== null) {
					currency3 = 'USD';
				}
			}
		}

		if (currency3) {
			columns.prize3 = columns.prize2 + 1;
		}
	}
	var lastPrizeColumn = columns.prize3 > 0 ? columns.prize3 : (columns.prize2 > 0 ? columns.prize2 : columns.prize1);
	var searchForPointsText = $tables[0].find('tr:first').find('th, td').eq(lastPrizeColumn + 1).text().trim();
	if (special == 'tsl4') {
		pointsType = 'tsl4';
	} else if (special == 'challenger' || special == 'codea') {
		pointsType = 'wcs201X';
	} else if (special == 'paidTrip' || special == 'seed') {
		pointsType = 'seed';
	}
	if (searchForPointsText.toLowerCase().indexOf('points') !== -1 ||
		searchForPointsText == 'Percent' ||
		searchForPointsText == 'Seed') {
		if (!pointsType) {
			if (searchForPointsText == 'Percent') {
				pointsType = 'pcnt';
			} else if (searchForPointsText == 'Seed') {
				pointsType = 'seed';
			} else if (searchForPointsText.indexOf('OSC') !== -1) {
				pointsType = 'osc';
			} else {
				pointsType = 'points';
			}
		}
		columns.points = lastPrizeColumn + 1;
		if (type == 'individual' || type == 'singles') {
			columns.player = lastPrizeColumn + 2;
			columns.team = lastPrizeColumn + 3;
		} else if (type == 'team') {
			columns.team = lastPrizeColumn + 2;
		} else if (type == 'doubles') {
			columns.player1 = lastPrizeColumn + 2;
			columns.player2 = lastPrizeColumn + 3;
		}
		if (!currency2 && pointsType != 'seed' && 
			$tables[0].find('tr:first').find('th, td').eq(lastPrizeColumn + 2).text().trim() == 'Seed') {
			currency2 = 'seed';
			columns.prize2 = lastPrizeColumn + 2;
			if (type == 'individual' || type == 'singles') {
				columns.player++;
				columns.team++;
			} else if (type == 'team') {
				columns.team++;
			} else if (type == 'doubles') {
				columns.player1++;
				columns.player2++;
			}
		}
	} else {
		if (type == 'individual' || type == 'singles') {
			columns.player = lastPrizeColumn + 1;
			columns.team = lastPrizeColumn + 2;
		} else if (type == 'team') {
			columns.team = lastPrizeColumn + 1;
		} else if (type == 'doubles') {
			columns.player1 = lastPrizeColumn + 1;
			columns.player2 = lastPrizeColumn + 2;
		}
	}
	console.log('Columns', columns,
		'Currencies', {
		'currency1': currency1,
		'currency2': currency2,
		'currency3': currency3
	});
	if (currency1 == 'USD') {
		usdprizePlace = 0;
		if (currency2) {
			localprizePlace = 1;
			localcurrency = currency2;
		}
	} else if (currency2 == 'USD') {
		localprizePlace = 0;
		localcurrency = currency1;
		usdprizePlace = 1;
	} else {
		localprizePlace = 0;
		localcurrency = currency1;
	}

	var deferred = $.Deferred();
	if (localcurrency && forceExchangeRate) {
		switch (localcurrency.toLowerCase()) {
		case 'eur':
		case 'sek':
		case 'nok':
		case 'dkk':
		case 'gbp':
		case 'krw':
		case 'ron':
		case 'aud':
		case 'zar':
		case 'cad':
		case 'rub':
		case 'ils':
		case 'pln':
		case 'chf':
		case 'cny':
		case 'ars':
		case 'jpy':
		case 'hrk':
		case 'btc':
		case 'czk':
		case 'brl':
			var conversionJson = 'http://tolueno.fr/liquipedia/lpprizetableconvert/getRate.php?jsoncallback=?';
			$.getJSON(conversionJson,
				{
					change: localcurrency.toLowerCase() + 'tousd',
					date: localToUsdRateDate.toISODateOnly()
				},
				function(data) {
					console.log('getJSON', data);
					localToUsdRate = data.rate;
					deferred.resolve();
				});
			break;
		default:
		}
	} else {
		localToUsdRate = 0;
		deferred.resolve();
	}

	deferred.done(function() {
		if (localcurrency) {
			if (forceExchangeRate) {
				console.log('localcurrency', localcurrency, '- 1', localcurrency, '=', localToUsdRate, 'USD');
			} else {
				console.log('localcurrency', localcurrency);
			}
		}

		var tableData = {};
		var mem = 0, memPl, memPrizes, memPoints;
		var rowspanOffset = 0, rowspanOffsetEnable = false;
		var global = {maxheads: 1}; //smash
		for (var j = 0; j < $tables.length; j++) {
			$.each($tables[j].find('tr'), function(trIndex) {
				var pl, prizes, points = '';

				var localColumns = $.extend({}, columns),
					localColumnOffsets = $.extend({}, columns),
					column = 0;
				$.each(localColumnOffsets, function(key, value) {
					localColumnOffsets[key] = 0;
				});
				$(this).find('td').each(function() {
					if ($(this).attr('colspan') !== undefined &&
						parseInt($(this).attr('colspan')) > 1) {
						$.each(columns, function(key, value) {
							if (value > column) {
								localColumnOffsets[key] += parseInt($(this).attr('colspan')) - 1;
							}
						});
						column += parseInt($(this).attr('colspan'));
					} else {
						++column;
					}
				});
				$.each(localColumnOffsets, function(key, value) {
					localColumns[key] = columns[key] - value;
				});

				if (mem > 0) {
					pl = memPl;
					prizes = memPrizes;
					points = memPoints;
					mem--;
					rowspanOffsetEnable = true;
				} else {
					pl = $(this).find('td').eq(localColumns.place).text().trim().replace(/(th|st|nd|rd)\b/g, '').replace(/\//g, '-');
					if (pl === '') {
						var medalSpan = $(this).find('td').eq(localColumns.place).find('span').first();
						if (medalSpan.length == 1) {
							switch (medalSpan.attr('title')) {
								case 'First Place': pl = 1; break;
								case 'Second Place': pl = 2; break;
								case 'Third Place': pl = 3; break;
								case 'Semifinalist(s)': pl = '3-4'; break;
							}
						}
					}
					prizes = [];
					if (special == 'tsl4') {
						if (pl == 1) { prizes.push(100); points = 'Seed'; }
						else if (pl == 2) { prizes.push(50); points = 100; }
						else if (pl == '3-4') { prizes.push(25); points = 60; }
						else if (pl == '5-8') { prizes.push(0); points = 41; }
						else if (pl == '9-16') { prizes.push(0); points = 21; }
						else if (pl == '17-32') { prizes.push(0); points = 11; }
					} else if (special == 'challenger' && pl.substr(0, 2) == '1-') {
						prizes.push('premier');
						localColumns.points = null;
						--localColumns.player;
						--localColumns.team;
					} else if (special == 'codea' &&
						(pl.substr(0, 2) == '1-' || pl.substr(0, 3) == '13-' || pl == 25)) {
						prizes.push('code s');
						localColumns.points = null;
						localColumns.player -= 2;
						localColumns.team -= 2;
					} else {
						if (special == 'paidTrip') {
							points = ($(this).find('td').eq(localColumns.prize1).text().trim().toLowerCase().indexOf('paid trip') !== -1 ? 'Paid Trip' : 0);
						} else if (special == 'seed') {
							points = ($(this).find('td').eq(localColumns.prize1).text().trim().toLowerCase().indexOf('seed') !== -1 ? 'Seed' : 0);
						}
						prizes.push($(this).find('td').eq(localColumns.prize1).text().trim().replace(/[A-Za-z]+\.\s/g, '').replace(/\s\+\s.+/g, '').replace(/[^0-9\.]/g, ''));
						if (localColumns.prize2) {
							prizes.push($(this).find('td').eq(localColumns.prize2).text().trim().replace(/[A-Za-z]+\.\s/g, '').replace(/\s\+\s.+/g, '').replace(/[^0-9\.]/g, ''));
						}
						if (localColumns.points !== null) {
							if (pointsType == 'seed') {
								points = $(this).find('td').eq(localColumns.points).text().trim();
							} else {
								points = $(this).find('td').eq(localColumns.points).text().trim().replace(/[^0-9\.%]/g, '');
							}
						}
					}

					mem = 0;
					rowspanOffset = 0;
					if ($(this).find('td').eq(0).attr('rowspan') !== undefined) {
						if (parseInt($(this).find('td').eq(0).attr('rowspan')) > 1) {
							mem = parseInt($(this).find('td').eq(0).attr('rowspan')) - 1;
							memPl = pl;
							memPrizes = prizes;
							memPoints = points;
							$(this).find('td').each(function() {
								if ($(this).attr('rowspan') !== undefined) {
									rowspanOffset++;
								}
							});
						}
					}
					rowspanOffsetEnable = false;
				}

				// The following is only for player rows
				if ($(this).find('.collapseButton').length > 0 || (j === 0 && trIndex === 0)) {
					return true;
				}

				var parsePlayerInput, player, team, player1, player2;
				
				if (type == 'individual' || type == 'singles') {
					parsePlayerInput = {
						game: game,
						$this: $(this),
						playerColumn: localColumns.player,
						rowspanOffsetEnable: rowspanOffsetEnable,
						rowspanOffset: rowspanOffset
					};
					player = parsePlayer(parsePlayerInput, global);
				}

				if (type == 'individual' || type == 'singles' || type == 'team') {
					var $teamCell = $(this).find('td').eq(localColumns.team - (rowspanOffsetEnable ? rowspanOffset : 0));
					$teamCell.find('span:not(.team-template-image):not(.team-template-text):not(.team-template-team-short):not(.team-template-team-standard):hidden').text('');
					team = $teamCell.text().trim().toLowerCase();
					if (team === 'zzzzz') {
						team = '';
					}
					team = team.replace(/^esc gaming$/, 'esc')
						.replace(/^team exile5$/, 'exile5')
						.replace(/^ence esports5$/, 'ence')
						.replace(/^team roccat$/, 'roccat')
						.replace(/^zenith of origin$/, 'zoo')
						.replace(/^cm storm$/, 'cmstorm')
						.replace(/^deimos esports$/, 'deimos')
						.replace(/^micro gamerz$/, 'microgamerz')
						.replace(/^kaos latin gamers$/, 'klg')
						.replace(/^team menace.fi$/, 'menace.fi')
						.replace(/^aposis gaming$/, 'aposis')
						.replace(/^seed gaming$/, 'seed')
						.replace(/^iplay esports$/, 'iplay')
						.replace(/^team quetzal$/, 'quetzal')
						.replace(/^alt-tab.gaming$/, 'alt tab gaming')
						.replace(/^storm clan$/, 'storm')
						.replace(/^rebirth esports$/, 'rebirth')
						.replace(/^mith esports$/, 'mith')
						.replace(/^archaic esports$/, 'archaic')
						.replace(/^clan alternative$/, 'alternative')
						.replace(/^xtc$/, 'xperts@total.chaos')
						.replace(/^bravado$/, 'bravado gaming')
						.replace(/^brazilarmy esports$/, 'brazil army')
						.replace(/^get over it gaming$/, 'govt gaming')
						.replace(/^xpg e-sports$/, 'xpg')
						.replace(/^nifhleim gaming$/, 'nflg')
						.replace(/^imperium pro team$/, 'imperium')
						.replace(/^pro dolly$/, 'dolly')
						.replace(/^team epidemic$/, 'epidemic')
						.replace(/^melee it on me$/, 'miom')
						.replace(/^core gaming$/, 'core')
						.replace(/^anexis esports$/, 'anexis')
						.replace(/^gsu gaming$/, 'gsu')
						.replace(/^team extensive$/, 'extensive')
						.replace(/^knights* gaming$/, 'knights')
						.replace(/^duskbin e-sports$/, 'duskbin')
						.replace(/^new ӗra gaming$/, 'new era gaming')
						.replace(/^carnage esports$/, 'carnage')
						.replace(/^děravá kapsa$/, 'derava kapsa')
						.replace(/^ence esports$/, 'ence')
						.replace(/^esfx tv$/, 'esfxtv')
						.replace(/^buykey e-sports$/, 'buykey esports')
						.replace(/^teamnyancat$/, 'nyan')
						.replace(/^artyk gaming$/, 'artyk')
						.replace(/^8th team$/, 'team 8')
						.replace(/^mortal teamwork$/, 'mtw')
						.replace(/^extreme supremacy$/, 'team extreme supremacy');
				} else if (type == 'doubles') {
					parsePlayerInput = {
						game: game,
						$this: $(this),
						playerColumn: localColumns.player1,
						rowspanOffsetEnable: rowspanOffsetEnable,
						rowspanOffset: rowspanOffset
					};
					player1 = parsePlayer(parsePlayerInput, global);
					
					parsePlayerInput.playerColumn = localColumns.player2;
					player2 = parsePlayer(parsePlayerInput, global);
				}

				var slot = pl + '_' + points;
				if (!(slot in tableData)) {
					tableData[slot] = [];
				}
				var tableDataItem = {};
				tableDataItem.place = pl;
				if (type == 'individual' || type == 'singles') {
					tableDataItem.player = player;
				}
				if (type == 'individual' || type == 'singles' || type == 'team') {
					tableDataItem.team = team;
				} else if (type == 'doubles') {
					tableDataItem.player1 = player1;
					tableDataItem.player2 = player2;
				}
				if (usdprizePlace >= 0) {
					tableDataItem.usdprize = prizes[usdprizePlace];
				}
				if (localprizePlace >= 0) {
					tableDataItem.localprize = prizes[localprizePlace];
					if (forceExchangeRate || (!('usdprize' in tableDataItem) && localToUsdRate >= 0)) {
						tableDataItem.usdprize = (prizes[localprizePlace] * localToUsdRate).toFixed(2);
					}
				}
				if (pointsType !== undefined) {
					tableDataItem.points = points;
				}
				tableData[slot].push(tableDataItem);
			});
			if (special == 'ifeng') {
				if (tableData['4-8_'] !== undefined) {
					tableData['4_'] = [];
					tableData['5-8_'] = [];
					tableData['4_'].push(tableData['4-8_'].shift());
					while(tableData['4-8_'].length > 0) {
						tableData['5-8_'].push(tableData['4-8_'].shift());
					}
					tableData['4-8_'] = null;
					delete tableData['4-8_'];
				}
			}
		}
		console.log(tableData);

		// Prize pool start
		var wikitext = '{{' + templateTitle('start', game, type, special);
		if (localprizePlace >= 0) {
			wikitext += '|localcurrency=' + localcurrency.toLowerCase();
		}
		if (pointsType !== undefined) {
			wikitext += '|points=' + pointsType;
		}
		if (disableTeams) {
			wikitext += '|disable_teams=true';
		}
		if (game == 'smash' && global.maxheads != 3) {
			wikitext += '|maxheads=' + global.maxheads;
		}
		wikitext += '}}\n';
		
		// Prize pool slots
		var usdprizeTotal = 0,
			localprizeTotal = 0;
		var slots = [];
		for (var tableSlot in tableData) {
			slots.push(tableSlot);
		}
		slots.sort(compareByPlaceAscThenPointsDesc);
		console.log('slots', slots);
		for (var s = 0; s < slots.length; s++) {
			var slot = slots[s];
			var rowWikitext = '{{' + templateTitle('slot', game, type, special);
			rowWikitext += '|place=' + tableData[slot][0].place;
			rowWikitext += '|usdprize=';
			if ('usdprize' in tableData[slot][0]) {
				if (!isNaN(parseFloat(tableData[slot][0].usdprize))) {
					rowWikitext += (tableData[slot][0].usdprize === 0 ? '0' : numberWithCommas(tableData[slot][0].usdprize));
					if (tableData[slot][0].usdprize) {
						usdprizeTotal += tableData[slot].length * parseFloat(tableData[slot][0].usdprize);
					}
				} else {
					rowWikitext += tableData[slot][0].usdprize === '' ? '0' : tableData[slot][0].usdprize;
				}
			}
			if ('localprize' in tableData[slot][0]) {
				if (!isNaN(parseFloat(tableData[slot][0].localprize))) {
					rowWikitext += '|localprize=' + (tableData[slot][0].localprize === 0 ? 0 : numberWithCommas(tableData[slot][0].localprize));
					if (tableData[slot][0].localprize) {
						localprizeTotal += tableData[slot].length * parseFloat(tableData[slot][0].localprize);
					}
				} else {
					rowWikitext += tableData[slot][0].localprize === '' ? '0' : tableData[slot][0].localprize;
				}
			}
			if ('points' in tableData[slot][0]) {
				rowWikitext += '|points=' + numberWithCommas(tableData[slot][0].points);
			}
			rowWikitext += '\n';
			for (var n = 0; n < tableData[slot].length; n++) {
				if (type == 'individual' || type == 'singles') {
					if (options.disableTeams) {
						rowWikitext += playerWikitext(game, n + 1, tableData[slot][n].player).trim() + '\n';
					} else {
						rowWikitext += playerWithTeamWikitext(game, n + 1, tableData[slot][n].player, tableData[slot][n].team) + '\n';
					}
				} else if (type == 'team') {
					rowWikitext += teamWikitext(n + 1, tableData[slot][n].team) + '\n';
				} else if (type == 'doubles') {
					rowWikitext += doublesWikitext(game, n + 1, tableData[slot][n].player1, tableData[slot][n].player2) + '\n';
				}
			}
			if ((type == 'individual' || type == 'singles' || type == 'team') && tableData[slot].length == 1) {
				rowWikitext = rowWikitext.replace(/\n/gm, '');
			}
			rowWikitext += '}}\n';
			wikitext += rowWikitext;
		}
		// Prize pool end
		wikitext += '{{' + templateTitle('end', game, type, special) + '}}';

		if (localToUsdRate) {
			var localAmount = 1,
				usdAmount;
			if (localToUsdRate < 0.001) {
				localAmount = 1000;
				usdAmount = (1000 * localToUsdRate).toFixed(5);
			} else if (localToUsdRate < 0.1) {
				localAmount = 10;
				usdAmount = (10 * localToUsdRate).toFixed(5);
			} else {
				usdAmount = localToUsdRate.toFixed(5);
			}
			wikitext += '\n\'\'Converted USD prizes are based on the currency exchange rate (taken from [http://xe.com xe.com]) on ' +
				localToUsdRateDate.toWikiDate() + ': ' +
				numberWithCommas(localAmount) + ' ' + localcurrency.toUpperCase() + ' = ' + usdAmount + ' USD.\'\'';
		}
		if (showTotalPrize) {
			//wikitext += '\n\nTotal prize pool:';
			if (localcurrency) {
				wikitext += '\n|prizepool=' + numberWithCommas(localprizeTotal) + ' ' + localcurrency.toUpperCase();
				wikitext += '\n|prizepoolusd=$' + numberWithCommas(usdprizeTotal.toFixed(2));
			} else {
				wikitext += '\n|prizepool=$' + numberWithCommas(usdprizeTotal);
			}
		}
		if (typeof output === 'object') {
			output.text(wikitext);
		} else if (output == 'console') {
			console.log('\n' + wikitext);
		}
	});
};

});