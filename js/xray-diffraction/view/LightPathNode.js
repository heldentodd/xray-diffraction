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
   * @param {number} wavelength - wavelength of beam in Angstrom
   * @param {Object} [options]
   */
  constructor( startPoint, endPoint, wavelength, options ) {

    assert && assert( wavelength > 0, `wavelength should be positive: ${wavelength}` );

    options = merge( {
      // @public - options provided to override default appearance of wave, including showing the wavefronts
      amplitude: 10,  // amplitude of the wave. Might be better to have default amplitude: (endPoint - startPoint)/10
      startPhase: 0, // initial phase of the wave (0 for cosine wave)
      waveFrontWidth: 0, // 0 for no wavefronts
      stroke: 'black', // color of sine wave
      centerStroke: 'gray', // color of dashed baseline
      lineWidth: 2  // width of sine wave, double width of center line
    }, options );

    const length = endPoint.distance( startPoint );
    const segments = Utils.roundSymmetric( length / wavelength * 16 ); // resolution - number of points 16 points/wavelength
    const theta = endPoint.minus( startPoint ).getAngle();
    const wnK = 2 * Math.PI / wavelength;

    //----------------------------------------------------------------------------------------

    super();
    let rayShape = new Shape();
    const waveShape = new Shape();
    const cosTheta = Math.cos( theta );
    const sinTheta = Math.sin( theta );
    rayShape.moveToPoint( startPoint );
    rayShape.lineToPoint( endPoint );
    rayShape = rayShape.getDashedShape( [ 8 ], 0 );
    let pointFromStart = new Vector2( options.amplitude * Math.cos( options.startPhase ) * sinTheta,
      -options.amplitude * Math.cos( options.startPhase ) * cosTheta );
    waveShape.moveToPoint( startPoint.plus( pointFromStart ) );
    for ( let i = 0; i < segments; i++ ) {
      const currentL = i * length / ( segments - 1 );
      pointFromStart = new Vector2( currentL * cosTheta + options.amplitude * Math.cos( wnK * currentL + options.startPhase ) * sinTheta,
        currentL * sinTheta - options.amplitude * Math.cos( wnK * currentL + options.startPhase ) * cosTheta );
      waveShape.lineToPoint( startPoint.plus( pointFromStart ) );
    }
    const rayPath = new Path( rayShape, {
      stroke: options.centerStroke,
      lineWidth: options.lineWidth / 2
    } );
    const wavePath = new Path( waveShape, {
      stroke: options.stroke,
      lineWidth: options.lineWidth
    } );

    // this is the light wave
    this.addChild( rayPath );
    this.addChild( wavePath );

    // logic to show wavefronts
    if ( options.waveFrontWidth ) {
      const firstWaveFront = options.startPhase / 2 / Math.PI;
      const firstWaveFrontLength = firstWaveFront * wavelength;
      const waveFrontAmp = new Vector2( options.waveFrontWidth / 2 * sinTheta, -options.waveFrontWidth / 2 * cosTheta );
      for ( let i = Math.ceil( firstWaveFront ); i < firstWaveFront + length / wavelength; i++ ) {
        const waveFrontPosition = new Vector2( ( firstWaveFrontLength - i * wavelength ) * cosTheta,
          ( firstWaveFrontLength - i * wavelength ) * sinTheta );
        this.addChild( new Path( Shape.lineSegment( startPoint.minus( waveFrontPosition ).plus( waveFrontAmp ),
          startPoint.minus( waveFrontPosition ).minus( waveFrontAmp ) ), {
          stroke: 'hsl(' + ( ( 60 * i % 360 ) + 360 ) % 360 + ', 100%, 50%)', // gives 60*i gives 6 different colors
          lineWidth: 3
        } ) );
      }
    }
  }
}

xrayDiffraction.register( 'LightPathNode', LightPathNode );
export default LightPathNode;