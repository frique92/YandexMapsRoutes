ymaps.ready(init);

function init() 
{
    var maxPoints = 30,
        delayInterval = 1000;
        maxPointsInput = document.params.max_points,
        delayInput = document.params.delay,
		applyButton = document.params.apply,
        yMap = new ymaps.Map("map", {
		    center      : [56.13, 40.4],
            zoom        : 10,
            controls    : []
        });
        
    maxPointsInput.value = maxPoints;
    delayInput.value = delayInterval / 1000;

    applyButton.onclick = function(e){
        e.preventDefault();
        maxPoints = maxPointsInput.value;
        delayInterval = delayInput.value * 1000;
        console.log(delayInterval)
    }    

    function getNewCoordinatesPlane(routePolyline)
    {
        let lengthGeometry = routePolyline.geometry.getLength(),
            lastCoordinates = routePolyline.geometry.get(lengthGeometry - 1);

        return lengthGeometry == 0
        ? [56.13, 40.4]
        : lastCoordinates.map(coord => coord - Math.random() / 100 );
    }

    function setNewGeometry(routePolyline, planePlacemark, maxPoints)
	{
		let lengthGeometry = routePolyline.geometry.getLength(),
			NewCoordinatesPlane = getNewCoordinatesPlane(routePolyline),
			boundsPolyline;

	    routePolyline.geometry.set(lengthGeometry, NewCoordinatesPlane);
	    lengthGeometry = routePolyline.geometry.getLength();

	    if (lengthGeometry - maxPoints > 0)
	    	routePolyline.geometry.splice(0, lengthGeometry - maxPoints - 1);

	    boundsPolyline = routePolyline.geometry.getBounds();

	    yMap.setBounds(boundsPolyline, {
	    	checkZoomRange : true
        });
        
        planePlacemark.geometry.setCoordinates(NewCoordinatesPlane);
	}

	let routePolyline = new ymaps.Polyline([], null, {
		balloonCloseButton : false,
		strokeColor        : "#0687b6",
		strokeWidth        : 5,
		strokeOpacity      : 0.7
  	});

    let planePlacemark = new ymaps.Placemark([], null, {
	    iconLayout      : "default#image",
	    iconImageHref   : "img/plane.png",
	    iconImageSize   : [40, 40],
	    iconImageOffset : [-20, -20]
	});

    yMap.geoObjects.add(routePolyline);
    yMap.geoObjects.add(planePlacemark);

    var timerId = setTimeout(function tick() {
        setNewGeometry(routePolyline, planePlacemark, maxPoints);
        timerId = setTimeout(tick, delayInterval);
      }, delayInterval);
        
}