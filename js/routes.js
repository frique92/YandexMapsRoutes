ymaps.ready(init);

function init() {
    var maxPoints = 30,
        delayInterval = 1000,
        scaling = false,
        maxPointsInput = document.params.max_points,
        delayInput = document.params.delay,
        applyButton = document.params.apply,
        scalingInput = document.params.scaling,
        yMap = new ymaps.Map("map",
            {
                center: [56.13, 40.4],
                zoom: 7,
                controls: []
            }),
        socket = new WebSocket("ws://localhost:8081"),
        routePolyline = new ymaps.Polyline([], null,
            {
                balloonCloseButton: false,
                strokeColor: "#0687b6",
                strokeWidth: 5,
                strokeOpacity: 0.7
            }),
        planePlacemark = new ymaps.Placemark([], null,
            {
                iconLayout: "default#image",
                iconImageHref: "img/plane.png",
                iconImageSize: [40, 40],
                iconImageOffset: [-20, -20]
            }),
        arrayTime = [],
        customLayer = new ymaps.Layer(''),
        addedLayers = [],
        isPlayAnimation = false,
        copyrightRainViewer = yMap.copyrights.add('&copy; RainViewer');;

    maxPointsInput.value = maxPoints;
    delayInput.value = delayInterval / 1000;
    scalingInput.checked = scaling;

    applyButton.onclick = function (e)
    {
        e.preventDefault();
        maxPoints = maxPointsInput.value;
        delayInterval = delayInput.value * 1000;
        scaling = scalingInput.checked;
        socket.send(delayInterval);
    }

    var next_option_timeElement = document.getElementById('next-time')
    next_option_timeElement.onclick = function (e) 
    {
        e.preventDefault();
        let cur_index = arrayTime.indexOf(Number(selecttime.value))
        selecttime.value = cur_index == arrayTime.length - 1
            ? arrayTime[0]
            : arrayTime[cur_index + 1];

        removeLayer();
        addLayer(selecttime.value);
    }
    var next_option_timeElement = document.getElementById('previos-time')
    next_option_timeElement.onclick = function (e) 
    {
        e.preventDefault();
        let cur_index = arrayTime.indexOf(Number(selecttime.value))
        selecttime.value = cur_index == 0
            ? arrayTime[arrayTime.length - 1]
            : arrayTime[cur_index - 1];

        removeLayer();
        addLayer(selecttime.value);
    }

    var start_timeElement = document.getElementById('start-time')
    start_timeElement.onclick = function (e) 
    {
        e.preventDefault();

        isPlayAnimation = !isPlayAnimation
        let cur_index = arrayTime.indexOf(Number(selecttime.value))

        index = (cur_index == arrayTime.length - 1)
            ? 0
            : cur_index + 1

        var timerId = setTimeout(function tick() 
        {
            if (!isPlayAnimation) clearTimeout(timerId)
            else {
                current_time = arrayTime[index]
                selecttime.value = current_time;

                removeLayer();
                addLayer(selecttime.value);

                if (index == arrayTime.length - 1) index = 0; else index++;

                timerId = setTimeout(tick, 0.5 * 1000);
            };
        }, 0.5 * 1000);

        start_timeElement.innerText = (isPlayAnimation) ? "Стоп" : "Запуск"
    }

    var selecttime = document.getElementById('select-time');
    selecttime.onchange = () => 
    {
        removeLayer();
        addLayer(selecttime.value);
    }

    function removeLayer() 
    {
        addedLayers.forEach(element => {
            yMap.layers.remove(element)
        });
    }

    function addLayer(timestamp) 
    {
        customLayer = new ymaps.Layer(
            `https://tilecache.rainviewer.com/v2/radar/${timestamp}/512/%z/%x/%y.png?color=1`,
            {
                projection: ymaps.projection.sphericalMercator,
                tileTransparent: true
            });

        yMap.layers.add(customLayer);
        addedLayers.push(customLayer)
    }

    function getTime(timeUTC) 
    {
        var date = new Date(timeUTC * 1000),
            a = {
                    hour: "numeric",
                    minute: "numeric"
                };
        return date.toLocaleString('ru', a)
    }

    var imageStateServer = document.createElement('img');
    imageStateServer.src = "img/server_off.png";
    imageStateServer.id = "img-state-server";
    document.getElementById('server').appendChild(imageStateServer);

    socket.onmessage = function (event) 
    {
        let incomingMessage = JSON.parse(event.data);
        setNewGeometry(routePolyline, planePlacemark, maxPoints, incomingMessage);
    };

    socket.onopen = function () 
    {
        imageStateServer.src = "img/server_on.png";
    };

    socket.onclose = function (event) 
    {
        imageStateServer.src = "img/server_off.png";
    };

    function getNewCoordinatesPlane(routePolyline) 
    {
        let lengthGeometry = routePolyline.geometry.getLength(),
            lastCoordinates = routePolyline.geometry.get(lengthGeometry - 1);

        return lengthGeometry == 0
            ? [56.13, 40.4]
            : lastCoordinates.map(coord => coord - Math.random() / 100);
    }

    function setNewGeometry(routePolyline, planePlacemark, maxPoints, NewCoordinatesPlane) 
    {
        let lengthGeometry = routePolyline.geometry.getLength(),
            boundsPolyline;

        if (lengthGeometry == 0) {
            yMap.geoObjects.add(routePolyline);
            yMap.geoObjects.add(planePlacemark);
        }

        routePolyline.geometry.set(lengthGeometry, NewCoordinatesPlane);
        lengthGeometry = routePolyline.geometry.getLength();

        if (lengthGeometry - maxPoints > 0)
            routePolyline.geometry.splice(0, lengthGeometry - maxPoints - 1);

        boundsPolyline = routePolyline.geometry.getBounds();

        if (scaling == true)
            yMap.setBounds(boundsPolyline,
                {
                    checkZoomRange: true
                });

        planePlacemark.geometry.setCoordinates(NewCoordinatesPlane);
    }

    function updateArrayTimeForJSON() 
    {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://tilecache.rainviewer.com/api/maps.json', true);
        xhr.send();

        xhr.onreadystatechange = function () 
        {
            if (this.readyState != 4) return;
            if (this.status != 200) return;

            arrayTime = JSON.parse(this.responseText);
            updateSelectTime(arrayTime);
        }
    }

    function updateSelectTime(arrayTime) 
    {

        let element = document.getElementById('select-time');

        innerHTML = "";

        arrayTime.forEach(element => {
            innerHTML = innerHTML + `<option id="option-time${element}" value="${element}">${getTime(element)}</option>`;
        })

        element.innerHTML = innerHTML;
        selecttime.value = arrayTime[arrayTime.length - 1]

        removeLayer();
        addLayer(selecttime.value);
    }

    updateArrayTimeForJSON();
    setInterval(updateArrayTimeForJSON, 300 * 1000)

}