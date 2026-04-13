import { Graphics, Sprite, Texture } from "pixi.js";

export function createImage(textureName: string): Sprite | null {
    const tex = Texture.from(textureName)
    if (tex) {
        let sprite = new Sprite(tex);
        return sprite;
    }
    return null;
}

export function createShape(x: number, y: number, width: number, height: number, color: string, alpha: number) {
    const graphic = new Graphics().rect(x, y, width, height).fill(color);
    graphic.pivot.set(width / 2, height / 2);
    graphic.alpha = alpha;
    return graphic;
}
