// Copyright 2020, University of Colorado Boulder

/**
 * @author Todd Holden (Queensborough Community College of CUNY)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Lattice from './Lattice.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import xrayDiffraction from '../../xrayDiffraction.js';

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
  
       this.lattice = new Lattice ( new Vector3( 3.82, 3.89, 7.8 ) , 0 );
       this.sourceAngleProperty = new NumberProperty( Math.PI / 3 );
       this.sourceWavelengthProperty = new NumberProperty( 8 );
       this.horizontalRaysProperty = new NumberProperty( 0 );
       this.verticalRaysProperty = new NumberProperty( 2 );
       this.animateProperty = new BooleanProperty( false );
       this.pathDifferenceProperty = new BooleanProperty( false );
       this.showParmsProperty = new BooleanProperty( false );
       this.showWaveFrontsProperty = new BooleanProperty( false );

       this.pLDProperty = new DerivedProperty( [this.lattice.latticeConstantsP, this.sourceAngleProperty ], computepLD );
       this.pLDWavelengthsProperty = new DerivedProperty( [this.pLDProperty, this.sourceWavelengthProperty], computepLDWavelengths );

       this.startPhase = 0 ;
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
    this.startPhase = 0 ;
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
    if (this.animateProperty.value) {
      this.startPhase = this.startPhase - 3 * dt;
      this.stepEmitter.emit( dt );
    }
  }
}

function computepLD( constants, theta ) {
  return 2 * constants.z * Math.sin(theta);
}

function computepLDWavelengths( pLD, wavelength ) {
  return pLD/wavelength;
}

xrayDiffraction.register( 'XrayDiffractionModel', XrayDiffractionModel );
export default XrayDiffractionModel;