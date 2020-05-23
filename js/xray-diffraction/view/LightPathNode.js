// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the Crystal lattice
 *
 * @author Todd Holden (Queensborough Community College of CUNY)
 */
  // modules
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
     * @param {number} amplitude - amplitude of "oscillation"
     * @param {number} startPhase - initial phase of the wave
     * @param {boolean} showWaveFronts - initial phase of the wave
     * @param {number} waveFrontAmp - initial phase of the wave
     */
    constructor( startPoint, endPoint, wavelength, amplitude, startPhase, showWaveFronts, waveFrontWidth ) {
      const length = endPoint.distance(startPoint);
      const segments = Utils.roundSymmetric( length / wavelength * 16 ); // resolution - number of points - arbitrary
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
      let pointFromStart = new Vector2( amplitude * Math.cos( startPhase ) * sinTheta, -amplitude * Math.cos( startPhase ) * cosTheta);
      shape1.moveToPoint( startPoint.plus(pointFromStart) );
      for ( let i = 0; i < segments; i++ ) {
        const currentL = i * length / (segments - 1);
        pointFromStart = new Vector2( currentL * cosTheta + amplitude * Math.cos( wnK * currentL + startPhase ) * sinTheta,
                                            currentL * sinTheta - amplitude * Math.cos( wnK * currentL + startPhase ) * cosTheta);
        shape1.lineToPoint( startPoint.plus(pointFromStart) );
      }
      const path0 = new Path( shape0, {
        stroke: 'gray',
        lineWidth: 1
      });
      const path1 = new Path( shape1, {
        stroke: 'black',
        lineWidth: 2
      } );
      // this is the light wave !!!
      this.addChild( path0 );
      this.addChild( path1 );

      // logic to show wavefronts
      if (showWaveFronts) {
        const firstWaveFront = startPhase/2/Math.PI;
        const firstWaveFrontLength = firstWaveFront * wavelength;
        const waveFrontAmp = new Vector2(waveFrontWidth / 2 * sinTheta, - waveFrontWidth / 2 * cosTheta);
        for (let i = Math.ceil(firstWaveFront); i < firstWaveFront + length/wavelength; i++ ) {
          const waveFrontPosition = new Vector2( (firstWaveFrontLength - i * wavelength) * cosTheta, (firstWaveFrontLength - i * wavelength) * sinTheta );
          this.addChild( new Path( Shape.lineSegment( startPoint.minus(waveFrontPosition).plus(waveFrontAmp), startPoint.minus(waveFrontPosition).minus(waveFrontAmp)), {
            stroke: 'hsl('+ 60 * i +', 100%, 50%)',
            lineWidth: 3
      //      lineDash: lineDash
          } ) );
        }
      }
    }

    /**
     * Double check to make sure vector sums are never disposed
     * @public
     * @override
     */
    //dispose() { assert && assert( false, 'vector sums are never disposed' ); }
  }

xrayDiffraction.register( 'LightPathNode', LightPathNode );
export default LightPathNode;