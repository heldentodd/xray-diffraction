// Copyright 2020, University of Colorado Boulder

/**
 * @author Todd Holden (https://tholden79.wixsite.com/mysite2)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import ProtractorNode from '../../../../scenery-phet/js/ProtractorNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import XrayDiffractionConstants from '../../common/XrayDiffractionConstants.js';
import xrayDiffraction from '../../xrayDiffraction.js';
import xrayDiffractionStrings from '../../xrayDiffractionStrings.js';
import XrayDiffractionModel from '../model/XrayDiffractionModel.js';
import CrystalNode from './CrystalNode.js';
import LightPathNode from './LightPathNode.js';
import MillerIndicePanel from './MillerIndicePanel.js';
import XrayControlPanel from './XrayControlPanel.js';

// strings
const dSinThetaString = xrayDiffractionStrings.dSinTheta;
const inPhaseString = xrayDiffractionStrings.inPhase;

const DIMENSION_ARROW_OPTIONS = { fill: 'black', stroke: null, tailWidth: 2, headWidth: 7, headHeight: 20, doubleHead: true };
const AMP = 10;
const braggEquationString = xrayDiffractionStrings.braggEquation;
const interplaneDistanceString = xrayDiffractionStrings.interplaneDistance;
const lengthUnitString = xrayDiffractionStrings.lengthUnit;
const pLDString = xrayDiffractionStrings.pLD;
const SCALE_FACTOR = XrayDiffractionConstants.SCALE_FACTOR;
const TEXT_OPTIONS = { font: new PhetFont( { family: 'Verdana', size: 14 } ), maxWidth: 200, align: 'center', setBoundsMethod: 'accurate' };
const TOP_RAY_LENGTH = 400; // Arbitrary length of top incident ray to start it near the top left

// Arbitrary location of the crystal near the bottom center
const CRYSTAL_NODE_OPTIONS = { centerX: 400, centerY: 440 };
const ELEMENT_SPACING = XrayDiffractionConstants.ELEMENT_SPACING;

class XrayDiffractionScreenView extends ScreenView {

  /**
   * @param {XrayDiffractionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    assert && assert( model instanceof XrayDiffractionModel, 'invalid model' );
    assert && assert( tandem instanceof Tandem, 'invalid tandem' );

    super( {
      tandem: tandem
    } );

    // @private - used to display the array of atoms. Using container to keep the correct order when we removeChild
    this.crystalNode = new CrystalNode( model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS );
    this.crystalNodeContainer = new Node();
    this.crystalNodeContainer.addChild( this.crystalNode );
    this.addChild( this.crystalNodeContainer );

    // @private - used to draw the current frame of the light waves. Updated at each timestep when animating.
    this.lightPathsNode = new Node();
    this.addChild( this.lightPathsNode );

    // @private node for displaying PLD region
    this.pLDNode = new Node();
    this.pLDChanged = true;
    this.addChild( this.pLDNode );

    // Initial drawing of light onto the screen.
    this.drawLight( model, this.crystalNode );

    // @protected Time Controls - subclass is responsible for play/pause of light animation
    this.timeControlNode = new TimeControlNode( model.animateProperty, {
      buttonGroupXSpacing: 25,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          // when the Step button is pressed
          listener: () => {
            // .04 s - about 2 timesteps seems about right
            model.manualStep( .04 );
            this.drawLight( model, this.crystalNode );
          }
        }
      },
      tandem: tandem.createTandem( 'timeControlNode' )
    } );
    // layout positioning done after control panel is created

    // create the protractor node
    const showProtractorProperty = new BooleanProperty( false );
    const protractorNode = new ProtractorNode( showProtractorProperty, {
      rotatable: true,
      scale: 0.8
    } );
    protractorNode.protractorAngleProperty.value = Math.PI / 2;
    const protractorPositionProperty = new Vector2Property( protractorNode.center );
    // This link exists for the entire duration of the sim. No need to dispose.
    showProtractorProperty.linkAttribute( protractorNode, 'visible' );

    const protractorNodeIcon = ProtractorNode.createIcon( { scale: 0.24 } );
    // This link exists for the entire duration of the sim. No need to dispose.
    showProtractorProperty.link( showProtractor => { protractorNodeIcon.visible = !showProtractor; } );

    // listener created once and needed for life of simulation. No need to dispose.
    const protractorNodeListener = new DragListener( {
      positionProperty: protractorPositionProperty,
      useParentOffset: true,
      end: () => {
        if ( protractorNode.getGlobalBounds().intersectsBounds( this.toolbox.getGlobalBounds() ) ) {
          showProtractorProperty.value = false;
        }
      }
    } );
    // listener created once and needed for life of simulation. No need to dispose.
    protractorNode.addInputListener( protractorNodeListener );

    // This link exists for the entire duration of the sim. No need to dispose.
    protractorPositionProperty.link( protractorPosition => {
      protractorNode.center = protractorPosition;
    } );

    // Initialize the protractor icon and set up the first drag off the toolbox
    initializeIcon( protractorNodeIcon, showProtractorProperty, event => {
      // Center the protractor on the pointer
      protractorPositionProperty.value = protractorNode.globalToParentPoint( event.pointer.point );
      // listener created once and needed for life of simulation. No need to dispose.
      protractorNodeListener.press( event );
      showProtractorProperty.value = true;
    } );

    // add tape measure
    const measuringTapeProperty = new Property( { name: 'Å', multiplier: 1 / SCALE_FACTOR } );
    const measuringTapeNode = new MeasuringTapeNode( measuringTapeProperty, new BooleanProperty( true ), {
      // translucent white background, same value as in Projectile Motion, see https://github.com/phetsims/projectile-motion/issues/156
      textBackgroundColor: 'rgba(255,255,255,0.6)',
      textColor: 'black',
      tipPositionProperty: new Vector2Property( new Vector2( 5 * SCALE_FACTOR, 0 ) ), // 5 Angstrom initial length

      // Drop in toolbox
      baseDragEnded: () => {
        if ( measuringTapeNode.getGlobalBounds().intersectsBounds( this.toolbox.getGlobalBounds() ) ) {
          isMeasuringTapeInPlayAreaProperty.value = false;
          measuringTapeNode.visible = false;
          measuringTapeNode.reset();
        }
      }
    } );

    measuringTapeNode.setTextVisible( false );
    const measuringTapeIcon = measuringTapeNode.rasterized( { wrap: true } ).mutate( { scale: 0.65 } );
    const isMeasuringTapeInPlayAreaProperty = new BooleanProperty( false );
    measuringTapeNode.setTextVisible( true );
    measuringTapeNode.visible = false;

    initializeIcon( measuringTapeIcon, isMeasuringTapeInPlayAreaProperty, event => {
      // When clicking on the measuring tape icon, base point at cursor
      const delta = measuringTapeNode.tipPositionProperty.value.minus( measuringTapeNode.basePositionProperty.value );
      measuringTapeNode.basePositionProperty.value = measuringTapeNode.globalToParentPoint( event.pointer.point );
      measuringTapeNode.tipPositionProperty.value = measuringTapeNode.basePositionProperty.value.plus( delta );
      measuringTapeNode.startBaseDrag( event );
      isMeasuringTapeInPlayAreaProperty.value = true;
      measuringTapeNode.visible = true;
    } );

    const toolboxNodes = [ protractorNodeIcon, measuringTapeIcon ];

    // @private - used to display a toolbox containing a protractor and ruler for the user
    this.toolbox = new Panel( new VBox( {
      spacing: 10,
      children: toolboxNodes,
      excludeInvisibleChildrenFromBounds: false
    } ), {
      xMargin: 10,
      yMargin: 10,
      stroke: '#696969',
      lineWidth: 1.5, fill: '#eeeeee',
      left: this.layoutBounds.minX + XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN
    } );
    this.addChild( this.toolbox );
    this.addChild( protractorNode );
    this.addChild( measuringTapeNode );

    // max width set to 260 which is less than the exit ray length
    const inPhaseText = new RichText( '', { maxWidth: 260 } );
    this.addChild( inPhaseText );

    // Note when we need to redraw PLD region
    // listener created once and needed for life of simulation. No need to dispose.
    model.pLDWavelengthsProperty.changedEmitter.addListener( () => {this.pLDChanged = true;} );

    // show/hide the PLD node when the checkbox linked to pathDifferenceProperty is checked.
    // listener created once and needed for life of simulation. No need to dispose.
    model.pathDifferenceProperty.link( hideTF => {
      this.pLDNode.visible = hideTF;
    } );

    // displays message when path length difference (PLD) is integral multiple of the wavelength
    // listener created once and needed for life of simulation. No need to dispose.
    model.inPhaseProperty.changedEmitter.addListener( () => {
      if ( model.inPhaseProperty.value ) {

        // reorient text and make it visible
        const theta = model.sourceAngleProperty.get();
        const rayTextEnd = new Vector2( this.crystalNode.centerX, this.crystalNode.centerY ).minus( model.lattice.sites[ 0 ].timesScalar( SCALE_FACTOR ) );

        // find the center of the top outgoing ray and displace the text a little above it
        let rayTextCenter = new Vector2( TOP_RAY_LENGTH / 2, 0 );
        rayTextCenter = rayTextEnd.minus( rayTextCenter.rotated( Math.PI - theta ) );
        if ( model.wavefrontProperty.value === 'none' ) {
          // placement a little above the top of the wave 2.2 is arbitrary to put the text center high enough
          rayTextCenter = rayTextCenter.addXY( -2.2 * AMP * Math.sin( theta ), -2.2 * AMP * Math.cos( theta ) );
        }
        else {
          // calculate the distance between light rays
          const raySep = 4 * ( model.lattice.latticeConstantsProperty.value.z * Math.cos( theta ) );
          // placement right above the wavefronts
          rayTextCenter = rayTextCenter.addXY( -( raySep + AMP ) * Math.sin( theta ), -( raySep + AMP ) * Math.cos( theta ) );
        }
        inPhaseText.rotation = -model.sourceAngleProperty.value;
        inPhaseText.text = StringUtils.fillIn( inPhaseString, {
          wavelengths: Utils.toFixed( model.pLDWavelengthsProperty.value, 0 )
        } );
        inPhaseText.center = rayTextCenter;
      }
      else {
        inPhaseText.text = '';
      }
    } );

    // update display when incident angle, wavelength, ray grid, or path difference checkbox changes
    // This link exists for the entire duration of the sim. No need to dispose.
    Property.multilink( [
      model.sourceAngleProperty,
      model.sourceWavelengthProperty,
      model.horizontalRaysProperty,
      model.verticalRaysProperty,
      model.wavefrontProperty,
      model.pathDifferenceProperty,
      model.showTransmittedProperty
    ], () => { this.drawLight( model, this.crystalNode ); } );

    // update crystal when lattice parameters change
    // This link exists for the entire duration of the sim. No need to dispose.
    // NEW added orientationProperty for redraw
    Property.multilink( [
      model.lattice.aConstantProperty,
      model.lattice.cConstantProperty,
      model.lattice.orientationProperty
    ], () => {
      model.lattice.latticeConstantsProperty.value.x = model.lattice.aConstantProperty.value;
      model.lattice.latticeConstantsProperty.value.z = model.lattice.cConstantProperty.value;
      model.lattice.updateSites( );
      this.crystalNodeContainer.removeChild( this.crystalNode );
      this.crystalNode = new CrystalNode( model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS );
      this.crystalNodeContainer.addChild( this.crystalNode );
      this.drawLight( model, this.crystalNode );
    } );

    // @private - used to create an input panel for users to adjust parameters of the simulation
    this.controlPanel = new XrayControlPanel( model, this.timeControlNode );


    // NEW @private - used to select Miller Indice
    this.millerIndicePanel = new MillerIndicePanel( model );
    this.millerIndicePanel.bottom = this.layoutBounds.maxY - XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN;
    this.millerIndicePanel.left = this.toolbox.right + XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN;
    this.addChild( this.millerIndicePanel );

    // Layout for controls done manually at the top right
    this.controlPanel.top = XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN;
    this.controlPanel.right = this.layoutBounds.maxX - XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN;
    this.addChild( this.controlPanel );

    // update view on model step
    model.addStepListener( () => {
      if ( model.animateProperty ) {
        this.drawLight( model, this.crystalNode );
      }
    } );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
        measuringTapeNode.reset();
        this.crystalNodeContainer.removeChild( this.crystalNode );
        this.crystalNode = new CrystalNode( model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS );
        this.crystalNodeContainer.addChild( this.crystalNode );
        this.drawLight( model, this.crystalNode );
        showProtractorProperty.reset();
        protractorNode.protractorAngleProperty.value = Math.PI / 2;
        isMeasuringTapeInPlayAreaProperty.value = false;
        measuringTapeNode.visible = false;
        measuringTapeNode.reset();
      },
      right: this.layoutBounds.maxX - XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Resets the view.
   * @public
   */
  reset() {
    //  done in the reset all button
  }

  /**
   * Draws the light rays (incoming and outgoing) along with the path length difference (PLD) region if checked.
   * Repeated calls to Math.sin() could be eliminated by defining a variable.
   * @param {XrayDiffractionModel} model
   * @param {CrystalNode} crystalNode
   * @public
   */
  drawLight( model, crystalNode ) {
    this.lightPathsNode.removeAllChildren();
    const theta = model.sourceAngleProperty.get();
    const lamda = SCALE_FACTOR * model.sourceWavelengthProperty.get();
    const raySeparation = SCALE_FACTOR * ( model.lattice.latticeConstantsProperty.value.z * Math.cos( theta ) );

    const incidentRay1End = new Vector2( crystalNode.centerX, crystalNode.centerY ).minus( model.lattice.sites[ 0 ].timesScalar( SCALE_FACTOR ) );

    // Arbitrary length (400 pixels) of top incident ray to start it near the top left
    let incidentRay1Start = new Vector2( TOP_RAY_LENGTH, 0 );
    incidentRay1Start = incidentRay1End.minus( incidentRay1Start.rotated( model.sourceAngleProperty.get() ) );

    // Main logic to draw the light rays
    const horiz = Math.floor( Math.min( model.horizontalRaysProperty.get(), 20 / model.lattice.latticeConstantsProperty.get().x ) );
    const vert = Math.min( Math.floor( model.verticalRaysProperty.get() ),
      1 + 2 * Math.floor( 20 / model.lattice.latticeConstantsProperty.get().z ) );
    for ( let i = -horiz; i <= horiz; i++ ) {
      for ( let j = 0; j < vert; j++ ) {
        const shift = new Vector2( SCALE_FACTOR * i * model.lattice.latticeConstantsProperty.get().x,
          -SCALE_FACTOR * j * model.lattice.latticeConstantsProperty.get().z );
        const distance = SCALE_FACTOR * ( i * model.lattice.latticeConstantsProperty.get().x * Math.sin( theta )
                                          + j * model.lattice.latticeConstantsProperty.get().z * Math.cos( theta ) );
        const incidentRayStart = new Vector2( incidentRay1Start.x - distance * Math.sin( theta ),
          incidentRay1Start.y + distance * Math.cos( theta ) );
        const incidentRayEnd = incidentRay1End.minus( shift );
        const incidentRayLength = incidentRayEnd.minus( incidentRayStart ).getMagnitude();
        const exitRayPhase = ( incidentRayLength / lamda ) * 2 * Math.PI + model.startPhase;
        const extraLength = 2 * SCALE_FACTOR * Math.cos( theta ) * i * model.lattice.latticeConstantsProperty.get().x; // accomodates extra length for added horizontal rays
        const exitRayEnd = new Vector2( 2 * incidentRayEnd.x - incidentRayStart.x + extraLength * Math.cos( theta ),
          incidentRayStart.y - extraLength * Math.sin( theta ) );
        this.lightPathsNode.addChild( new LightPathNode( incidentRayStart, incidentRayEnd, SCALE_FACTOR * model.sourceWavelengthProperty.get(), {
          amplitude: AMP,
          startPhase: model.startPhase,
          waveFrontWidth: ( model.wavefrontProperty.value === 'none' ) ? 0 : Math.max( AMP, raySeparation - 2 ),
          waveFrontPattern: model.wavefrontProperty.value
        } ) );
        this.lightPathsNode.addChild( new LightPathNode( incidentRayEnd, exitRayEnd, SCALE_FACTOR * model.sourceWavelengthProperty.get(), {
          amplitude: AMP,
          startPhase: exitRayPhase,
          waveFrontWidth: ( model.wavefrontProperty.value === 'none' ) ? 0 : Math.max( AMP, raySeparation - 2 ),
          waveFrontPattern: model.wavefrontProperty.value,
          stroke: ( model.inPhaseProperty.value ) ? 'black' : 'gray',
          lineWidth: ( model.inPhaseProperty.value ) ? 2 : 1,
          waveFrontLineWidth: ( model.inPhaseProperty.value ) ? 3 : 1
        } ) );

        if ( model.showTransmittedProperty.value ) {
          // when incident ray is longer, transmitted ray is shorter
          let transmittedRayEnd = new Vector2( 2 * TOP_RAY_LENGTH - incidentRayLength, 0 );
          transmittedRayEnd = incidentRayEnd.minus( transmittedRayEnd.rotated( model.sourceAngleProperty.get() + Math.PI ) );
          this.lightPathsNode.addChild( new LightPathNode( incidentRayEnd, transmittedRayEnd, SCALE_FACTOR * model.sourceWavelengthProperty.get(), {
            amplitude: AMP,
            startPhase: exitRayPhase,
            waveFrontWidth: ( model.wavefrontProperty.value === 'none' ) ? 0 : Math.max( AMP, raySeparation - 2 ),
            waveFrontPattern: model.wavefrontProperty.value,
            stroke: ( model.inPhaseProperty.value ) ? 'hsl(0,0%,25%)' : 'black',
            lineWidth: ( model.inPhaseProperty.value ) ? 1.5 : 2,
            waveFrontLineWidth: ( model.inPhaseProperty.value ) ? 2 : 3
          } ) );
        }
      }
    }

    // if checked, draw the Path Length Difference region (only if it has changed)
    if ( model.pathDifferenceProperty.value && this.pLDChanged ) {
      this.pLDChanged = false;
      this.pLDNode.removeAllChildren();
      const dSinTheta = SCALE_FACTOR * ( model.lattice.latticeConstantsProperty.value.z * Math.sin( theta ) );
      const lineStart = incidentRay1End;
      const lineInEnd = new Vector2( lineStart.x - ( AMP + raySeparation ) * Math.sin( theta ), lineStart.y + ( AMP + raySeparation ) * Math.cos( theta ) );
      const lineOutEnd = new Vector2( lineStart.x + ( AMP + raySeparation ) * Math.sin( theta ), lineStart.y + ( AMP + raySeparation ) * Math.cos( theta ) );

      const pLD = new Shape(); // Shape to show the edges of the path length difference
      pLD.moveToPoint( lineInEnd );
      pLD.lineToPoint( lineStart );
      pLD.lineToPoint( lineOutEnd );
      const pLDPath = new Path( pLD, {
        stroke: 'blue',
        lineWidth: 1
      } );
      this.pLDNode.addChild( pLDPath );

      // Shade in the region of path length difference
      const pLDRegion1 = new Shape();
      const pLDRegion2 = new Shape();
      pLDRegion1.moveToPoint( lineInEnd );
      pLDRegion1.lineToRelative( dSinTheta * Math.cos( theta ), dSinTheta * Math.sin( theta ) );
      pLDRegion1.lineToRelative( 2 * AMP * Math.sin( theta ), -2 * AMP * Math.cos( theta ) );
      pLDRegion1.lineToRelative( -dSinTheta * Math.cos( theta ), -dSinTheta * Math.sin( theta ) );

      pLDRegion2.moveToPoint( lineOutEnd );
      pLDRegion2.lineToRelative( -dSinTheta * Math.cos( theta ), dSinTheta * Math.sin( theta ) );
      pLDRegion2.lineToRelative( -2 * AMP * Math.sin( theta ), -2 * AMP * Math.cos( theta ) );
      pLDRegion2.lineToRelative( dSinTheta * Math.cos( theta ), -dSinTheta * Math.sin( theta ) );

      const pLDRegionOptions = { lineWidth: 1, fill: 'rgba( 64, 0, 0, 0.25 )' }; // light pink region to show PLD
      const pLDRegionPath1 = new Path( pLDRegion1, pLDRegionOptions );
      const pLDRegionPath2 = new Path( pLDRegion2, pLDRegionOptions );

      this.pLDNode.addChild( pLDRegionPath1 );
      this.pLDNode.addChild( pLDRegionPath2 );

      // add d sin(θ) and dimension arrow
      const pLDArrowStart = lineStart.plusXY( ( ELEMENT_SPACING + AMP + raySeparation ) * Math.sin( theta ),
        ( ELEMENT_SPACING + AMP + raySeparation ) * Math.cos( theta ) );
      const pLDArrowEnd = pLDArrowStart.plusXY( -dSinTheta * Math.cos( theta ), dSinTheta * Math.sin( theta ) );
      const pLDLabelCenter = pLDArrowStart.plusXY( ELEMENT_SPACING * Math.sin( theta ) - ( dSinTheta * Math.cos( theta ) ) / 2,
        ELEMENT_SPACING * Math.cos( theta ) + ( dSinTheta * Math.sin( theta ) ) / 2 );
      const pLDDimensionArrow = new ArrowNode( pLDArrowStart.x, pLDArrowStart.y, pLDArrowEnd.x, pLDArrowEnd.y, DIMENSION_ARROW_OPTIONS );
      const pLDDimensionLabel = new RichText( dSinThetaString, { maxWidth: 200, left: pLDLabelCenter.x, centerY: pLDLabelCenter.y } );

      // add a translucent white background behind the label text - could also use BackgroundNode
      const pLDLabelBackground = new Rectangle( pLDDimensionLabel.x, pLDDimensionLabel.top,
        pLDDimensionLabel.width + 2, pLDDimensionLabel.height + 2, 4, 4, {
          fill: 'white',
          opacity: 0.65
        } );
      this.pLDNode.addChild( pLDLabelBackground );
      this.pLDNode.addChild( pLDDimensionLabel );
      this.pLDNode.addChild( pLDDimensionArrow );
      this.pLDNode.setVisible( true );

      // Show Path difference information next to crystal
      const pLDDiagramBG = new Rectangle( 0, 0, 2 * dSinTheta, 2 * AMP, {
        lineWidth: model.inPhaseProperty.value ? 2 : 0.5,
        stroke: 'black',
        fill: 'rgba( 64, 0, 0, 0.25 )'
      } );
      const pLDDiagram = new LightPathNode( new Vector2( pLDDiagramBG.left, AMP ), new Vector2( pLDDiagramBG.right, AMP ),
        model.sourceWavelengthProperty.value * SCALE_FACTOR, {
          amplitude: AMP,
          waveFrontWidth: 2 * AMP,
          waveFrontPattern: () => 'black'
        } );
      pLDDiagram.addChild( pLDDiagramBG ); // add a background to the light wave

      const pLDDiagramDimensionArrow = new ArrowNode( pLDDiagramBG.left, 0, pLDDiagramBG.right, 0, DIMENSION_ARROW_OPTIONS );

      // Text nodes that reflects 2dsin(Theta), and 2dsin(Theta)/wavelength
      const _2dSinText = new RichText( StringUtils.fillIn( pLDString, {
        interplaneDistance: interplaneDistanceString,
        value: Utils.toFixed( model.pLDProperty.value, 1 ),
        unit: lengthUnitString
      } ), TEXT_OPTIONS );
      const _2dSinLambdaText = new RichText( StringUtils.fillIn( braggEquationString, {
        interplaneDistance: interplaneDistanceString,
        value: Utils.toFixed( model.pLDWavelengthsProperty.value, 2 )
      } ), TEXT_OPTIONS );

      const pLDPanel = new Panel( new VBox( {
        children: [ _2dSinLambdaText, pLDDiagram, pLDDiagramDimensionArrow, _2dSinText ],
        align: 'center',
        spacing: ELEMENT_SPACING
      } ), {
        xMargin: 0,
        yMargin: 0,
        fill: 'rgba( 255, 255, 255, 0.75 )',
        lineWidth: 0,
        left: this.crystalNode.right,
        centerY: pLDLabelCenter.y,
        cornerRadius: 6
      } );

      pLDPanel.right = Math.min( pLDPanel.right, this.controlPanel.left ); // avoid covering the control panels
      this.pLDNode.addChild( pLDPanel );
    }
  }

  /**
   * Steps the view.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    // stepping handeled in model
  }
}

/**
 * Initialize the icon for use in the toolbox.
 * @param {Node} node
 * @param {Property.<boolean>} inPlayAreaProperty
 * @param {function} forwardingListener
 */
const initializeIcon = ( node, inPlayAreaProperty, forwardingListener ) => {
  node.cursor = 'pointer';
  // These links and listeners exists for the entire duration of the sim. No need to dispose.
  inPlayAreaProperty.link( inPlayArea => { node.visible = !inPlayArea; } );
  node.addInputListener( DragListener.createForwardingListener( forwardingListener ) );
};

xrayDiffraction.register( 'XrayDiffractionScreenView', XrayDiffractionScreenView );
export default XrayDiffractionScreenView;