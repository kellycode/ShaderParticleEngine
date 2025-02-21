module.exports = function( grunt ) {
    'use strict';

    var packageJSON = grunt.file.readJSON( 'package.json' );
    var addHeader = 'import * as THREE from "three";';

    var licenseBanner =
        '/* ' + packageJSON.name + ' ' + packageJSON.version + '\n' +
        ' * ' + '\n' +
        ' * (c) 2015 Luke Moody (http://www.github.com/squarefeet)' + '\n' +
        ' *     Originally based on Lee Stemkoski\'s original work (https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/js/ParticleEngine.js).' + '\n' +
        ' *' + '\n' +
        ' * ' + packageJSON.name + ' may be freely distributed under the MIT license (See LICENSE at root of this repository.)' + '\n */\n';


    // Specify input files and output paths
    var files = [
            'src/SPE.js',
            'src/helpers/SPE.TypedArrayHelper.js',
            'src/helpers/SPE.ShaderAttribute.js',
            'src/shaders/SPE.shaderChunks.js',
            'src/shaders/SPE.shaders.js',
            'src/core/SPE.utils.js',
            'src/core/SPE.Group.js',
            'src/core/SPE.Emitter.js'
        ],
        outputPath = 'build/SPE.js',
        outputPathMin = outputPath.replace( '.js', '.min.js' );


    var uglifySettings = {
        min: {
            options: {
                mangle: true,
                exportAll: true,
                compress: {
                    dead_code: true,
                },
                banner: licenseBanner,
                report: 'min',
                maxLineLen: 1000
            },
            files: {}
        }
    };

    // Set the path for where the minified files should be saved
    uglifySettings.min.files[ outputPathMin ] = [ outputPath ];


    grunt.initConfig( {
        uglify: uglifySettings,

        concat: {
            options: {
                separator: '\n\n',
                banner: licenseBanner,
                footer: '\n// export default SPE;'
            },
            dist: {
                src: files,
                dest: outputPath,
            },
        },

        jsdoc: {
            dist: {
                src: 'src/**/*.js',
                options: {
                    destination: 'docs/api'
                }
            }
        },

    } );

    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );

    grunt.registerTask( 'default', [ 'concat', 'uglify' ] );
};