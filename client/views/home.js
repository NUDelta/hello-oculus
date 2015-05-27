panoLoader = 1000; // exposes panoLoader to console

var active_user;
var current_location;
var effect;
var camera;

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
    // camera.target = new THREE.Vector3(1, 0, 0);
    var controls = new THREE.VRControls( camera );
    scene.add(camera);

    var proj_sphere_geo = new THREE.SphereGeometry(500, 512, 256, 0, Math.PI * 2, 0, Math.PI);
    var proj_sphere_mat = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('imgs/placeholder.png'), side: THREE.DoubleSide });
    var projection_sphere = new THREE.Mesh(proj_sphere_geo, proj_sphere_mat);
    scene.add(projection_sphere);


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

    var location = new google.maps.LatLng(44.301945982379095, 9.211585521697998);
    // var home = new google.maps.LatLng(42.0534995, -87.6964939);
    current_location = location;
    // var loc1 = new google.maps.LatLng(42.0568987, -87.6770544);
    // var loc2 = new google.maps.LatLng(48.85837, 2.294481);
    // var loc3 = new google.maps.LatLng(48.850019, 2.27969);
    // var loc4 = new google.maps.LatLng(-33.7969235, 150.9224326);
    // var loc5 = new google.maps.LatLng(42.0534995, -87.6964939);

    panoLoader.load(location);

    function animate() {
        // sphere.rotation.y += 0.1;
        // cube.rotation.y += 0.01;
        // cube.rotation.x += 0.01;
        controls.update();
        manager.render( scene, camera );
        requestAnimationFrame( animate );
    }

    var location;
    $(window).on('keydown', function(e) {

        switch (e.keyCode) {
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

// function load_new_location(lat, lng) {

// }