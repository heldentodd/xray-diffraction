// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows the main controls, including frequency/wavelength and amplitude.
 *
 * @author Todd Holden (Queensborough Community College of CUNY)
 */
  // modules
  import Checkbox from '../../../../sun/js/Checkbox.js';
  import HSeparator from '../../../../sun/js/HSeparator.js';
  import HSlider from '../../../../sun/js/HSlider.js';
  import Node from '../../../../scenery/js/nodes/Node.js';
  import Panel from '../../../../sun/js/Panel.js';
  import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
  import RichText from '../../../../scenery/js/nodes/RichText.js';
  import xrayDiffractionStrings from '../../xrayDiffractionStrings.js';
  import xrayDiffraction from '../../xrayDiffraction.js';

  // strings
  const incidentAngleString = xrayDiffractionStrings.incidentAngle;
  const wavelengthString = xrayDiffractionStrings.wavelength;
  const horizontalRaysString = xrayDiffractionStrings.horizontalRays;
  const verticalRaysString = xrayDiffractionStrings.verticalRays;
  const aLatticeConstantString = xrayDiffractionStrings.aLatticeConstant;
  const bLatticeConstantString = xrayDiffractionStrings.bLatticeConstant;
  const animateString = xrayDiffractionStrings.animate;
  const pathDifferenceString = xrayDiffractionStrings.pathDifference;
  const showWavefrontsString = xrayDiffractionStrings.showWavefronts;
  const showParametersString = xrayDiffractionStrings.showParameters;

  // constants
  const textOptions = {  maxWidth: 200 };
  
  class XrayControlPanel extends Panel {

    /**
     * @param {Object} model
     */
    constructor( model ) {

      const angleTitle = new RichText( incidentAngleString, textOptions );
      const wavelengthTitle = new RichText( wavelengthString, textOptions );
      const horizontalTitle = new RichText( horizontalRaysString, textOptions );
      const verticalTitle = new RichText( verticalRaysString, textOptions );
      const aLatticeTitle = new RichText( aLatticeConstantString, textOptions );
      const bLatticeTitle = new RichText( bLatticeConstantString, textOptions );
      const angleControl = new HSlider( model.sourceAngleProperty, new RangeWithValue( 0 , Math.PI / 2 , Math.PI / 3 ) );
      const wavelengthControl = new HSlider( model.sourceWavelengthProperty, new RangeWithValue( 1 , 20 , 5 ) );
      const horizontalControl = new HSlider( model.horizontalRaysProperty, new RangeWithValue( 0 , 3.9 , 0 ) );
      const verticalControl = new HSlider( model.verticalRaysProperty, new RangeWithValue( 1 , 7 , 2 ) );
      const aLatticeControl = new HSlider( model.lattice.aConstantProperty, new RangeWithValue( 2 , 20 , 3.8 ) );
      const bLatticeControl = new HSlider( model.lattice.cConstantProperty, new RangeWithValue( 2 , 20 , 7.8   ) );

      const animateCheckbox = new Checkbox( new RichText( animateString, textOptions ), model.animateProperty );
      const pathDifferenceCheckbox = new Checkbox( new RichText( pathDifferenceString, textOptions ), model.pathDifferenceProperty );
      const showWaveFrontsCheckbox = new Checkbox( new RichText( showWavefrontsString, textOptions ), model.showWaveFrontsProperty );
      const showParmsCheckbox = new Checkbox( new RichText( showParametersString, textOptions ), model.showParmsProperty );
      
      const maxComponentWidth = _.max( [
        animateCheckbox.width,
        pathDifferenceCheckbox.width,
        showWaveFrontsCheckbox.width,
        showParmsCheckbox.width,
        angleControl.width,
        wavelengthControl.width,
        horizontalControl.width,
        verticalControl.width
      ] );
      const separator = new HSeparator( maxComponentWidth );

      // Set pointer areas for the checkboxes, now that we have the separator dimensions.
      animateCheckbox.mouseArea = animateCheckbox.localBounds.dilated( 2 ).withX( separator.right );
      animateCheckbox.touchArea = animateCheckbox.mouseArea;
      pathDifferenceCheckbox.mouseArea = pathDifferenceCheckbox.localBounds.dilated( 2 ).withX( separator.right );
      pathDifferenceCheckbox.touchArea = pathDifferenceCheckbox.mouseArea;
      showWaveFrontsCheckbox.mouseArea = showWaveFrontsCheckbox.localBounds.dilated( 2 ).withX( separator.right );
      showWaveFrontsCheckbox.touchArea = showWaveFrontsCheckbox.mouseArea;
      showParmsCheckbox.mouseArea = showParmsCheckbox.localBounds.dilated( 2 ).withX( separator.right );
      showParmsCheckbox.touchArea = showParmsCheckbox.mouseArea;

      // Horizontal layout
      const centerX = angleControl.centerX;
      angleTitle.centerX = centerX;
      wavelengthControl.centerX = centerX;
      wavelengthTitle.centerX = centerX;
      horizontalTitle.centerX = centerX;
      horizontalControl.centerX = centerX;
      verticalTitle.centerX = centerX;
      verticalControl.centerX = centerX;
      aLatticeTitle.centerX = centerX;
      bLatticeTitle.centerX = centerX;
      aLatticeControl.centerX = centerX;
      bLatticeControl.centerX = centerX;
      separator.centerX = centerX;
      animateCheckbox.centerX = centerX;
      pathDifferenceCheckbox.centerX = centerX;
      showWaveFrontsCheckbox.centerX = centerX;
      showParmsCheckbox.centerX = centerX;
      
      const minX = _.min( [
        angleControl.left,
        angleTitle.left,
        wavelengthControl.left,
        wavelengthTitle.left,
        horizontalTitle.left,
        horizontalControl.left,
        verticalTitle.left,
        verticalControl.left,
        separator.left,
        animateCheckbox.left,
        pathDifferenceCheckbox.left,
        showWaveFrontsCheckbox.left,
        showParmsCheckbox.left
      ] );

      // Align controls to the left
      animateCheckbox.left = minX;
      pathDifferenceCheckbox.left = minX;
      showWaveFrontsCheckbox.left = minX;
      showParmsCheckbox.left = minX;
     
      // Vertical layout
      angleTitle.centerY = 10;
      angleControl.top = angleTitle.bottom + 3;
      wavelengthTitle.top = angleControl.bottom + 7;
      wavelengthControl.top = wavelengthTitle.bottom + 3;
      horizontalTitle.top = wavelengthControl.bottom + 7;
      horizontalControl.top = horizontalTitle.bottom + 3;
      verticalTitle.top = horizontalControl.bottom + 7;
      verticalControl.top = verticalTitle.bottom + 3;
      aLatticeTitle.top =  verticalControl.bottom + 7;
      aLatticeControl.top =  aLatticeTitle.bottom + 3;
      bLatticeTitle.top =  aLatticeControl.bottom + 7;
      bLatticeControl.top =  bLatticeTitle.bottom + 3;
      
      const HORIZONTAL_SEPARATOR_MARGIN = 7;
      separator.top =  bLatticeControl.bottom + 5;
      animateCheckbox.top = separator.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      pathDifferenceCheckbox.top = animateCheckbox.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      showWaveFrontsCheckbox.top = pathDifferenceCheckbox.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      showParmsCheckbox.top = showWaveFrontsCheckbox.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      
      const container = new Node();
      container.addChild(angleTitle);
      container.addChild(angleControl);
      container.addChild(wavelengthTitle);
      container.addChild(wavelengthControl);
      container.addChild(horizontalTitle);
      container.addChild(horizontalControl);
      container.addChild(verticalTitle);
      container.addChild(verticalControl);
      container.addChild(aLatticeTitle);
      container.addChild(aLatticeControl);
      container.addChild(bLatticeTitle);
      container.addChild(bLatticeControl);
      container.addChild(separator);
      container.addChild(animateCheckbox);
      container.addChild(pathDifferenceCheckbox);
      container.addChild(showWaveFrontsCheckbox);
      container.addChild(showParmsCheckbox);

      //const content = alignGroup.createBox( container );

      super( container/*content, options */ );
    }
  }

xrayDiffraction.register( 'XrayControlPanel', XrayControlPanel );
export default XrayControlPanel;