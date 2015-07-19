/**
 * Реализация API, не изменяйте ее
 * @param {string} url
 * @param {function} callback
 */
function getData(url, callback) {
	var RESPONSES = {
		'/countries': [
			{name: 'Cameroon', continent: 'Africa'},
			{name :'Fiji Islands', continent: 'Oceania'},
			{name: 'Guatemala', continent: 'North America'},
			{name: 'Japan', continent: 'Asia'},
			{name: 'Yugoslavia', continent: 'Europe'},
			{name: 'Tanzania', continent: 'Africa'}
		],
		'/cities': [
			{name: 'Bamenda', country: 'Cameroon'},
			{name: 'Suva', country: 'Fiji Islands'},
			{name: 'Quetzaltenango', country: 'Guatemala'},
			{name: 'Osaka', country: 'Japan'},
			{name: 'Subotica', country: 'Yugoslavia'},
			{name: 'Zanzibar', country: 'Tanzania'},
		],
		'/populations': [
			{count: 138000, name: 'Bamenda'},
			{count: 77366, name: 'Suva'},
			{count: 90801, name: 'Quetzaltenango'},
			{count: 2595674, name: 'Osaka'},
			{count: 100386, name: 'Subotica'},
			{count: 157634, name: 'Zanzibar'}
		]
	};
 
	setTimeout(function () {
		var result = RESPONSES[url];
		if (!result) {
			return callback('Unknown url');
		}

		callback(null, result);
	}, Math.round(Math.random * 1000));
}
 
/**
 * Ваши изменения ниже
 */

// На случай, если пользователь ввел название страны/города с маленькой буквы
String.prototype.capitalizeFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

var requests = ['/countries', '/cities', '/populations'];
var responses = {};
// пользовательский ввод
var user = prompt("Which city/country's population you are concerned with?").capitalizeFirstLetter();


// for заменен на forEach, чтобы связать цикл с getData и callback
requests.forEach(function(item, i, requests) {
	var request = requests[i];
	var callback = function (error, result) {
		responses[request] = result;
		var l = [];
		for (K in responses)
			l.push(K);
		if (l.length == 3) {
			// реализация диалога с пользователем; новые переменные (userCities, userPopulations)
			var c = [], cc = [], p = 0, userCities = [], userPopulations = 0;
			for (i = 0; i < responses['/countries'].length; i++) {
				if (responses['/countries'][i].continent === 'Africa') {
					c.push(responses['/countries'][i].name);
				}
			}
 
			for (i = 0; i < responses['/cities'].length; i++) {
				for (j = 0; j < c.length; j++) {
					if (responses['/cities'][i].country === c[j]) {
						cc.push(responses['/cities'][i].name);
					}
				}
				// реализация диалога с пользователем; совпадает ли город/страна с вводом, совпадает - заносим в массив
				if (responses['/cities'][i].name == user || responses['/cities'][i].country == user) {
				   userCities.push(responses['/cities'][i].name);
				}  
			}
			for (i = 0; i < responses['/populations'].length; i++) {
				for (j = 0; j < cc.length; j++) {
					if (responses['/populations'][i].name === cc[j]) {
						p += responses['/populations'][i].count;
					}
				}
				// реализация диалога с пользователем; перебираем пользовательский массив, считаем популяцию
				for (j = 0; j < userCities.length; j++) {
					if (responses['/populations'][i].name === userCities[j]) {
						userPopulations += responses['/populations'][i].count;
					}
				}
			}
 
			console.log('Total population in African cities: ' + p);
			// реализация диалога с пользователем; проверяем наличие городов/города и выводим данные
			if (userCities.length > 0) {
				console.log('Total population in '+user+': '+userPopulations);
			} else {
				console.log(user+' not found');
			}
		}
	};
 
	getData(request, callback);
});