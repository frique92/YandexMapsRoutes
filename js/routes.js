ymaps.ready(init);

function init() 
{
    var maxPoints = 30,
        yMap = new ymaps.Map("map", {
		    center  : [56.13, 40.4],
		    zoom    : 10
        });
        
    function getNewCoordinatesPlane(myPolyline)
    {
        let lengthGeometry = myPolyline.geometry.getLength(),
            lastCoordinates = myPolyline.geometry.get(lengthGeometry - 1);

        return lengthGeometry == 0
        ? [56.13, 40.4]
        : lastCoordinates.map(coord => coord - Math.random() / 100 );
    }

    function setNewGeometry(myPolyline, maxPoints)
	{
		let lengthGeometry = myPolyline.geometry.getLength(),
			NewCoordinatesPlane = getNewCoordinatesPlane(myPolyline),
			boundsPolyline;

	    myPolyline.geometry.set(lengthGeometry, NewCoordinatesPlane);
	    lengthGeometry = myPolyline.geometry.getLength();

	    if (lengthGeometry - maxPoints > 0)
	    	myPolyline.geometry.splice(0, lengthGeometry - maxPoints - 1);

	    boundsPolyline = myPolyline.geometry.getBounds();

	    yMap.setBounds(boundsPolyline, {
	    	checkZoomRange : true,
	    	duration       : 100,
	    	zoomMargin     : 100
	    });
	}

	let myPolyline = new ymaps.Polyline([], null, {
		balloonCloseButton : false,
		strokeColor        : "#0687b6",
		strokeWidth        : 5,
		strokeOpacity      : 0.7
  	});

	yMap.geoObjects.add(myPolyline);

	setInterval( () => setNewGeometry(myPolyline, maxPoints), 1000);
        
}