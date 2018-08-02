var http = require('http'),
    Static = require('node-static'),
    WebSocketServer = new require('ws'),
    lastCoordinates = [56.13, 40.4],
    delayInterval = 1000,
    webSocketServer = new WebSocketServer.Server({ port: 8081 });

webSocketServer.on('connection', function (ws) {
    setTimeout(function tick() 
        {
            let message = getNewCoordinatesPlane(lastCoordinates);

            ws.send(JSON.stringify(message));
            setTimeout(tick, delayInterval);
        }, delayInterval);

    ws.on('message', function (message) 
        {
            delayInterval = Number(message);
        });

});

function getNewCoordinatesPlane() 
{
    lastCoordinates = lastCoordinates.map(coord => coord - Math.random() / 50);
    return lastCoordinates;
}

console.log("Сервер запущен на порте 8081");

