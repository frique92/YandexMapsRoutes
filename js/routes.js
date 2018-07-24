ymaps.ready(init);

function init() 
{
    var maxPoints = 30,
        yMap = new ymaps.Map("map", {
		    center  : [56.13, 40.4],
		    zoom    : 10
        });
        
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
	    	checkZoomRange : true,
	    	duration       : 100,
	    	zoomMargin     : 100
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

	setInterval( () => setNewGeometry(routePolyline, planePlacemark, maxPoints), 1000);
        
}