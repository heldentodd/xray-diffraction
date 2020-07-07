// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows the main controls, including frequency/wavelength and amplitude.
 *
 * @author Todd Holden (https://tholden79.wixsite.com/mysite2)
 */

// modules
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import merge from '../../../../phet-core/js/merge.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import Panel from '../../../../sun/js/Panel.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import Range from '../../../../dot/js/Range.js';
import Shape from '../../../../kite/js/Shape.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Utils from '../../../../dot/js/Utils.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import XrayDiffractionConstants from '../../common/XrayDiffractionConstants.js';
import xrayDiffraction from '../../xrayDiffraction.js';
import xrayDiffractionStrings from '../../xrayDiffractionStrings.js';

// strings
const angleUnitString = xrayDiffractionStrings.angleUnit;
const aLatticeEqualsString = xrayDiffractionStrings.aLatticeEquals;
const bdLatticeEqualsString = xrayDiffractionStrings.bdLatticeEquals;
const horizontalRaysString = xrayDiffractionStrings.horizontalRays;
const incidentAngleString = xrayDiffractionStrings.incidentAngle;
const lengthUnitString = xrayDiffractionStrings.lengthUnit;
const moreParametersString = xrayDiffractionStrings.moreParameters;
const pathDifferenceString = xrayDiffractionStrings.pathDifference;
const showTransmittedString = xrayDiffractionStrings.showTransmitted;
const verticalRaysString = xrayDiffractionStrings.verticalRays;
const wavefrontsMarkersString = xrayDiffractionStrings.waveFrontMarkers;
const wavelengthString = xrayDiffractionStrings.wavelength;

const TEXT_OPTIONS = { font: new PhetFont( { family: 'Verdana', size: 14 } ), maxWidth: 200, align: 'center', setBoundsMethod: 'accurate' };
const SLIDER_OPTIONS = { trackSize: new Dimension2( 90, 1 ), thumbSize: new Dimension2( 13, 22 ) };
const ELEMENT_SPACING = XrayDiffractionConstants.ELEMENT_SPACING;
const SLIDER_SPACING = XrayDiffractionConstants.ELEMENT_SPACING * 2.6;

class XrayControlPanel extends VBox {

  /**
   * @param {XrayDiffractionModel} model
   * @param {Node} timeControlNode
   * @param {Object} [options]
   */

  constructor( model, timeControlNode, options ) {

    options = merge( {
      xMargin: 15,
      yMargin: 8,
      fill: '#F0F0F0',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 6
    }, options );

    // We are manually controlling the title and the number rather than the built in NumberControl functionality so that
    // we can convert from radians to degrees and accomodate right-to-left languages.
    const angleTitle = new Text( '?', TEXT_OPTIONS );
    // Links the current angle and converts it to degrees
    const angleControl = new NumberControl( angleTitle.text, model.sourceAngleProperty, new Range( 0, Math.PI / 2 ),
      {
        delta: Math.PI / 900, // 0.2 degree resolution
        sliderOptions: SLIDER_OPTIONS,
        layoutFunction: createControlLayoutFunction( angleTitle )
      } );
    model.sourceAngleProperty.link( angle => {
      angleTitle.text = StringUtils.fillIn( incidentAngleString, {
        value: Utils.toFixed( angle * 180 / Math.PI, 1 ),
        unit: angleUnitString
      } );
    } );

    // Control for the wavelength
    const wavelengthTitle = new Text( '?', TEXT_OPTIONS );
    const wavelengthControl = new NumberControl( '?', model.sourceWavelengthProperty, new Range( 1, 20 ),
      {
        delta: 0.1, // 0.1 Angstrom resolution
        sliderOptions: SLIDER_OPTIONS,
        layoutFunction: createControlLayoutFunction( wavelengthTitle )
      } );
    model.sourceWavelengthProperty.link( wavelength => {
      wavelengthTitle.text = StringUtils.fillIn( wavelengthString, {
        value: wavelength,
        unit: lengthUnitString
      } );
    } );

    // Control for the b lattice constant (= interplane distance for this orientation)
    const bLatticeTitle = new Text( '?', TEXT_OPTIONS );
    const bLatticeControl = new NumberControl( '?', model.lattice.cConstantProperty, new Range( 2, 20 ),
      {
        delta: 0.1, // 0.1 Angstrom resolution
        sliderOptions: SLIDER_OPTIONS,
        layoutFunction: createControlLayoutFunction( bLatticeTitle )
      } );
    model.lattice.cConstantProperty.link( constant => {
      bLatticeTitle.text = StringUtils.fillIn( bdLatticeEqualsString, {
        value: constant,
        unit: xrayDiffractionStrings.lengthUnit
      } );
    } );

    // Control for the a lattice constant
    const aLatticeTitle = new Text( '?', TEXT_OPTIONS );
    model.lattice.aConstantProperty.link( constant => {
      aLatticeTitle.text = StringUtils.fillIn( aLatticeEqualsString, {
        value: constant,
        unit: xrayDiffractionStrings.lengthUnit
      } );
    } );
    const aLatticeControl = new NumberControl( aLatticeTitle.text, model.lattice.aConstantProperty, new Range( 2, 20 ),
      {
        delta: 0.1, // 0.1 Angstrom resolution
        sliderOptions: SLIDER_OPTIONS,
        layoutFunction: createControlLayoutFunction( aLatticeTitle )
      } );
    model.lattice.aConstantProperty.link( constant => {
      aLatticeTitle.text = StringUtils.fillIn( aLatticeEqualsString, {
        value: constant,
        unit: xrayDiffractionStrings.lengthUnit
      } );
    } );

    // Control for number of vertical rays
    const verticalControl = new NumberControl( '?', model.verticalRaysProperty, new Range( 1, 5 ),
      {
        delta: 1, // interger number of rays
        sliderOptions: SLIDER_OPTIONS,
        layoutFunction: createControlLayoutFunction( new Text( verticalRaysString, TEXT_OPTIONS ) )
      } );

    // NEW replace Control for number of horizontal rays with crystal orientation
    const horizontalControl = new NumberControl( '?', model.lattice.orientationProperty, new Range( 0, Math.PI / 2 ),
      {
        delta: Math.PI / 900, // 0.2 degree resolution
        sliderOptions: SLIDER_OPTIONS,
        layoutFunction: createControlLayoutFunction( new Text( horizontalRaysString, TEXT_OPTIONS ) )
      } );

    // model.sourceAngleProperty.link( angle => {
    //   angleTitle.text = StringUtils.fillIn( incidentAngleString, {
    //     value: Utils.toFixed( angle * 180 / Math.PI, 1 ),
    //     unit: angleUnitString
    //   } );
    // } );

    const wavefrontRadioContent = [ // value set to color iterator used by LightPathNode or 'none' for no wavefronts
      {
        value: 'none',
        node: createLines( () => 'transparent' )
      },
      {
        value: () => 'black',
        node: createLines( () => 'black' )
      },
      {
        value: i => 'hsl(0, 0%, ' + ( 40 * ( ( ( i % 3 ) + 3 ) % 3 ) ) + '%)',
        node: createLines( i => 'hsl(0, 0%, ' + ( 40 * ( ( ( i % 3 ) + 3 ) % 3 ) ) + '%)' ) // three levels, 0,40,80
      },
      {
        value: i => 'hsl(' + ( ( 60 * i % 360 ) + 360 ) % 360 + ', 100%, 50%)',
        node: createLines( i => 'hsl(' + ( ( 60 * i % 360 ) + 360 ) % 360 + ', 100%, 50%)' ) // 60*i gives 6 different colors ),
      }
    ];

    const wavefrontRadioGroup = new RadioButtonGroup( model.wavefrontProperty, wavefrontRadioContent, {
      orientation: 'horizontal',
      cornerRadius: 5,
      baseColor: 'white',
      disabledBaseColor: 'white',
      selectedLineWidth: 1,
      selectedStroke: 'black',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1
    } );

    const pathDifferenceCheckbox = new Checkbox( new Text( pathDifferenceString, TEXT_OPTIONS ),
      model.pathDifferenceProperty, { boxWidth: 15 } );
    const showTransmittedCheckbox = new Checkbox( new Text( showTransmittedString, TEXT_OPTIONS ),
      model.showTransmittedProperty, { boxWidth: 15 } );

    const waveFrontMarkersTitle = new Text( wavefrontsMarkersString, TEXT_OPTIONS );
    const waveFrontGroup = new VBox( {
      align: 'left',
      children: [ waveFrontMarkersTitle, wavefrontRadioGroup ],
      spacing: ELEMENT_SPACING
    } );

    const separator = new HSeparator( _.max( [
      angleControl.width,
      wavelengthControl.width,
      horizontalControl.width,
      verticalControl.width,
      aLatticeControl.width,
      bLatticeControl.width,
      pathDifferenceCheckbox.width,
      waveFrontMarkersTitle.width
    ] ) );
    const separator2 = new HSeparator( separator.width );

    // Set pointer areas for the checkboxes, now that we have the separator dimensions.
    pathDifferenceCheckbox.mouseArea = pathDifferenceCheckbox.localBounds.dilated( 2 ).withX( separator.right );
    pathDifferenceCheckbox.touchArea = pathDifferenceCheckbox.mouseArea;
    showTransmittedCheckbox.mouseArea = showTransmittedCheckbox.localBounds.dilated( 2 ).withX( separator.right );
    showTransmittedCheckbox.touchArea = showTransmittedCheckbox.mouseArea;

    // main control panel. Items can easily be rearranged here. Use Panel if you have to set a width inside a VBox.
    const checkboxes = new VBox( {
      align: 'left',
      children: [ separator, pathDifferenceCheckbox, showTransmittedCheckbox, separator2, waveFrontGroup ],
      spacing: ELEMENT_SPACING
    } );
    const content = new VBox( {
      align: 'center',
      children: [ angleControl, wavelengthControl, bLatticeControl, checkboxes ],
      spacing: SLIDER_SPACING
    } );
    const mainContent = new Panel( content, options );

    // optional controls hidden in an accordian box
    const optionalParameters = new VBox( {
      align: 'center',
      children: [ aLatticeControl, verticalControl, horizontalControl ],
      spacing: SLIDER_SPACING
    } );

    const accordianOptional = new AccordionBox( optionalParameters, merge( {
      titleNode: new Text( moreParametersString, TEXT_OPTIONS ),
      minWidth: mainContent.width,
      expandedProperty: model.moreParmsExpandedProperty,
      showTitleWhenExpanded: true
    }, options ) );

    super( {
      children: [ mainContent, timeControlNode, accordianOptional ],
      spacing: 2 * ELEMENT_SPACING,
      align: 'left'
    } );
  }
}

/**
 * Creates a layout functions that can be used for options.layoutFunction. Sends in a titleTextNode so we can change it later.
 * Arranges subcomponents like this:
 *
 *        title
 *  < ------|------ >
 *
 * @param {Node} titleTextNode
 * @param {Object} [options]
 * @returns {function}
 * @public
 * @static
 */
function createControlLayoutFunction( titleTextNode, options ) {
  return ( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton ) => {
    return new VBox( {
      spacing: 2,
      children: [ titleTextNode,
        new HBox( {
          spacing: 2,
          resize: false, // prevent slider from causing a resize when thumb is at min or max
          children: [ leftArrowButton, slider, rightArrowButton ]
        } )
      ]
    } );
  };
}

/**
 * Creates lines symbols for wavefront markers radioButton.
 *
 * @param {function} interationFunction
 * @returns {Node}
 * @public
 * @static
 */
function createLines( interationFunction ) {
  const height = 20; // arbitrary size of icon. set by hand
  const spacing = height / 4; // square icon for 4 wavefronts. set by hand
  const linesNode = new Node();
  for ( let i = 0; i < 4; i++ ) {
    linesNode.addChild( new Path( Shape.lineSegment( i * spacing, 0, i * spacing, height ), {
      stroke: interationFunction( i ), // defines the color/shading patterns
      lineWidth: 3  // arbitrary linewidth for the icon
    } ) );
  }
  return linesNode;
}

xrayDiffraction.register( 'XrayControlPanel', XrayControlPanel );
export default XrayControlPanel;