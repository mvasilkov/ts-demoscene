/*
 * @file    starfield.ts
 * @author  Sebastien LEGRAND
 *
 * @brief   Starfield effect in Typescript
 */

//----- imports
import { IAnimation } from "library/core/animation";
import { States } from "library/core/manager";
import { Display } from "library/core/display";
import { Point3D } from "library/core/interfaces";
import { Palette } from "library/color/palette";
import { Color } from "library/color/color";
import { RGBA } from "library/color/RGBA";


//----- globals
const NUMBER_OF_STARS = 1024;


//----- interface
interface Star {
    position: Point3D
    speed: number
    color: number
}

//----- class
export class Starfield extends IAnimation {

    //----- members
    private stars_: Star[];
    private palette_: Palette;

    //----- methods
    constructor(display: Display) {
        super('starfield', display);

        // set the vars
        this.stars_ = [];
        this.palette_ = new Palette();

        // initialize the stars
        for (let i = 0; i < NUMBER_OF_STARS; i++) {
            this.initStar(i);
        }

        // initialize the palette
        this.createPalette();
    }

    // initialize a star
    private initStar(index: number): void {
        this.stars_[index] = {
            position: {
                x: (-200.0 + (400 * Math.random())),
                y: (-200.0 + (400 * Math.random())),
                z: (-200.0 + (400 * Math.random())),
            },
            speed: 2 + Math.floor(2 * Math.random()),
            color: index % 256
        }
    }

    // palette creation
    private createPalette(): void {
        this.palette_.setColor(0, Color.from(new RGBA(0, 0, 0)));
        for (let i = 0; i < 255; i++) {
            this.palette_.setColor(255 - i, Color.from(new RGBA(i, i, i)));
        }
    }

    // update the animation
    protected update(time?: number): void {
        if (!this.isAnimated) {
            return;
        }

        // move the stars
        for (let i = 0; i < NUMBER_OF_STARS; i++) {
            let star: Star = this.stars_[i];
            star.position.z -= star.speed;
        }
    }

    // render the animation on the screen
    protected render(time?: number): void {
        if (!this.isAnimated) {
            return;
        }
    }

    // setup function
    public setup(): void {
        // toggle the animation
        this.toggle();

        // set the click handler to pause the animation
        window.onclick = () => {
            this.toggle();
        }

        console.log("Starting Starfield animation.");
    }

    // cleanup function
    public cleanup(): void {
    }

    // run the animation
    public run(time?: number): States {
        // update and render
        this.update(time);
        this.render(time);

        // this animation will run indefinitely
        return States.S_RUNNING;
    }
}