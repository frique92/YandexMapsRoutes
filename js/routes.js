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

}