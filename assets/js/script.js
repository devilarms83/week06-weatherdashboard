// Run when document is ready
$(document).ready(function () {
    
    // jQuery on click function call - search button
    $('#searchBtn').on("click", function () {
        
        var searchVal = $('#cityInput').val().toUpperCase()

        if (searchVal == "") {
            $('#validation').text("Search empty or city not found!")
            $('#validation').css({ 'color': 'red','font-style': 'italic'})
            return
        } else if (searchHist.indexOf(searchVal) != -1) {
            $('#mainDisplay').removeAttr("hidden")
            currentConditions(searchVal)
            $('#cityInput').val("")
            $('#validation').text("")
        } else {
            $('#mainDisplay').removeAttr("hidden")
            searchHist.push(searchVal)
            searchHist.sort()
            localStorage.setItem('prevSearch', JSON.stringify(searchHist))
            $('#cityInput').val("")
            $('#validation').text("")
            $('#prevCities').empty()
            for (var x = 0; x < searchHist.length; x++){
                addCity(searchHist[x])
            }

            currentConditions(searchVal)
        }
    })

    // jQuery keypress function call - 'enter' button for search
    $("#cityInput").keypress(function (event) {
        var sVal = $('#cityInput').val().toUpperCase()
        var keycode = event.keyCode || event.which
        if (keycode === 13) {

            if (!sVal) {
                $('#validation').text("Search empty or city not found!")
                $('#validation').css({ 'color': 'red','font-style': 'italic'})
                return
            } else if (searchHist.indexOf(sVal) != -1) {
                $('#mainDisplay').removeAttr("hidden")
                currentConditions(sVal)
                $('#cityInput').val("")
            } else {
                $('#mainDisplay').removeAttr("hidden")
                searchHist.push(sVal)
                searchHist.sort()
                localStorage.setItem('prevSearch', JSON.stringify(searchHist))
                $('#cityInput').val("")
                $('#prevCities').empty()
                for (var x = 0; x < searchHist.length; x++){
                    addCity(searchHist[x])
                }
            currentConditions(sVal)
        }
        }
      })

    // Clear history button function
    $('#clearBtn').on("click", function () {
        clearCurrent()
        $('#cityDiv').attr("hidden",true)
        $('#forecastDisplay').attr("hidden",true)
        localStorage.removeItem('prevSearch')
        $('#prevCities').empty()
        $('#validation').text("")
    })

    // Load previous search stored in local
    var searchHist = JSON.parse(localStorage.getItem("prevSearch"))|| []
    if (searchHist.length > 0) {
        $('#mainDisplay').removeAttr("hidden")
        searchHist.sort()
        currentConditions(searchHist[0])
    }

    // Loop that creates buttons for stored search history
    for (var x = 0; x < searchHist.length; x++){
        addCity(searchHist[x])
    }

    // Event listener for clicks on the search history buttons
    $('#prevCities').on("click", "button", function() {
        currentConditions($(this).text())
    })

    // Function that creates a button for previous searches
    function addCity(text) {
        var prevCity = $("<button>").addClass("btn btn-secondary btn-lg my-1 btn-block").text(text)
        $('#prevCities').append(prevCity)
    }

    // Function that clears current conditions div
    function clearCurrent() {
        $('#cityDiv').empty()
        $('#forecastDisplay').empty()
    }
    
    // Function that retrieves API data from openweathermap and displays it on the mainDisplay
    function currentConditions(searchText) {
        clearCurrent()

        $.ajax({
            url: "https://api.openweathermap.org/geo/1.0/direct?q=" + searchText + "&appid=c7936d34a1de114ab154db84bfde1ac8",
            method: "GET",
        }).then(function (currentData) {
            console.log(searchText + " " + currentData.length)

            if (currentData.length === 0 ) {
                $('#validation').text("Search empty or city not found!")
                $('#validation').css({ 'color': 'red','font-style': 'italic'})
                alert("Stop!")
            } else {
                                            
                var lat = currentData[0].lat
                var lon = currentData[0].lon

                $.ajax({
                    url: "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&appid=c7936d34a1de114ab154db84bfde1ac8&units=imperial&exclude=minutely,hourly,alerts",
                    method: "GET",
                }).then(function(conditionData){
                    console.log(conditionData)

                    $('#cityDiv').addClass("border border-dark px-2 py-2")

                    $('#cityDiv').append("<h2>" + searchText + " (" + moment().format("M/DD/YYYY") + ") " + "<img src='https://openweathermap.org/img/wn/" + conditionData.current.weather[0].icon + ".png'/>")
    
                    $('#cityDiv').append("<p>Temp: " + conditionData.current.temp + "\u00B0 F</p>")
                    $('#cityDiv').append("<p>Wind: " + conditionData.current.wind_speed + " MPH</p>")
                    $('#cityDiv').append("<p>Humidity: " + conditionData.current.humidity + " %</p>")
                    $('#cityDiv').append("<p>UV Index: <span class='uvColor'>" + conditionData.current.uvi + "</span></p>")
                    
                    var uvIndex = conditionData.current.uvi
    
                    if (uvIndex <= 2) {
                        $('.uvColor').css({"background-color": "green", "color": "white","padding": "0px 10px"})
                    } else if (uvIndex >= 3 && uvIndex <= 7) {
                        $('.uvColor').css({"background-color": "yellow", "color": "black","padding": "0px 10px"})
                    } else {
                        $('.uvColor').css({"background-color": "red", "color": "white","padding": "0px 10px"})
                    }

                    $("#forecastDisplay").prepend("<h2 class='py-2 px-2'>5-Day Forecast</h2>")

                    $("#forecastDisplay").append("<ul class='nav flex-lg-row flex-sm-column justify-content-between' id='forecastDays'></ul>")
    
                    for (var y = 0; y < 5; y++){
                        $("#forecastDays").append("<li class='px-4 py-2 bg-dark text-light text-left'><h4>" + moment().add(y+1, 'd').format("M/DD/YYYY") + "</h4><p><img src='https://openweathermap.org/img/wn/" + conditionData.daily[y].weather[0].icon + ".png'/></p><p>Temp: " + conditionData.daily[y].temp.day + "\u00B0 F</p><p>Wind: " + conditionData.daily[y].wind_speed + " MPH</p><p>Humidity: " + conditionData.daily[y].humidity + " %</p></li>")
                    }
                })
            }

        })
    }

})
