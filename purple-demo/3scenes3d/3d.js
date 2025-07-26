let globalCounter = 0;

class MyScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.planeGeometry = new THREE.PlaneGeometry(5, 5);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.functionKeysActivated = true;
        this.delta = 0.006;
        this.headerLines = [];
        this.context = null;
        this.cursor = null;
        this.clearColor = 0xaaaaaa; // Example color
        this.backgroundColor = 0xcccccc; // Example color
        this.defaultColor = 'black';

        this.planes = [];
        this.textures = []; // Array to hold individual textures
        this.animationFrameId = null;
        this.rotationCoeff = 0.01;
        this.counter = 0;
    }

    init() {
        this.setupRenderer();

        const imagePaths = ['a800xl.png', 'c64.png', 'zxs.png'];
        this.loadTextures(imagePaths, () => {
            this.setupPlanes();
            this.animate();
        });

        this.camera.position.z = 15;
        this.camera.position.x = 0;

        window.addEventListener('resize', () => {
            this.renderer.setSize(0.8*window.innerWidth, 0.8*window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    reset(){
        console.log('reset');
        this.planes.forEach((plane, index) => {
            plane.rotation.x = 0;
            plane.rotation.y = 0;
        });
    }

    setupRenderer() {
      const container = document.getElementById('scene-container');
      this.renderer.setSize(container.clientWidth, container.clientHeight);

      container.appendChild(this.renderer.domElement);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(this.clearColor, 1);
        document.body.appendChild(this.renderer.domElement);
    }

    loadTextures(imagePaths, callback) {
        const loader = new THREE.TextureLoader();
        let loadedCount = 0;
        this.textures = [];

        imagePaths.forEach((path, index) => {
            loader.load(
                path,
                (texture) => {
                    this.textures[index] = texture;
                    loadedCount++;
                    if (loadedCount === imagePaths.length) {
                        callback();
                    }
                },
                undefined,
                (err) => {
                    console.error('Error loading texture:', path);
                }
            );
        });
    }

    setupPlanes() {
        const spacing = 5;

        for (let i = 0; i < 3; i++) {
            const material = new THREE.MeshBasicMaterial({ map: this.textures[i] });
            const plane = new THREE.Mesh(this.planeGeometry, material);
            plane.position.x = (i - 1) * spacing; // -spacing, 0, +spacing
            plane.rotation.x = -Math.PI / 12; // Tilt as original
            this.scene.add(plane);
            this.planes.push(plane);
        }
    }

    handleKeyDown(event) {
        console.log('Key pressed:', event.key);
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());

        this.planes.forEach((plane, index) => {
            const shift = this.rotationCoeff*Math.sin(this.counter/(20*Math.PI));
            if (globalCounter % 17 < 8) plane.rotation.y += index % 2 == 0 ? shift : -shift;
            else plane.rotation.x += index % 2 == 0 ? shift : -shift;
        });

        this.counter++;
        this.renderer.render(this.scene, this.camera);
    }
}

const myScene = new MyScene();
myScene.init();


function tick1Second(){
    globalCounter++;

    if (globalCounter % 25 == 0){
        myScene.planes[0].rotation.x = 0;
        myScene.planes[1].rotation.y = 0;
        console.log('1')
    }
    else if (globalCounter % 30 == 0){
        myScene.planes[2].rotation.x = 0;
        myScene.planes[2].rotation.y = 0;
        console.log('2')
    }
    else if (globalCounter % 32 == 0){
        myScene.planes[0].rotation.x = 0;
        myScene.planes[1].rotation.y = 0;
        console.log('3')
    }
    else if (globalCounter % 35 == 0){
        myScene.planes[0].rotation.x = 0;
        myScene.planes[0].rotation.y = 0;
        console.log('4')
    }
    else if (globalCounter % 38 == 0){
        myScene.planes[2].rotation.x = 0;
        myScene.planes[1].rotation.y = 0;
        console.log('5')
    }
    else if (globalCounter % 40 == 0){
        myScene.planes[1].rotation.x = 0;
        myScene.planes[1].rotation.y = 0;
        console.log('6')
    }
	
	if (globalCounter % 200 === 50) {
		myScene.scene.background = new THREE.Color('white');
	} else if (globalCounter % 200 === 100) {
		myScene.scene.background = new THREE.Color(0x9aa4ff);
	} else if (globalCounter % 200 === 150) {
		myScene.scene.background = new THREE.Color('black');
	}
}

setInterval(tick1Second, 1000);

