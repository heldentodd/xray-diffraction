// Copyright 2020, University of Colorado Boulder

/**
 * @author Todd Holden (Queensborough Community College of CUNY)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import xrayDiffraction from '../../xrayDiffraction.js';
import Lattice from './Lattice.js';

/**
 * @constructor
 */
class XrayDiffractionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    assert && assert( tandem instanceof Tandem, 'invalid tandem' );

    // @protected - used to signal when a sim step has occurred
    this.stepEmitter = new Emitter( { parameters: [ { valueType: 'number' } ] } );

    // @private - these are the parameters set by the simulation's control panel
    // Default initial values are sometimes arbitrary, but chosen as noted below
    this.lattice = new Lattice( new Vector3( 3.82, 3.89, 7.8 ), 0 ); // lattice constants for YBCO (High-Tc superconductor in Angstrom)
    this.sourceAngleProperty = new NumberProperty( Math.PI / 3 ); // 60 degrees. Just looks good
    this.sourceWavelengthProperty = new NumberProperty( 8 );  // My preference. Similar to but a little bigger than the c-lattice constant
    this.horizontalRaysProperty = new NumberProperty( 0 );  // horizontal rays are a bit of a distraction at the beginning
    this.verticalRaysProperty = new NumberProperty( 2 );  // Two vertical rays shows the path length difference (PLD) well
    this.animateProperty = new BooleanProperty( false );  // Let the student turn on the animation. To be replaced with a play button
    this.pathDifferenceProperty = new BooleanProperty( false );  // Let the student turn it on so that they can think about it
    this.showParmsProperty = new BooleanProperty( false );  // Numerical details better left for later
    this.showWaveFrontsProperty = new BooleanProperty( false ); // Helps to explain the concept, but better left for later.

    // @private - These are automatically calculated from other properties
    // They also exist for the entire life of the sim, so there is no need to dispose.
    this.pLDProperty = new DerivedProperty( [ this.lattice.latticeConstantsProperty, this.sourceAngleProperty ],
      ( constants, theta ) => 2 * constants.z * Math.sin( theta ) );
    this.pLDWavelengthsProperty = new DerivedProperty( [ this.pLDProperty, this.sourceWavelengthProperty ],
      ( pLD, wavelength ) => pLD / wavelength );

    // @private - initial phase of the incoming beam. Starts as a cosine function.
    // Probably wouldn't hurt to change this, but no real reason to do so. It is updated by the step function.
    this.startPhase = 0;
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.sourceAngleProperty.reset();
    this.sourceWavelengthProperty.reset();
    this.horizontalRaysProperty.reset();
    this.verticalRaysProperty.reset();
    this.animateProperty.reset();
    this.pathDifferenceProperty.reset();
    this.showParmsProperty.reset();
    this.showWaveFrontsProperty.reset();
    this.lattice.reset();
    this.startPhase = 0;
  }

  /**
   * Registers a listener to be called at each step of the model execution
   * @param {function()} listener
   * @public
   */
  addStepListener( listener ) {
    this.stepEmitter.addListener( listener );
  }

  /**
   * Steps the model.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    if ( this.animateProperty.value ) {
      // The following sets the speed of light at 3 Angstrom/s (ω = 2πv/λ = 2π x 3/λ = 18.85/λ)
      this.startPhase = this.startPhase - 19 / this.sourceWavelengthProperty.value * dt;
      this.stepEmitter.emit( dt );
    }
  }
}

xrayDiffraction.register( 'XrayDiffractionModel', XrayDiffractionModel );
export default XrayDiffractionModel;