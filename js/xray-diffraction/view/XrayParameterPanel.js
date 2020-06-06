// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows the major parameters, including frequency, wavelength, amplitude, path length difference, etc.
 *
 * @author Todd Holden (Queensborough Community College of CUNY)
 */
  // modules
  import merge from '../../../../phet-core/js/merge.js';
  import Node from '../../../../scenery/js/nodes/Node.js';
  import Panel from '../../../../sun/js/Panel.js';
  import Property from '../../../../axon/js/Property.js';
  import RichText from '../../../../scenery/js/nodes/RichText.js';
  import Utils from '../../../../dot/js/Utils.js';
  import xrayDiffractionStrings from '../../xrayDiffractionStrings.js';
  import xrayDiffraction from '../../xrayDiffraction.js';

  // strings
  const wavelengthUnitString = xrayDiffractionStrings.wavelengthUnit;
  const angleUnitString = xrayDiffractionStrings.angleUnit;
  const incidentAngleString = xrayDiffractionStrings.incidentAngle;
  const wavelengthString = xrayDiffractionStrings.wavelength;
  const aLatticeConstantString = xrayDiffractionStrings.aLatticeConstant;
  const bLatticeConstantString = xrayDiffractionStrings.bLatticeConstant;
  const interplaneDistanceString = xrayDiffractionStrings.interplaneDistance;
  
  //constants
  const textOptions = {  maxWidth: 200 };
  const INSET = 10;
  const LABEL_SPACING = 5;
  
      
  class XrayParameterPanel extends Panel {

    /**
     * @param {XrayDiffractionModel} model
     * @param {Object} [options]
     */
    constructor( model, options ) {
      options = merge ( {
        xMargin: 15,
        yMargin: 8,
        fill: '#F0F0F0',
        stroke: 'gray',
        lineWidth: 1
      }, options );

      // Text nodes that reflects the incident angle, lattice parameters, wavelength, 2dsin(Theta), and 2dsin(Theta)/wavelength
      const angleText = new RichText( '?', textOptions );
      const latticeConstantsText = new RichText( '?', textOptions );
      const wavelengthText = new RichText( '?', textOptions );
      const _2dSinText = new RichText( '?', textOptions );
      const _2dSinLambdaText = new RichText( '?', textOptions );
     
      // Links the current incident angle, lattice parameters, wavelength, 2dsin(Theta), and 2dsin(Theta)/wavelength 
      // to the text variables declared above
      Property.multilink( [
        model.sourceAngleProperty,
        model.lattice.latticeConstantsProperty,
        model.sourceWavelengthProperty
        ], () => {
          angleText.text = incidentAngleString + ' = ' + Utils.toFixed( model.sourceAngleProperty.value * 180 / Math.PI, 1 ) + angleUnitString;
          latticeConstantsText.text = aLatticeConstantString + ' = ' + Utils.toFixed( model.lattice.latticeConstantsProperty.value.x, 1 )
                                      + wavelengthUnitString + '   ' + bLatticeConstantString + ' = ' + interplaneDistanceString + ' = '
                                      + Utils.toFixed( model.lattice.latticeConstantsProperty.value.z, 1 ) + wavelengthUnitString;
          wavelengthText.text = wavelengthString + ' = ' + Utils.toFixed( model.sourceWavelengthProperty.value, 1 ) + wavelengthUnitString;
          _2dSinText.text = '2' + interplaneDistanceString + ' sin(θ) = ' +
              Utils.toFixed( 2 * model.lattice.latticeConstantsProperty.value.z * Math.sin(model.sourceAngleProperty.value), 1 ) + wavelengthUnitString;
          _2dSinLambdaText.text = '2' + interplaneDistanceString + ' sin(θ)/λ = ' + Utils.toFixed(
            2 * model.lattice.latticeConstantsProperty.value.z * Math.sin(model.sourceAngleProperty.value) / model.sourceWavelengthProperty.value, 2 );
        } );
      
      const content = new Node();
      content.addChild( angleText );
      content.addChild( latticeConstantsText );
      content.addChild( wavelengthText );
      content.addChild( _2dSinText );
      content.addChild( _2dSinLambdaText );

      // Define positioning in the panel
      angleText.left = INSET;
      angleText.top = INSET;
      latticeConstantsText.left = INSET;
      latticeConstantsText.top = angleText.bottom + LABEL_SPACING;
      wavelengthText.left = INSET;
      wavelengthText.top = latticeConstantsText.bottom + LABEL_SPACING;
      _2dSinText.left = INSET;
      _2dSinText.top = wavelengthText.bottom + LABEL_SPACING;
      _2dSinLambdaText.left = INSET;
      _2dSinLambdaText.top = _2dSinText.bottom + LABEL_SPACING;

      super( content, options );
    }
  }

xrayDiffraction.register( 'XrayParameterPanel', XrayParameterPanel );
export default XrayParameterPanel;