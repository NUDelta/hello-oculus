panoLoader = 1000; // exposes panoLoader to console
var i = 0;
var previous_location;
var current_location;

var active_user;
var effect;
camera = null;

projection_sphere = null;

var x_cor = 42.0568987;
var y_cor = -87.6770544;


Template.home.events({
    'dblclick': function () {
        effect.setFullScreen( true ); 
    }
});

Template.home.rendered = function () {
    Locations.find().observeChanges({
        added: function (id, fields) {
            active_user = fields.uid;
            current_location = new google.maps.LatLng(fields.latitude, fields.longitude);
            panoLoader.load(current_location);
        },
        changed: function (id, fields) {
            console.log('loading new location!');
            current_location = new google.maps.LatLng(fields.latitude, fields.longitude);
            panoLoader.load(current_location);
        },
    });

    

    var canvas = $('#thecanvas')[0];
    var renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas, alpha: true,
      clearColor: 0x000000, clearAlpha: 0 } );
    renderer.autoClearColor = false;
    renderer.setSize(window.innerWidth, window.innerHeight);

    var scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.y = -350; // continue playing with this number
    camera.rotation.y = 0; // update this according to direction of travel
    // camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    // camera.target = new THREE.Vector3(1, 0, 0);
    var controls = new THREE.VRControls( camera );
    scene.add(camera);

    var proj_sphere_geo = new THREE.SphereGeometry(500, 512, 256, 0, Math.PI * 2, 0, Math.PI);
    var proj_sphere_mat = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('imgs/placeholder.png'), side: THREE.DoubleSide });
    projection_sphere = new THREE.Mesh(proj_sphere_geo, proj_sphere_mat);
    scene.add(projection_sphere);

    // var directionV3 = new THREE.Vector3(1, 0, 1);
    // var originV3 = new THREE.Vector3(0, 200, 0);
    // var arrowHelper = new THREE.ArrowHelper(directionV3, originV3, 100, 0xff0000, 20, 10); // 100 is length, 20 and 10 are head length and width
    // scene.add(arrowHelper);

    effect = new THREE.VREffect( renderer );
    effect.setSize( window.innerWidth, window.innerHeight );

    var manager = new WebVRManager( renderer, effect, { hideButton: false})

    // var geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
    // var material = new THREE.MeshNormalMaterial();
    // var cube = new THREE.Mesh( geometry, material );
    // cube.position.z = -1;
    // scene.add( cube );

    // var sphere_geometry = new THREE.SphereGeometry(50, 16, 16);
    // var sphere_material = new THREE.MeshNormalMaterial();
    // var sphere = new THREE.Mesh( sphere_geometry, sphere_material );
    // sphere.position.z = -300
    // scene.add(sphere);

    // var text_geometry = new THREE.TextGeometry('hello world', 
        // {size: 30.0, curveSegments: 50, font: 'sans-serif', weight: 'normal', style: 'normal'} );
    // var text_mat = new THREE.MeshNormalMaterial();
    // var text = new THREE.Mesh(overlay_text, text_mat);
    // text.position.z = -200;
    // scene.add(text);


    panoLoader = new GSVPANO.PanoLoader();
    panoLoader.setZoom(3);

    panoLoader.onPanoramaLoad = function() {
        console.log('loaded!');
        var a = THREE.Math.degToRad(90-panoLoader.heading);
        projection_sphere.quaternion.setFromEuler(new THREE.Euler(0, a, 0, 'YZX'));

        projection_sphere.material.wireframe = false;
        projection_sphere.material.map = new THREE.Texture( this.canvas );
        projection_sphere.material.map.needsUpdate = true;

        // panoDepthLoader.load(this.location.pano);
    };

    // var location = new google.maps.LatLng(44.301945982379095, 9.211585521697998);
    // var home = new google.maps.LatLng(42.0534995, -87.6964939);
    var loc1 = new google.maps.LatLng(42.0568987, -87.6770544);
    // var loc2 = new google.maps.LatLng(48.85837, 2.294481);
    // var loc3 = new google.maps.LatLng(48.850019, 2.27969);
    // var loc4 = new google.maps.LatLng(-33.7969235, 150.9224326);
    // var loc5 = new google.maps.LatLng(42.0534995, -87.6964939);
    current_location = loc1;

    // panoLoader.load(current_location);
    loadNext();

    function animate() {
        // sphere.rotation.y += 0.1;
        // cube.rotation.y += 0.01;
        // cube.rotation.x += 0.01;
        projection_sphere.rotation.y += 0.0001;
        controls.update();
        manager.render( scene, camera );
        requestAnimationFrame( animate );
    }

    var location;
    $(window).on('keydown', function(e) {
        console.log(e.keyCode);

        switch (e.keyCode) {
            case 32:
                loadNext();
            case 37:
                y_cor -= 0.0001;
                location = new google.maps.LatLng(x_cor, y_cor);
                panoLoader.load(location);
                break;
            case 39:
                y_cor += 0.0001;
                location = new google.maps.LatLng(x_cor, y_cor);
                panoLoader.load(location);
                break;
            case 38:
                x_cor -= 0.0001;
                location = new google.maps.LatLng(x_cor, y_cor);
                panoLoader.load(location);
                break;
            case 40:
                x_cor += 0.0001;
                var location = new google.maps.LatLng(x_cor, y_cor);
                panoLoader.load(location);
                break;
            // case 32:
            //     x_rotation = 0;
            //     camera.rotation.y = 0;
            //     break;
            case 49:
                panoLoader.load(loc1);
                break;
            case 50:
                panoLoader.load(home);
                break;
            case 51:
                panoLoader.load(loc3);
                break;
            case 52:
                panoLoader.load(loc4);
                break;
            case 53:
                panoLoader.load(loc5);
                break;
        }
    });

    animate();

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        effect.setSize( window.innerWidth, window.innerHeight );
    }



    window.addEventListener( 'resize', onWindowResize, false );
};

