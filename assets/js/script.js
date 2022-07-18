$(document).ready(function () {
    
    $("#searchBtn").on("click", function () {
        
        var searchVal = $('#cityInput').val()

        if (!searchVal) {
            return
        } else if (searchHist.indexOf(searchVal) != -1) {
            $('#mainDisplay').removeAttr("hidden")
            currentConditions(searchVal)
            $('#cityInput').val("")
        } else {
            $('#mainDisplay').removeAttr("hidden")
            searchHist.push(searchVal)
            searchHist.sort()
            localStorage.setItem('prevSearch', JSON.stringify(searchHist))
            $('#cityInput').val("")
            $('#prevCities').empty()
            for (var x = 0; x < searchHist.length; x++){
                addCity(searchHist[x])
            }

            currentConditions(searchVal)
        }
    })

    var searchHist = JSON.parse(localStorage.getItem("prevSearch"))|| []
    if (searchHist.length > 0) {
        $('#mainDisplay').removeAttr("hidden")
        searchHist.sort()
        currentConditions(searchHist[0])
    }

    for (var x = 0; x < searchHist.length; x++){
        addCity(searchHist[x])
    }

    $('#prevCities').on("click", "button", function() {
        currentConditions($(this).text())
    })

    function addCity(text) {
        var prevCity = $("<button>").addClass("btn btn-secondary btn-lg my-1 btn-block").text(text)
        $('#prevCities').append(prevCity)
    }

    function clearCurrent() {
        $('#cityName').val("")
        $('#tempText').text("Temp: ")
        $('#windText').text("Wind: ")
        $('#humText').text("Humidity: ")
        $('#uvStr').text("UV Index:")
    }
    
    function currentConditions(searchText) {
        clearCurrent()

        $('#cityName').text(searchText)

        $.ajax({
            url: "http://api.openweathermap.org/geo/1.0/direct?q=" + searchText + "&appid=c7936d34a1de114ab154db84bfde1ac8",
            method: "GET",
        }).then(function (currentData) {
            console.log(currentData)
            var lat = currentData[0].lat
            var lon = currentData[0].lon

            $.ajax({
                url: "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&appid=c7936d34a1de114ab154db84bfde1ac8&units=imperial",
                method: "GET",
            }).then(function(conditionData){
                console.log(conditionData)
                $('#cityName').append(" (" + moment().format("M/DD/YYYY") + ") " + "<img src='http://openweathermap.org/img/wn/" + conditionData.current.weather[0].icon + ".png'/>")

                $('#tempText').append(conditionData.current.temp + "\u00B0 F")
                $('#windText').append(conditionData.current.wind_speed + " MPH")
                $('#humText').append(conditionData.current.humidity + " %")
                $('#uvStr').append(" <span class='uvColor'>" + conditionData.current.uvi + "</span>")
                
                var uvIndex = conditionData.current.uvi

                if (uvIndex <= 2) {
                    $('.uvColor').css({"background-color": "green", "color": "white","padding": "0px 10px"})
                } else if (uvIndex >= 3 && uvIndex <= 7) {
                    $('.uvColor').css({"background-color": "yellow", "color": "white","padding": "0px 10px"})
                } else {
                    $('.uvColor').css({"background-color": "red", "color": "white","padding": "0px 10px"})
                }
                

                // Append <p> for each element on the 5-day forecast
            })
        })
    }
})
