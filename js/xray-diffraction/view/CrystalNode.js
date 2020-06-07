// Copyright 2019-2020, University of Colorado Boulder

/**
 * View for the Crystal lattice, displays a 2D array of atomic nuclei to represent the crystal.
 *
 * @author Todd Holden (Queensborough Community College of CUNY)
 */

// modules
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import RadialGradient from '../../../../scenery/js/util/RadialGradient.js';
import XrayDiffractionConstants from '../../common/XrayDiffractionConstants.js';
import xrayDiffraction from '../../xrayDiffraction.js';
import xrayDiffractionStrings from '../../xrayDiffractionStrings.js';

// strings
const aLatticeConstantString = xrayDiffractionStrings.aLatticeConstant;
const bLatticeConstantString = xrayDiffractionStrings.bLatticeConstant;
const interplaneDistanceString = xrayDiffractionStrings.interplaneDistance;

// constants
const RADIUS = 5;   // Atomic Nucleus Radius
const DIMENSION_ARROW_OPTIONS = { fill: 'black', stroke: null, tailWidth: 2, headWidth: 7, headHeight: 20, doubleHead: true };
const SCALE_FACTOR = XrayDiffractionConstants.SCALE_FACTOR;

class CrystalNode extends Node {
  /**
   * @param { Object } lattice - describes lattice. lattice.sites is an Array of Vector2 points for the crystal lattice
   */
  constructor( lattice ) {

    //----------------------------------------------------------------------------------------
    assert && assert( Array.isArray( lattice.sites ), `lattice.sites should be an Array: ${lattice.sites}` );

    super();

    const atomsNode = new Node();
    let xMin = 0;
    let yMin = 0;

    lattice.sites.forEach( function( site ) {
      const atom = new Circle( RADIUS, {
        x: SCALE_FACTOR * site.x, y: SCALE_FACTOR * site.y,
        fill: new RadialGradient( 2, -3, 2, 2, -3, 7 )
          .addColorStop( 0, '#f97d7d' )
          .addColorStop( 0.5, '#ed4545' )
          .addColorStop( 1, '#f00' )
      } );
      if ( site.x < xMin ) { xMin = site.x; }
      if ( site.y < yMin ) { yMin = site.y; }
      atomsNode.addChild( atom );
    } );
    this.addChild( atomsNode );

    // Label lattice constants
    const aDimensionArrow = new ArrowNode( SCALE_FACTOR * xMin, SCALE_FACTOR * lattice.latticeConstantsProperty.value.z,
      SCALE_FACTOR * ( xMin + lattice.latticeConstantsProperty.value.x ), SCALE_FACTOR * lattice.latticeConstantsProperty.value.z, DIMENSION_ARROW_OPTIONS );
    const bDimensionArrow = new ArrowNode( SCALE_FACTOR * xMin, 0, SCALE_FACTOR * xMin,
      SCALE_FACTOR * lattice.latticeConstantsProperty.value.z, DIMENSION_ARROW_OPTIONS );
    const dDimensionArrow = new ArrowNode( SCALE_FACTOR * xMin, SCALE_FACTOR * yMin, SCALE_FACTOR * xMin,
      SCALE_FACTOR * ( yMin + lattice.latticeConstantsProperty.value.z ), DIMENSION_ARROW_OPTIONS );
    this.addChild( aDimensionArrow );
    this.addChild( bDimensionArrow );
    this.addChild( dDimensionArrow );
    const aDimensionLabel = new RichText( aLatticeConstantString, { maxWidth: 100, centerX: aDimensionArrow.centerX, top: aDimensionArrow.centerY } );
    const bDimensionLabel = new RichText( bLatticeConstantString, { maxWidth: 100, centerY: bDimensionArrow.centerY, right: bDimensionArrow.centerX - 5 } );
    const dDimensionLabel = new RichText( interplaneDistanceString, { maxWidth: 100, centerY: dDimensionArrow.centerY, right: dDimensionArrow.centerX - 5 } );

    // fake labels to keep field centered
    const fakeLabel1 = new RichText( interplaneDistanceString,
      { fill: 'white', maxWidth: 100, centerY: dDimensionArrow.centerY, left: -dDimensionArrow.centerX + 5 } );
    const fakeLabel2 = new RichText( aLatticeConstantString,
      { fill: 'white', maxWidth: 100, centerX: aDimensionArrow.centerX, bottom: -aDimensionArrow.centerY } );
    this.addChild( aDimensionLabel );
    this.addChild( bDimensionLabel );
    this.addChild( dDimensionLabel );
    this.addChild( fakeLabel1 );
    this.addChild( fakeLabel2 );
  }
}

xrayDiffraction.register( 'CrystalNode', CrystalNode );
export default CrystalNode;