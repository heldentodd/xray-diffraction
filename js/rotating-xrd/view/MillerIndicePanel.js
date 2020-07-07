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
   * @param {Object} [options]
   */

  constructor( model, options ) {

    options = merge( {
      xMargin: 15,
      yMargin: 8,
      fill: '#F0F0F0',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 6
    }, options );



    //NEW radio group for selecting plane of interest
    const millerIndiceRadioContent = [ // value set to color iterator used by LightPathNode or 'none' for no wavefronts
      {
        value: 100,
        node: new Text( '[100]', TEXT_OPTIONS )
      },
      {
        value: () => 10,
        node: new Text( '[010]', TEXT_OPTIONS )
      },
      {
        value: () => 110,
        node: new Text( '[110]', TEXT_OPTIONS )
      },
      {
        value: () => 210,
        node: new Text( '[210]', TEXT_OPTIONS )
      },
      {
        value: () => 120,
        node: new Text( '[120]', TEXT_OPTIONS )
      },
      {
        value: () => 0,
        node: new Text( 'Arb', TEXT_OPTIONS )
      }
    ];

    const millerIndicesRadioGroup = new RadioButtonGroup( model.millerIndiceProperty, millerIndiceRadioContent, {
      orientation: 'vertical',
      cornerRadius: 5,
      baseColor: 'white',
      disabledBaseColor: 'white',
      selectedLineWidth: 1,
      selectedStroke: 'black',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1
    } );


    super( {
      children: [ millerIndicesRadioGroup ],
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