import * as THREE from 'three'

export const TURN = Math.PI * 2

/** Rounded rectangle centred on the origin. */
export function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = w / 2 - r
  const y = h / 2 - r
  s.absarc(x, y, r, 0, Math.PI / 2)
  s.absarc(-x, y, r, Math.PI / 2, Math.PI)
  s.absarc(-x, -y, r, Math.PI, Math.PI * 1.5)
  s.absarc(x, -y, r, Math.PI * 1.5, TURN)
  s.closePath()
  return s
}

/** Flat rounded panel whose UVs span 0..1, so a texture fills it edge to edge. */
export function panelGeometry(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 20)
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5)
  return g
}

/** Load a screenshot so it covers a panel of the given aspect, keeping its top edge in view. */
export function loadScreen(src: string, aspect: number, anisotropy: number, onLoad: (t: THREE.Texture) => void) {
  return new THREE.TextureLoader().load(src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = anisotropy
    const image = t.image as { width: number; height: number }
    const k = image.width / image.height / aspect
    if (k > 1) {
      t.repeat.set(1 / k, 1)
      t.offset.set((1 - 1 / k) / 2, 0)
    } else {
      t.repeat.set(1, k)
      t.offset.set(0, 1 - k)
    }
    onLoad(t)
  })
}

/** Studio reflections for metal, baked once from a procedural room. */
export function studioEnvironment(gl: THREE.WebGLRenderer, Room: new () => THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl)
  const texture = pmrem.fromScene(new Room(), 0.04).texture
  pmrem.dispose()
  return texture
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const ease = (v: number) => v * v * (3 - 2 * v)
export const mix = (a: number, b: number, t: number) => a + (b - a) * t
