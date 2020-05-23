// Copyright 2020, University of Colorado Boulder

/**
 * Model for a crystall lattice. A screen can have multiple graphs. Graphs should be subtypes.
 *
 * Graphs are responsible for:
 *   - storing the lattice constants.
 *   - Keeping track of the angle (orientation) of the crystal.
 *
 * @author Todd Holden (Queensborough Community College of CUNY)
 */

  // modules
  import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
  import NumberProperty from '../../../../axon/js/NumberProperty.js';
  import Vector2 from '../../../../dot/js/Vector2.js';
  import Vector3 from '../../../../dot/js/Vector3.js';
  import xrayDiffraction from '../../xrayDiffraction.js';

  //----------------------------------------------------------------------------------------
  // constants

  // comment for constants
  //const SCREEN_VIEW_BOUNDS = VectorAdditionConstants.SCREEN_VIEW_BOUNDS;
  
  class Lattice {

    /**
    * Create a new sample crystal model. The mutable lattice constants (Assumed orthorhombic for now) and orientation.
    *
    * @param {Vector3} latticeConstants - the lattice constants of the sample in angstrom
    * @param {number} orientation - Theta, // phi, (and third as a ToDo) in radians
    * @constructor
    */
    constructor( latticeConstants, orientation ) {

      //super( latticeConstants, orientation );

      this.anglePhiProperty = new NumberProperty( 0 );
      
      // @public {Vector3} the Lattice Constants of the sample (a, b, c)
      this.aConstantProperty = new NumberProperty( latticeConstants.x );
      this.bConstantProperty = new NumberProperty( latticeConstants.y );
      this.cConstantProperty = new NumberProperty( latticeConstants.z );
      this.latticeConstantsP = new DerivedProperty( [this.aConstantProperty, this.bConstantProperty, this.cConstantProperty ], combineConstants );
      
      // @public {number} the orientation in radians relative to the incoming light
      this.orientationP =  new NumberProperty( orientation );

      this.reciprocalBasis = new Vector3( 2 * Math.PI / latticeConstants.x , 2 * Math.PI / latticeConstants.y , 2 * Math.PI / latticeConstants.z);
  
      //could also make this.sites and 2D array of arrays
      this.sites = new Array();
      this.updateSites();
    }

    /**
     * Resets the graph. Called when the reset all button is clicked.
     * @public
     */
    reset() {
      this.anglePhiProperty.reset();
      //this.latticeConstantsP.reset();
      this.orientationP.reset();
      this.aConstantProperty.reset();
      this.bConstantProperty.reset();
      this.cConstantProperty.reset();
    }

    /**
     * put functions here
     * @public
     */

    updateSites() {
      /**
     * Returns an array of lattice points
     * @returns {Array}
     * @private
     */// Called when lattice constant changes or crystal rotates.

      // should set above or in initialization file. Perhaps better to confine it to a shape.
      const aLattice = this.latticeConstantsP.get().x;
      const cLattice = this.latticeConstantsP.get().z;
      const CrystalXMax = 20 / aLattice; // Must be at least 1 to have a three row lattice
      const CrystalYMax = 20 / cLattice;

      const cosTheta = Math.cos(this.orientationP.get());
      const sinTheta = Math.sin(this.orientationP.get());
      //console.log(cosTheta, sinTheta);

      let topRowSpacingHalf = 0;
      if (Math.abs(cosTheta) > 0.7071068) {
        topRowSpacingHalf = aLattice * Math.abs(cosTheta) / 2;
      } else {
        topRowSpacingHalf = cLattice * Math.abs(sinTheta) / 2;
      }
      const aSin = aLattice * sinTheta;
      const aCos = aLattice * cosTheta;
      const cSin = cLattice * sinTheta;
      const cCos = cLattice * cosTheta;

      this.sites.length = 0;
      for( let x = 0; x <= CrystalXMax ; x++) {
        for( let y = 0; y <= CrystalYMax ; y++) {
          const xSin = x * aSin;
          const xCos = x * aCos;
          const ySin = y * cSin;
          const yCos = y * cCos;
          this.sites.push( new Vector2(xCos - ySin , xSin + yCos ) );
          this.sites.push( new Vector2(-xCos - ySin , -xSin + yCos) );
          this.sites.push( new Vector2(-xCos + ySin , -xSin - yCos) );
          this.sites.push( new Vector2(ySin + xCos , xSin - yCos) );
          //Find top, center atom and place it in sites[0]. sites[1,2,3] are all still the origin.
          //We only need to do this for max x and max y if we need to optimize. Could be separated out
          if((Math.abs(xCos - ySin) <= topRowSpacingHalf) && ((Math.abs(yCos - xSin) > this.sites[0].y))) {
            if( (yCos - xSin) > 0 ) {
              this.sites[0] = new Vector2(xCos - ySin , yCos - xSin);
            } else {
              this.sites[0] = new Vector2(ySin - xCos , xSin - yCos);
            }
          } else if ((Math.abs(xCos + ySin) <= topRowSpacingHalf) && ((Math.abs(yCos + xSin) > this.sites[0].y))) {
            if( (xCos + ySin) > 0 ) {
              this.sites[0] = new Vector2(xCos + ySin , -xSin - yCos);
            } else {
              this.sites[0] = new Vector2(-xCos - ySin , xSin + yCos);
            }
          }
        }
      }
      return;
    }
  }

  function combineConstants( a, b, c ) {
    return new Vector3(a, b, c);
  }
  
xrayDiffraction.register( 'Lattice', Lattice );
export default Lattice;