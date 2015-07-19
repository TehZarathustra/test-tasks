(function() {
	var flightTimetableApp = {

		getData: function(myData, type) {
			$("input.type-filter").attr("disabled", true);
			$('.loading').fadeIn();
			if (type === undefined) {
				type = "all";
			}
			$.getJSON(myData)
				.success(function(data) {
					flightTimetableApp.populateRows(data, type);
					// strings as parameter represents flights
					// unlike modal id's (numbers)
					if (typeof type != "number") {
						flightTimetableApp.init.update();
					}
				})
				.complete(function() {
					$("input.type-filter").removeAttr("disabled");
					$('.loading').fadeOut();
			});
		},

		populateRows: function(data, type) {
			$.each(data.flights, function(i,data) {
			if (type === 'all' || type == data.type) {
				var flight =
					"<tr data-id='"+data.id+"' data-type='"+data.type+"' data-href='#modal'>
						<td class='row-type'>
							<div class='"+data.type+"-icon'></div>
						</td>
						<td class='row-flight'><b>"+data.flight+"</b></td>
						<td class='row-company'><span class='company'>"+data.company+" </span><span class='logo'><img src='"+data.companyLogo+"' alt='logo'></span></td>
						<td class='row-craft'><span class='craft-full'>"+data.craft+"</span><span class='craft-short'>"+data.craftShort+"</span></td>
						<td class='row-destination'>"+data.destinationCity+"<span class='destination-airport'> / "+data.destinationAirPort+"</span></td>
						<td class='row-time'>"+data.arrivalTime+"</td>
						<td class='row-status status-"+data.statusType+"'>"+data.status+"</td>
						<td class='row-other'>"+data.other+"</td>
					</tr>";
				$(flight).appendTo(".flightTable tbody");
			} else if (type == data.id) {
				var modal =
					"<tr><th>Рейс</th><td>"+data.flight+" за "+data.date+"</td></tr>
					<tr><th>Плановое время вылета из аэропорта "+data.startPointAirPort+"</th><td>"+data.takeoffTime+"</td></tr>
					<tr><th>Тип воздушного судна</th><td>"+data.craft+"</td></tr>
					<tr><th>Авиакомпания</th><td>"+data.company+"</td></tr>
					<tr><th>Статус рейса</th><td>"+data.status+"</td></tr>
					<tr><th>Примечание</th><td>"+data.other+"</td></tr>
					<tr><th>Плановый маршрут</th><td>"+data.startPointCity+"("+data.startPointAirPort+")->"+data.destinationCity+"("+data.destinationAirPort+")</td></tr>
					<tr><th>Плановое время начала посадки</th><td>"+data.landingTime+"</td></tr>
					<tr><th>Контроль безопасности</th><td>"+data.landingSecurity+"</td></tr>
					<tr><th>Выход</th><td>"+data.landingExit+"</td></tr>";
				$(".modal-content tbody").html("");
				$(modal).appendTo(".modal-content tbody");
			}
			});
		},

		highlightRows: function() {
			var allCells = $(".flightTable td");
			allCells
				.hover(function() {
					var el = $(this),
					pos = el.index();
					el.parent().find("td").addClass("hover");
					allCells.filter(":nth-child(" + (pos+1) + ")").addClass("hover");
				}, function() {
					allCells.removeClass("hover");
			});
		},

		linkRows: function() {
			$(".flightTable tbody tr").click(function() {
				var el = $(this);
				flightTimetableApp.getData("data.json", el.data("id"));
				window.document.location = el.data("href");
			});
		},


		checkBoxes: function() {
			$('input[name="arrival"],input[name="departure"]').click(function() {
				$('.flightTable tbody').html("");
				var checkedValues = $('.checkboxes input:checkbox:checked').map(function() {
					return this.name;
				}).get();
				if (checkedValues.length == 1) {
					flightTimetableApp.getData("data.json", checkedValues);
				} else if(checkedValues.length == 2) {
					flightTimetableApp.getData("data.json");
				} else {
					$('.flightTable tbody').html("");
				}
			});
		},

		init: {
			start: function() {
				jQuery(document).ready(function() {
					flightTimetableApp.getData("data.json", "departure");
					$('.ts-table-section').floatThead();;
					flightTimetableApp.checkBoxes();
				});
			},
			update: function() {
				flightTimetableApp.linkRows();
				flightTimetableApp.highlightRows();
			}
		}
	}
	flightTimetableApp.init.start();
})(jQuery);

