Meteor.methods({
    ping: function () {
        console.log('PING!');
        return 'PONG!';
    },
    handShake: function () {
        console.log('Creating a userId!');
        return createToken();
    },
    updateLocation: function(obj) {
        console.log('Location update received.');
        var lat = obj.latitude;
        var lng = obj.longitude;
        var dist = obj.distance;
        var heading = obj.heading;
        var uid = obj.uid;

        var existing = Locations.findOne({uid: uid});
        if (!existing) {
            console.log('New location session created.');
            Locations.insert(obj);
        }
        else if (dist >= 15) {
            console.log('Update to previous session processed.');
            Locations.update({ uid: uid }, obj);
        }

        if (dist >= 15) {
            DebugLocations.insert(obj);
        }
    },
    clearMessages: function() {
        Messages.remove({});
    }
});

function createToken() {
    return 'Bob';

    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        token += possible.charAt(Math.floor(Math.random() * possible.length));

    return token;
}