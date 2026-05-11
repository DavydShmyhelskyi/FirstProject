import * as THREE from 'three'
import GUI from 'lil-gui'

// ── Scene ──────────────────────────────────────────────────────
const scene = new THREE.Scene()

// ── Sizes ──────────────────────────────────────────────────────
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// ── Camera ─────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 10
camera.position.y = 2
scene.add(camera)

// ── Canvas + Renderer ──────────────────────────────────────────
const canvas = document.querySelector('canvas.webgl')

const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true

// ── Lights ─────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 30)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

// ── Axes Helper ────────────────────────────────────────────────
/**
 * Axes Helper
 */
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// ── Objects ────────────────────────────────────────────────────

/**
 * Objects
 */

// 1. Куб — MeshStandardMaterial
const cubeMaterial = new THREE.MeshStandardMaterial()
cubeMaterial.metalness = 0.45
cubeMaterial.roughness = 0.65

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    cubeMaterial
)
cube.position.x = - 1.5
cube.castShadow = true
cube.userData.rotationOffsetY = 0

// 2. Сфера — MeshPhongMaterial
const sphereMaterial = new THREE.MeshPhongMaterial()
sphereMaterial.shininess = 100
sphereMaterial.specular = new THREE.Color(0x1188ff)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    sphereMaterial
)
sphere.position.x = 0
sphere.castShadow = true
sphere.userData.rotationOffsetY = 0

// 3. Тор — MeshToonMaterial
const torusMaterial = new THREE.MeshToonMaterial()

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.25, 16, 64),
    torusMaterial
)
torus.position.x = 1.5
torus.castShadow = true
torus.userData.rotationOffsetY = 0

// 4. Конус — MeshNormalMaterial
const coneMaterial = new THREE.MeshNormalMaterial()
coneMaterial.flatShading = true

const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 1.5, 32),
    coneMaterial
)
cone.position.x = 3
cone.castShadow = true
cone.userData.rotationOffsetY = 0

// 5. Октаедр — MeshLambertMaterial
const octahedronMaterial = new THREE.MeshLambertMaterial()

const octahedron = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.9),
    octahedronMaterial
)
octahedron.position.x = - 3
octahedron.castShadow = true
octahedron.userData.rotationOffsetY = 0

// Scene graph — як у документі про трансформації
const group = new THREE.Group()
group.add(cube, sphere, torus, cone, octahedron)
scene.add(group)

// ── Debug UI ───────────────────────────────────────────────────

/**
 * Debug
 */
const gui = new GUI({
    width: 300,
    title: 'Nice debug UI',
    closeFolders: false
})

const debugObject = {}

function addMeshFolder(folderName, mesh, material, defaultColor)
{
    const folder = gui.addFolder(folderName)

    // Колір — через debugObject як рекомендує документ
    debugObject[folderName + '_color'] = defaultColor
    if (material.color)
    {
        material.color.set(defaultColor)
        folder
            .addColor(debugObject, folderName + '_color')
            .name('Колір')
            .onChange(() =>
            {
                material.color.set(debugObject[folderName + '_color'])
            })
    }

    // position.y — напряму на mesh.position як у документі
    folder
        .add(mesh.position, 'y')
        .min(- 3)
        .max(3)
        .step(0.01)
        .name('Позиція Y')

    // scale — напряму на mesh.scale як у документі
    folder
        .add(mesh.scale, 'x')
        .min(0.1)
        .max(3)
        .step(0.01)
        .name('Масштаб')
        .onChange((val) =>
        {
            mesh.scale.set(val, val, val)
        })

    // rotation offset — через userData щоб не конфліктувати з анімацією
    folder
        .add(mesh.userData, 'rotationOffsetY')
        .min(- Math.PI)
        .max(Math.PI)
        .step(0.01)
        .name('Обертання Y')

    // wireframe — напряму на material як у документі
    if (material.wireframe !== undefined)
    {
        folder
            .add(material, 'wireframe')
            .name('Wireframe')
    }

    // visible — напряму на mesh як у документі
    folder
        .add(mesh, 'visible')
        .name('Видимий')

    folder.close()
}

addMeshFolder('Куб (Standard)',     cube,       cubeMaterial,       '#6e6eff')
addMeshFolder('Сфера (Phong)',      sphere,     sphereMaterial,     '#ff6e6e')
addMeshFolder('Тор (Toon)',         torus,      torusMaterial,      '#6effb4')
addMeshFolder('Конус (Normal)',     cone,       coneMaterial,       '#ffffff')
addMeshFolder('Октаедр (Lambert)', octahedron, octahedronMaterial, '#ff6ec8')

// Приховування клавішею h — як у документі
window.addEventListener('keydown', (event) =>
{
    if(event.key == 'h')
        gui.show(gui._hidden)
})

// ── Animate ────────────────────────────────────────────────────

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Обертання через elapsedTime — як у документі про матеріали
    // userData.rotationOffsetY — додатковий зсув з GUI
    cube.rotation.y       = 0.1 * elapsedTime + cube.userData.rotationOffsetY
    sphere.rotation.y     = 0.1 * elapsedTime + sphere.userData.rotationOffsetY
    torus.rotation.y      = 0.1 * elapsedTime + torus.userData.rotationOffsetY
    cone.rotation.y       = 0.1 * elapsedTime + cone.userData.rotationOffsetY
    octahedron.rotation.y = 0.1 * elapsedTime + octahedron.userData.rotationOffsetY

    cube.rotation.x       = - 0.15 * elapsedTime
    sphere.rotation.x     = - 0.15 * elapsedTime
    torus.rotation.x      = - 0.15 * elapsedTime
    cone.rotation.x       = - 0.15 * elapsedTime
    octahedron.rotation.x = - 0.15 * elapsedTime

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()

// ── Resize ─────────────────────────────────────────────────────
window.addEventListener('resize', () =>
{
    sizes.width  = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})