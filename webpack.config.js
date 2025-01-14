
//----- imports
const CopyPlugin = require("copy-webpack-plugin");
const NodeExternals = require("webpack-node-externals");
const path = require("path");
const glob = require("glob");


//----- globals
const PUBLIC_DIR = path.join(__dirname, "public");


//----- functions

// find all the images in the directory structure
function findImages() {
    let images = [];
    let rootdir = path.join(__dirname, "files");

    let files = glob.sync(`${rootdir}{/**/*.png,/**/*.jpg}`);

    if (files.length > 0) {
        files.forEach(file => {
            let dirs = path.dirname(file).split(path.sep);
            let dirname = dirs[dirs.length - 1];
            images.push({
                from: file,
                to: `${PUBLIC_DIR}/images/${dirname}`
            });
        });
    }

    return images
}

// find all the CSS in the directory structure
function findStylesheets() {
    let css = [];
    let rootdir = path.join(__dirname, "files");

    let files = glob.sync(`${rootdir}/**/*.css`);

    if (files.length > 0) {
        files.forEach(file => {
            css.push({
                from: file,
                to: `${PUBLIC_DIR}/css`
            });
        });
    }

    return css
}

// find all the PUG files in the directory structure
function findViews() {
    let pug = [];
    let rootdir = path.join(__dirname, "files");

    let files = glob.sync(`${rootdir}/**/*.pug`);

    if (files.length > 0) {
        files.forEach(file => {
            pug.push({
                from: file,
                to: `${PUBLIC_DIR}/views`
            });
        });
    }

    return pug
}

// find all the entry-points
function findEntryPoints() {
    let entry_points = {
        express: path.join(__dirname, "files/server/src/app.ts"),
        main: path.join(__dirname, "files/server/src/main.ts")
    };
    let rootdir = path.join(__dirname, "files/effects");

    let files = glob.sync(`${rootdir}/**/main.ts`);

    if (files.length > 0) {
        files.forEach(file => {
            // retrieve the directory
            let dirs = path.dirname(file).split('/');
            let name = dirs[dirs.length - 2];

            entry_points[name] = file;
        });
    }

    return entry_points;
}

// find all the 3D models
function find3DModels() {
    let models = [];
    let rootdir = path.join(__dirname, "files");

    let files = glob.sync(`${rootdir}/**/models/*.json`);
    if (files.length > 0) {
        files.forEach(file => {
            models.push({
                from: file,
                to: `${PUBLIC_DIR}/models/`
            });
        });
    }

    return models
}

//----- begin
// find files for the CopyPlugins
let copy_plugin_pattern = [].concat(findImages())
                            .concat(findStylesheets())
                            .concat(findViews())
                            .concat(find3DModels());

// find all the entry-points
let entry_points = findEntryPoints();

//----- webpack config
module.exports = {
    // entry point
    entry: entry_points,

    // output point
    output: {
        path: PUBLIC_DIR + "/js",
        filename: '[name].bundle.js',
        clean: true
    },

    // plugins
    plugins: [
        new CopyPlugin({patterns: copy_plugin_pattern}),
    ],

    // module rules
    module: {
        rules: [
            // typescript compilation
            {
                test: /\.ts$/i,
                use: [ "ts-loader" ],
            },
        ]
    },
    resolve: {
        modules: [
            path.resolve('./files/')
        ],
        extensions: ['.ts', '.js'],
    },
    externals: [ NodeExternals() ]
};