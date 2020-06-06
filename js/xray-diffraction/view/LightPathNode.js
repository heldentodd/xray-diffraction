// Copyright 2019-2020, University of Colorado Boulder

/**
 * Draws a sinusoidal wave with a dashed line to represent a light path. Can also display wavefronts in multicolor.
 *
 * @author Todd Holden (Queensborough Community College of CUNY)
 */
  // modules
  import merge from '../../../../phet-core/js/merge.js';
  import Node from '../../../../scenery/js/nodes/Node.js';
  import Path from '../../../../scenery/js/nodes/Path.js';
  import Shape from '../../../../kite/js/Shape.js';
  import Utils from '../../../../dot/js/Utils.js';
  import Vector2 from '../../../../dot/js/Vector2.js';
  import xrayDiffraction from '../../xrayDiffraction.js';
 
  // constants
  
  class LightPathNode extends Node {
    /**
     * @param {Vector2} startPoint - where light beam starts
     * @param {Vector2} endPoint - where light beam ends
     * @param {number} wavelength - wavelength of beam, units??
     */
    constructor( startPoint, endPoint, wavelength, options ) {

      options = merge( {
        amplitude: 10,  // amplitude of the wave. Might be better to have default amplitude: (endPoint - startPoint)/10
        startPhase: 0, // initial phase of the wave (0 for cosine wave)
        waveFrontWidth: 0, // 0 for no wavefronts
        stroke: 'black', // color of sine wave
        centerStroke: 'gray', // color of dashed baseline
        lineWidth: 2  // width of sine wave, double width of center line
      }, options );

      const length = endPoint.distance(startPoint);
      const segments = Utils.roundSymmetric( length / wavelength * 16 ); // resolution - number of points 16 points/wavelength
      const theta = endPoint.minus(startPoint).getAngle();
      const wnK = 2 * Math.PI / wavelength;
      
      //----------------------------------------------------------------------------------------

      super();
      let shape0 = new Shape();
      const shape1 = new Shape();
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      shape0.moveToPoint( startPoint );
      shape0.lineToPoint( endPoint );
      shape0 = shape0.getDashedShape( [ 8 ], 0 );
      let pointFromStart = new Vector2( options.amplitude * Math.cos( options.startPhase ) * sinTheta,
                                       -options.amplitude * Math.cos( options.startPhase ) * cosTheta);
      shape1.moveToPoint( startPoint.plus(pointFromStart) );
      for ( let i = 0; i < segments; i++ ) {
        const currentL = i * length / (segments - 1);
        pointFromStart = new Vector2( currentL * cosTheta + options.amplitude * Math.cos( wnK * currentL + options.startPhase ) * sinTheta,
                                      currentL * sinTheta - options.amplitude * Math.cos( wnK * currentL + options.startPhase ) * cosTheta);
        shape1.lineToPoint( startPoint.plus(pointFromStart) );
      }
      const path0 = new Path( shape0, {
        stroke: options.centerStroke,
        lineWidth: options.lineWidth/2
      });
      //console.log(options.stroke);
      const path1 = new Path( shape1, {
        stroke: options.stroke,
        lineWidth: options.lineWidth
      } );

      // this is the light wave
      this.addChild( path0 );
      this.addChild( path1 );

      // logic to show wavefronts
      if (options.waveFrontWidth) {
        const firstWaveFront = options.startPhase/2/Math.PI;
        const firstWaveFrontLength = firstWaveFront * wavelength;
        const waveFrontAmp = new Vector2(options.waveFrontWidth / 2 * sinTheta, - options.waveFrontWidth / 2 * cosTheta);
        for (let i = Math.ceil(firstWaveFront); i < firstWaveFront + length/wavelength; i++ ) {
          const waveFrontPosition = new Vector2( (firstWaveFrontLength - i * wavelength) * cosTheta,
                                                 (firstWaveFrontLength - i * wavelength) * sinTheta );
          this.addChild( new Path( Shape.lineSegment( startPoint.minus(waveFrontPosition).plus(waveFrontAmp),
                                                      startPoint.minus(waveFrontPosition).minus(waveFrontAmp)), {
            stroke: 'hsl('+ ((60 * i % 360) + 360 ) % 360 +', 100%, 50%)',
            lineWidth: 3
          } ) );
        }
      }
    }
  }

xrayDiffraction.register( 'LightPathNode', LightPathNode );
export default LightPathNode;