function loadNext() {
    current_location = locations[i];
    // var diff_lat = current_location.latitude - previous_location.latitude;
    // var diff_lng = current_location.longitude - previous_location.longitude;

    // if (Math.abs(diff_lat > diff_lng) {
    //     if (diff_lat > 0) {
    //         projection_sphere.rotation.y = 
    //     }
    // }



    panoLoader.load(new google.maps.LatLng(current_location.latitude, current_location.longitude));
    // previous_location = current_location;
    i += 1;
}

var locations = [{ "longitude" : -87.67754545443475, "latitude" : 42.05835804812801, "uid" : "Bob", "heading" : 251.5572204589844, "distance" : 15.01321937160937, "_id" : "vjwuWyLZTvaFPPQ8f" },
{ "longitude" : -87.67772683881938, "latitude" : 42.05833327960414, "uid" : "Bob", "heading" : 150.6277770996094, "distance" : 15.26450483056482, "_id" : "Q2bE5pLtG8YhR2gJN" },
{ "longitude" : -87.67791182742238, "latitude" : 42.05833994321716, "uid" : "Bob", "heading" : 112.2257614135742, "distance" : 15.33074987857706, "_id" : "RHqwfTt4d8b7nEPbk" },
{ "longitude" : -87.67809513964474, "latitude" : 42.05834266733569, "uid" : "Bob", "heading" : 131.1391143798828, "distance" : 15.17712366179208, "_id" : "as82X2zsectYpjZTz" },
{ "longitude" : -87.67828473829448, "latitude" : 42.05834731929195, "uid" : "Bob", "heading" : 100.878662109375, "distance" : 15.70298589767371, "_id" : "3J93LgXGMLN2pNBLz" },
{ "longitude" : -87.67847794116258, "latitude" : 42.05836404118878, "uid" : "Bob", "heading" : 147.7593536376953, "distance" : 16.100333145187, "_id" : "DK6xsP36Cx8tJjY69" },
{ "longitude" : -87.67920968130946, "latitude" : 42.05838671423686, "uid" : "Bob", "heading" : 162.9542846679688, "distance" : 16.00867221760996, "_id" : "YyJaiSNx4EnFGagZC" },
{ "longitude" : -87.67939458609342, "latitude" : 42.05839404840214, "uid" : "Bob", "heading" : 241.4842071533203, "distance" : 15.32760026797667, "_id" : "4TrFNWbwaeZeZByMb" },
{ "longitude" : -87.67959332101762, "latitude" : 42.05840301703853, "uid" : "Bob", "heading" : 116.6412200927734, "distance" : 16.48089456212976, "_id" : "SRynJ4Y9kLZpMyCk4" },
{ "longitude" : -87.67977302902162, "latitude" : 42.05843025822384, "uid" : "Bob", "heading" : 85.21272277832031, "distance" : 15.1803866835489, "_id" : "i3Q2iyEW7ovYAEsrB" },
{ "longitude" : -87.6801363845241, "latitude" : 42.0583873428796, "uid" : "Bob", "heading" : 142.7386932373047, "distance" : 15.22846128743928, "_id" : "jw8uxK4PYCiPsNnZj" },
{ "longitude" : -87.68032548025965, "latitude" : 42.05841823019279, "uid" : "Bob", "heading" : 79.46593475341797, "distance" : 16.02443867827049, "_id" : "a6wqCh6zu7HZZwZQY" },
{ "longitude" : -87.68050988212943, "latitude" : 42.05843876585556, "uid" : "Bob", "heading" : 127.7607879638672, "distance" : 15.43379791806135, "_id" : "ieGESnwqkd29cxzSw" },
{ "longitude" : -87.68069788821757, "latitude" : 42.05842338506324, "uid" : "Bob", "heading" : 122.6228942871094, "distance" : 15.65614594871795, "_id" : "bwCY8fLj6JJSuTni6" },
{ "longitude" : -87.68088522375345, "latitude" : 42.05841315914137, "uid" : "Bob", "heading" : 96.08584594726562, "distance" : 15.54868784326968, "_id" : "t97qHKD5EQj7zpzG5" },
{ "longitude" : -87.68107633114576, "latitude" : 42.05843097068561, "uid" : "Bob", "heading" : 122.9781112670898, "distance" : 15.94260727413372, "_id" : "g5hxkzJoMJooFp28Z" }]

// function load_new_location(lat, lng) {

// }