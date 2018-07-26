ymaps.ready(init);

function init() {
    var maxPoints = 30,
        delayInterval = 1000,
        scaling = true,
        maxPointsInput = document.params.max_points,
        delayInput = document.params.delay,
        applyButton = document.params.apply,
        scalingInput = document.params.scaling,
        yMap = new ymaps.Map("map",
            {
                center: [56.13, 40.4],
                zoom: 10,
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
            });

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

    var imageStateServer = document.createElement('img');
    imageStateServer.src = "img/server_off.png";
    imageStateServer.id = "img-state-server";
    document.getElementById('server').appendChild(imageStateServer);

    socket.onmessage = function (event) {
        let incomingMessage = JSON.parse(event.data);
        setNewGeometry(routePolyline, planePlacemark, maxPoints, incomingMessage);
    };

    socket.onopen = function () {
        imageStateServer.src = "img/server_on.png";
    };

    socket.onclose = function (event) {
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

        if (lengthGeometry == 0) 
        {
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

}