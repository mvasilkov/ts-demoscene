/*
 * @file    HSLA.ts
 * @author  Sebastien LEGRAND
 *
 * @brief   HSLA color class
 */

//----- imports
import { BaseColor, Components, COLOR_MODEL } from "./basecolor";


//---- class
export class HSLA extends BaseColor {

    //----- methods

    constructor(h: number = 0, s: number = 0, l: number = 0, alpha: number = 1.0) {
        super(COLOR_MODEL.HSLA, h, s, l, alpha);
    }

    public static from(color: BaseColor): HSLA {
        if ( color.model == COLOR_MODEL.HSLA ) {
            return this.fromHSLA(color.values);
        }
    }

    public dump(): void {
        console.log(`HSLA: H = ${this.x_}, S = ${this.y_}, L = ${this.z_}, A = ${this.a_}`);
    }

    public css(): string {
        // saturation and luminance should be percentages
        let s: number = Math.round(this.y_ * 100);
        let l: number = Math.round(this.z_ * 100);
        return `hsla(${this.x_}, ${s}, ${l}, ${this.a_})`;
    }

    public hex(): string {
        throw Error("Method not implemented for HSLA color.");
    }

    private static fromHSLA(hsla: Components): HSLA {
        return new HSLA(hsla.x, hsla.y, hsla.z, hsla.a);
    }

    private static fromHSVA(hsva: Components): HSLA {
        let h: number, s: number, l: number;
        let v: number, x: number;

        [ h, s, v ] = [ hsva.x, hsva.y, hsva.z ];

        // saturation
        x = (2 - s) * v;
        if ( x < 1 ) {
            s = (s * v) / x;
        }
        else {
            s = (s * v) / (2 - x);
        }

        // luminance
        l = x / 2;

        // set the values (keep 3 decimals)
        return new HSLA(this.clamp(h), this.clamp(s), this.clamp(l), hsva.a);
    }
}