/*
 * @file    main.ts
 * @author  Sebastien LEGRAND
 *
 * @brief   Typescript file for the main page
 */

//----- imports

//----- globals
const PREVIOUS_BUTTON = 0;
const NEXT_BUTTON = 1;


//----- interfaces
// query results
interface QueryResult {
    ok: boolean,
    json: <T>() => T,
}

// configuration items
interface Config {
    name: string,
    title: string,
    description: string
}

// button parameters
interface Button {
    enable: boolean,
    button: HTMLButtonElement
}


//----- functions


//----- class
class Slider {

    //----- members
    private display_: HTMLCanvasElement;        // the display canvas
    private buttons_: Button[];                 // element buttons

    private config_: Config[];                  // configuration from NodeJS

    private nImage_: HTMLImageElement;          // next image to display

    private maxImage_: number;                  // max number of images loaded
    private curImage_: number;                  // current image displayed


    //----- methods
    constructor(output: HTMLCanvasElement, prev: HTMLButtonElement, next: HTMLButtonElement) {
        // set the vars
        this.display_  = output;
        this.nImage_   = new Image();
        this.maxImage_ = 0;
        this.curImage_ = 0;

        // retrieve the configuration from the NodeJS server
        this.config_ = [];
        this.request().then((result: QueryResult) => {
            let json: any = result.json();
            this.config_ = json['effects'];


            // initialize counters
            this.maxImage_ = this.config_.length;
            this.curImage_ = 0;

            // load the first image
            this.loadImage(this.curImage_);
            this.loadCredits();
        });

        // set the buttons properties
        this.buttons_ = [
            {
                enable: false,
                button: prev
            },
            {
                enable: true,
                button: next
            }
        ]

        // add handlers to the buttons
        prev.addEventListener('click', () => {this.previousImage()});
        next.addEventListener('click', () => {this.nextImage()});

        // set the previous button as inactive
        prev.className += " inactive";
    }

    // parse the result from the Ajax query
    private parseResult(xhr: XMLHttpRequest): QueryResult {
        return {
            ok: (xhr.status >= 200) && (xhr.status < 300),
            json: <T>() => JSON.parse(xhr.responseText) as T
        }
    }

    // Ajax query to retrieve the configuration
    private request(): Promise<QueryResult> {
        return new Promise<QueryResult>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("get", "/config");

            xhr.onload = evt => {
                resolve(this.parseResult(xhr));
            }

            xhr.send();
        });
    }

    // load an image
    private loadImage(index: number): void {
        if ((index < 0) || (index >= this.maxImage_)) {
            console.log(`index (${this.curImage_}) out of boundaries [0, ${this.maxImage_}].`);
            return;
        }

        let name = this.config_[index]['name'] + '.screenshot.png';

        this.nImage_ = new Image();
        this.nImage_.onload = () => {
            this.display_.getContext("2d")!.drawImage(this.nImage_, 0, 0);
        };
        this.nImage_.src = '/images/screenshot/' + name;
    }

    // set the name and description for the effect
    private loadCredits(): void {
        let index = this.curImage_;
        let name  = this.config_[index]['name'];
        let title = this.config_[index]['title'];
        let desc  = this.config_[index]['description'];

        // set the title
        let html = '<a href="/' + name + '">&#10095;&#10095 ' + title + '</a>';
        document.getElementById("effect-name")!.innerHTML = html;
        document.getElementById("effect-desc")!.innerText = desc;
    }

    // next image
    public nextImage(): void {
        if (!this.buttons_[NEXT_BUTTON].enable)
            return

        this.curImage_ = this.curImage_ + 1;

        // set the next button as inactive if we reached the end
        if (this.curImage_ == this.maxImage_ - 1) {
            this.buttons_[NEXT_BUTTON].enable = false;
            this.buttons_[NEXT_BUTTON].button.className += " inactive";
        }

        // load the new image
        this.loadImage(this.curImage_);
        this.loadCredits();

        // activate the previous button
        if (!this.buttons_[PREVIOUS_BUTTON].enable) {
            this.buttons_[PREVIOUS_BUTTON].enable = true;
            this.buttons_[PREVIOUS_BUTTON].button.className = "prev";
        }
    }

    // previous image
    public previousImage(): void {
        if (!this.buttons_[PREVIOUS_BUTTON].enable)
            return

        this.curImage_ = this.curImage_ - 1;

        // set the previous button as inactive if we reached the beginning
        if (this.curImage_ == 0) {
            this.buttons_[PREVIOUS_BUTTON].enable = false;
            this.buttons_[PREVIOUS_BUTTON].button.className += " inactive";
        }

        // load the new image
        this.loadImage(this.curImage_);
        this.loadCredits();

        // activate the next button
        if (!this.buttons_[NEXT_BUTTON].enable) {
            this.buttons_[NEXT_BUTTON].enable = true;
            this.buttons_[NEXT_BUTTON].button.className = "next";
        }
    }
}

//----- begin
// retrieve the elements from the page
let output = <HTMLCanvasElement> document.getElementById("output");
let prev = <HTMLButtonElement> document.getElementById("prev");
let next = <HTMLButtonElement> document.getElementById("next");


// create a new instance of the slider
let slider = new Slider(output, prev, next);
