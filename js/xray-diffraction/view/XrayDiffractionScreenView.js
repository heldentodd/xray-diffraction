// Copyright 2020, University of Colorado Boulder

/**
 * @author Todd Holden (Queensborough Community College of CUNY)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import Utils from '../../../../dot/js/Utils.js';
import XrayDiffractionConstants from '../../common/XrayDiffractionConstants.js';
import xrayDiffraction from '../../xrayDiffraction.js';
import xrayDiffractionStrings from '../../xrayDiffractionStrings.js';
import XrayDiffractionModel from '../model/XrayDiffractionModel.js';
import CrystalNode from './CrystalNode.js';
import LightPathNode from './LightPathNode.js';
import ProtractorNode from './ProtractorNode.js';
import XrayControlPanel from './XrayControlPanel.js';

// strings
const interplaneDistanceString = xrayDiffractionStrings.interplaneDistance;
const inPhaseString = xrayDiffractionStrings.inPhase;

const DIMENSION_ARROW_OPTIONS = { fill: 'black', stroke: null, tailWidth: 2, headWidth: 7, headHeight: 20, doubleHead: true };
const AMP = 10;
const SCALE_FACTOR = XrayDiffractionConstants.SCALE_FACTOR;
const TOP_RAY_LENGTH = 400; // Arbitrary length of top incident ray to start it near the top left
// Arbitrary location of the crystal near the bottom center
const CRYSTAL_NODE_OPTIONS = { centerX: 400, centerY: 440 };

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

    // @private - used to display the array of atoms
    this.crystalNode = new CrystalNode( model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS );

    this.addChild( this.crystalNode );

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
            this.redrawLight( model, this.crystalNode );
          }
        }
      },
      tandem: tandem.createTandem( 'timeControlNode' )
    } );
    // layout positioning done after control panel is created
    this.addChild( this.timeControlNode );

    // create the protractor node
    const showProtractorProperty = new BooleanProperty( false );
    const protractorNode = new ProtractorNode( showProtractorProperty, true, { scale: 0.8 } );
    protractorNode.protractorAngleProperty.value = Math.PI / 2;
    const protractorPositionProperty = new Vector2Property( protractorNode.center );
    // This link exists for the entire duration of the sim. No need to dispose.
    showProtractorProperty.linkAttribute( protractorNode, 'visible' );

    const protractorNodeIcon = new ProtractorNode( showProtractorProperty, false, { scale: 0.24 } );
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

    // update when angle changes
    // listener created once and needed for life of simulation. No need to dispose.
    model.sourceAngleProperty.changedEmitter.addListener( () => {
      this.redrawLight( model, this.crystalNode );
    } );

    // max width set to 260 which is less than the exit ray length
    const inPhaseText = new RichText( '', { maxWidth: 260 } );
    this.addChild( inPhaseText );

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

    // update display when wavelength, ray grid, or path difference checkbox changes
    // This link exists for the entire duration of the sim. No need to dispose.
    Property.multilink( [
      model.sourceWavelengthProperty,
      model.horizontalRaysProperty,
      model.verticalRaysProperty,
      model.wavefrontProperty,
      model.pathDifferenceProperty,
      model.showTransmittedProperty
    ], () => { this.redrawLight( model, this.crystalNode ); } );

    // update crystal when lattice parameters change
    // This link exists for the entire duration of the sim. No need to dispose.
    Property.multilink( [
      model.lattice.aConstantProperty,
      model.lattice.cConstantProperty
    ], () => {
      model.lattice.latticeConstantsProperty.value.x = model.lattice.aConstantProperty.value;
      model.lattice.latticeConstantsProperty.value.z = model.lattice.cConstantProperty.value;
      model.lattice.updateSites();
      this.removeChild( this.crystalNode );
      this.crystalNode = new CrystalNode( model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS );
      this.addChild( this.crystalNode );
      this.redrawLight( model, this.crystalNode );
      protractorNode.moveToFront();
      measuringTapeNode.moveToFront();
    } );

    // @private - used to create an input panel for users to adjust parameters of the simulation
    this.controlPanel = new XrayControlPanel( model );

    // Layout for controls done manually at the top right
    this.timeControlNode.top = XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN;
    this.controlPanel.right = this.layoutBounds.maxX - XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN;
    this.timeControlNode.left = this.controlPanel.left;
    this.controlPanel.top = this.timeControlNode.bottom + 5;
    this.addChild( this.controlPanel );

    // update view on model step
    model.addStepListener( () => {
      if ( model.animateProperty ) {
        this.redrawLight( model, this.crystalNode );
      }
    } );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
        measuringTapeNode.reset();
        this.removeChild( this.crystalNode );
        this.crystalNode = new CrystalNode( model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS );
        this.addChild( this.crystalNode );
        this.redrawLight( model, this.crystalNode );
        showProtractorProperty.reset();
        protractorNode.protractorAngleProperty.value = Math.PI / 2;
        protractorNode.moveToFront();
        isMeasuringTapeInPlayAreaProperty.value = false;
        measuringTapeNode.visible = false;
        measuringTapeNode.reset();
        measuringTapeNode.moveToFront();
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
   * For all updates after the initial drawing. If this ends up costing to much time, could be inlined and eliminated.
   * @param {XrayDiffractionModel} model
   * @param {CrystalNode} crystalNode
   * @public
   */
  redrawLight( model, crystalNode ) {
    this.removeChild( this.lightPathsNode );
    this.drawLight( model, crystalNode );
  }

  /**
   * Draws the light rays (incoming and outgoing) along with the path length difference (PLD) region if checked.
   * Should one be called for the initial drawing. Otherwise use redrawLight.
   * @param {XrayDiffractionModel} model
   * @param {CrystalNode} crystalNode
   * @public
   */
  drawLight( model, crystalNode ) {
    const theta = model.sourceAngleProperty.get();
    const lamda = SCALE_FACTOR * model.sourceWavelengthProperty.get();
    const raySeparation = SCALE_FACTOR * ( model.lattice.latticeConstantsProperty.value.z * Math.cos( theta ) );

    const incidentRay1End = new Vector2( crystalNode.centerX, crystalNode.centerY ).minus( model.lattice.sites[ 0 ].timesScalar( SCALE_FACTOR ) );

    // Arbitrary length (400 pixels) of top incident ray to start it near the top left
    let incidentRay1Start = new Vector2( TOP_RAY_LENGTH, 0 );
    incidentRay1Start = incidentRay1End.minus( incidentRay1Start.rotated( model.sourceAngleProperty.get() ) );

    // @private - used to draw the current frame of the light waves. Updated at each timestep when animating.
    this.lightPathsNode = new Node();

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

    // if checked, draw the Path Length Difference region
    if ( model.pathDifferenceProperty.value ) {
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
      this.lightPathsNode.addChild( pLDPath );

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

      this.lightPathsNode.addChild( pLDRegionPath1 );
      this.lightPathsNode.addChild( pLDRegionPath2 );

      // add d sin(θ) and dimension arrow
      const pLDArrowStart = lineStart.plusXY( ( 5 + AMP + raySeparation ) * Math.sin( theta ), ( 5 + AMP + raySeparation ) * Math.cos( theta ) );
      const pLDArrowEnd = pLDArrowStart.plusXY( -dSinTheta * Math.cos( theta ), dSinTheta * Math.sin( theta ) );
      const pLDLabelCenter = pLDArrowStart.plusXY( 5 * Math.sin( theta ) - ( dSinTheta * Math.cos( theta ) ) / 2,
        5 * Math.cos( theta ) + ( dSinTheta * Math.sin( theta ) ) / 2 );
      const pLDDimensionArrow = new ArrowNode( pLDArrowStart.x, pLDArrowStart.y, pLDArrowEnd.x, pLDArrowEnd.y, DIMENSION_ARROW_OPTIONS );

      const pLDDimensionLabel = new RichText( interplaneDistanceString + '<i>sin</i>(θ)',
        { maxWidth: 200, left: pLDLabelCenter.x, centerY: pLDLabelCenter.y } );
      // add a translucent white background behind the label text - could also use BackgroundNode
      const pLDLabelBackground = new Rectangle( pLDDimensionLabel.x, pLDDimensionLabel.top,
        pLDDimensionLabel.width + 2, pLDDimensionLabel.height + 2, 4, 4, {
          fill: 'white',
          opacity: 0.6
        } );
      this.lightPathsNode.addChild( pLDLabelBackground );
      this.lightPathsNode.addChild( pLDDimensionLabel );
      this.lightPathsNode.addChild( pLDDimensionArrow );
    }
    this.addChild( this.lightPathsNode );
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