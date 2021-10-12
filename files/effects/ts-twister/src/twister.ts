/*
 * @file    twister.ts
 * @author  Sebastien LEGRAND
 *
 * @brief   Twister effect
 */

//----- imports
import { Animation } from "library/core/animation";
import { Display } from "library/core/display";
import { radians } from "library/maths/utils";
import { Surface } from "library/core/surface";
import { Size } from "library/core/interfaces";


//----- globals
const BAR_WIDTH = 240;


//----- class
export class Twister extends Animation {

    //----- members
    private display_: Display;

    private angle_    : number;     // rotation angle
    private amplitude_: number;     // movement amplitude
    private ampway_   : number;     // movement way

    private texture_ : Surface;     // texture surface
    private slice_   : Size;        // texture slice size

    //----- methods
    constructor(display: Display) {
        super();

        // set the vars
        this.display_ = display;
        this.angle_ = 0;
        this.amplitude_ = 0;
        this.ampway_ = 0.05;
    }

    private loadTexture(name: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.src = name;
        });
    }

    // run the animation
    public run(): void {
        console.log("Starting the Twister animation.");

        // load the texture
        this.loadTexture('/images/ts-twister.asset.jpg').then(img => {

            // create the new surface
            this.texture_ = new Surface({width: img.width, height: img.height});
            this.texture_.context.drawImage(img, 0, 0);
            console.log('Texture loaded.');

            // set the slice size
            this.slice_ = {
                width: img.width >> 2,
                height: img.height
            }

            // toggle the animation
            this.toggle();

            // run the animation on the next frame
            requestAnimationFrame(this.main.bind(this));
        });
    }

    // update the animation
    protected update(timestamp: number): void {
        if (!this.isAnimated)
            return;

        // setup vars
        let x0 = this.display_.width >> 1;
        let w  = BAR_WIDTH >> 1;

        // erase the surface
        this.display_.surface.clear({x:200, y:0, w:250, h:480});

        // retrieve the backbuffer/texture data
        let imgdata = this.display_.surface.data;
        let texdata = this.texture_.data;


        for (let y = 0; y < this.display_.height; y++) {
            let fv = 1.0 * y / this.display_.height;

            // compute the position of each point
            let a = radians(90);
            let x1 = x0 + (w * Math.sin(this.amplitude_ * fv + this.angle_ + a * 0));
            let x2 = x0 + (w * Math.sin(this.amplitude_ * fv + this.angle_ + a * 1));
            let x3 = x0 + (w * Math.sin(this.amplitude_ * fv + this.angle_ + a * 2));
            let x4 = x0 + (w * Math.sin(this.amplitude_ * fv + this.angle_ + a * 3));

            // compute the texture coordinate / offset
            let yt = Math.floor(fv * this.texture_.height);
            let ot = yt * this.texture_.width;

            // draw the lines
            if (x1 < x2) {
                // xt begin/end for this slice
                let xtb = this.slice_.width * 0;
                let xte = xtb + this.slice_.width;

                let offset = (y * this.display_.width + x1) << 2;
                let ratio = (xte - xtb) / (x2 - x1);
                let addr = ot + xtb;

                for (let x = x1; x < x2; x++) {
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 0];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 1];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 2];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 3];
                    addr += ratio;
                }
            }

            if (x2 < x3) {
                // xt begin/end for this slice
                let xtb = this.slice_.width * 1;
                let xte = xtb + this.slice_.width;

                let offset = (y * this.display_.width + x2) << 2;
                let ratio = (xte - xtb) / (x3 - x2);
                let addr = ot + xtb;

                for (let x = x2; x < x3; x++) {
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 0];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 1];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 2];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 3];
                    addr += ratio;
                }
            }

            if (x3 < x4) {
                // xt begin/end for this slice
                let xtb = this.slice_.width * 2;
                let xte = xtb + this.slice_.width;

                let offset = (y * this.display_.width + x3) << 2;
                let ratio = (xte - xtb) / (x4 - x3);
                let addr = ot + xtb;

                for (let x = x3; x < x4; x++) {
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 0];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 1];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 2];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 3];
                    addr += ratio;
                }
            }

            if (x4 < x1) {
                // xt begin/end for this slice
                let xtb = this.slice_.width * 3;
                let xte = xtb + this.slice_.width;

                let offset = (y * this.display_.width + x4) << 2;
                let ratio = (xte - xtb) / (x1 - x4);
                let addr = ot + xtb;

                for (let x = x4; x < x1; x++) {
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 0];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 1];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 2];
                    imgdata.data[offset++] = texdata.data[(addr << 2) + 3];
                    addr += ratio;
                }
            }
        }

        this.display_.surface.data = imgdata;
    }

    // render the animation on the screen
    protected render(timestamp: number): void {
        if (!this.isAnimated)
            return;

        // update the angle
        this.angle_ += 0.035;

        // update the amplitude every 50 frames
        if (this.frames_ % 50 == 0) {
            this.amplitude_ += this.ampway_;
            if ((this.amplitude_ <= 0) || (this.amplitude_ > 1.8))
                this.ampway_ *= -1;
        }

        // flip the back-buffer onto the screen
        this.display_.clear();
        this.display_.draw();

        // increase the frames count
        this.frames_++;
    }

    // main animation function
    protected main(timestamp: number): void {
        this.update(timestamp);
        this.render(timestamp);
        requestAnimationFrame(this.main.bind(this));
    }
}