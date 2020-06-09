// Copyright 2020, University of Colorado Boulder

/**
 * Model for a crystall lattice.
 * responsible for:
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
const CRYSTAL_SIZE = 20; // size of the crystal in Angstrom. Width and Height from the center

class Lattice {

  /**
   * Create a new sample crystal model. The mutable lattice constants (Assumed orthorhombic for now) and orientation.
   *
   * @param {Vector3} latticeConstants - the lattice constants of the sample in angstrom
   * @param {number} orientation - Theta, // phi, (and third as a ToDo) in radians
   * @constructor
   */
  constructor( latticeConstants, orientation ) {

    assert && assert( latticeConstants.x > 0, `Lattice constants should be positive: ${latticeConstants.x}` );
    assert && assert( latticeConstants.y > 0, `Lattice constants should be positive: ${latticeConstants.y}` );
    assert && assert( latticeConstants.z > 0, `Lattice constants should be positive: ${latticeConstants.z}` );
    assert && assert( orientation > -7 && orientation < 7, `Orientation (radians) normally < 2π: ${orientation}` );

    // @public {Vector3} the Lattice Constants of the sample (a, b, c) - if these change, updateSites should be called.
    // These are needed for the entire life of the simulation, and thus are never disposed.
    this.aConstantProperty = new NumberProperty( latticeConstants.x );
    this.bConstantProperty = new NumberProperty( latticeConstants.y );
    this.cConstantProperty = new NumberProperty( latticeConstants.z );
    this.latticeConstantsProperty = new DerivedProperty( [ this.aConstantProperty, this.bConstantProperty, this.cConstantProperty ],
      ( a, b, c ) => new Vector3( a, b, c ) );

    // @public {number} the orientation in radians relative to the incoming light
    this.orientationProperty = new NumberProperty( orientation );

    // @public (read-only) {Array.<Vector>} the points on the lattice. Should only be changed with the updateSites call.
    this.sites = [];
    this.updateSites();
  }

  /**
   * Resets the graph. Called when the reset all button is clicked.
   * @public
   */
  reset() {
    this.orientationProperty.reset();
    this.aConstantProperty.reset();
    this.bConstantProperty.reset();
    this.cConstantProperty.reset();
    this.updateSites();
  }

  /**
   * put functions here
   * @public
   */

  updateSites() {
    /**
     * recreates this.sites (lattice points) based on current parameters
     * @public - Called when lattice constant changes or crystal rotates.
     */

    // should set above or in initialization file. Perhaps better to confine it to a shape.
    const aLattice = this.latticeConstantsProperty.get().x;
    const cLattice = this.latticeConstantsProperty.get().z;
    const crystalXMax = CRYSTAL_SIZE / aLattice; // Must be at least 1 to have a three row lattice
    const crystalYMax = CRYSTAL_SIZE / cLattice;

    const cosTheta = Math.cos( this.orientationProperty.get() );
    const sinTheta = Math.sin( this.orientationProperty.get() );

    let topRowSpacingHalf;
    if ( Math.abs( cosTheta ) > 0.7071068 ) { // sqrt(2) for a rectangular lattice to see which face is on top
      topRowSpacingHalf = aLattice * Math.abs( cosTheta ) / 2;
    }
    else {
      topRowSpacingHalf = cLattice * Math.abs( sinTheta ) / 2;
    }
    const aSin = aLattice * sinTheta;
    const aCos = aLattice * cosTheta;
    const cSin = cLattice * sinTheta;
    const cCos = cLattice * cosTheta;

    this.sites.length = 0;
    for ( let x = 0; x <= crystalXMax; x++ ) {
      for ( let y = 0; y <= crystalYMax; y++ ) {
        const xSin = x * aSin;
        const xCos = x * aCos;
        const ySin = y * cSin;
        const yCos = y * cCos;
        this.sites.push( new Vector2( xCos - ySin, xSin + yCos ) );
        this.sites.push( new Vector2( -xCos - ySin, -xSin + yCos ) );
        this.sites.push( new Vector2( -xCos + ySin, -xSin - yCos ) );
        this.sites.push( new Vector2( ySin + xCos, xSin - yCos ) );

        // Find top, center atom and place it in sites[0]. sites[1,2,3] are all still the atom at the center (origin).
        // We only need to do this for max x and max y if we need to optimize. Could be separated out
        if ( ( Math.abs( xCos - ySin ) <= topRowSpacingHalf ) && ( ( Math.abs( yCos - xSin ) > this.sites[ 0 ].y ) ) ) {
          if ( ( yCos - xSin ) > 0 ) {
            this.sites[ 0 ] = new Vector2( xCos - ySin, yCos - xSin );
          }
          else {
            this.sites[ 0 ] = new Vector2( ySin - xCos, xSin - yCos );
          }
        }
        else if ( ( Math.abs( xCos + ySin ) <= topRowSpacingHalf ) && ( ( Math.abs( yCos + xSin ) > this.sites[ 0 ].y ) ) ) {
          if ( ( xCos + ySin ) > 0 ) {
            this.sites[ 0 ] = new Vector2( xCos + ySin, -xSin - yCos );
          }
          else {
            this.sites[ 0 ] = new Vector2( -xCos - ySin, xSin + yCos );
          }
        }
      }
    }
  }
}

xrayDiffraction.register( 'Lattice', Lattice );
export default Lattice;