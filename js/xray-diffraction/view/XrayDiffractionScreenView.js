// Copyright 2020, University of Colorado Boulder

/**
 * @author Todd Holden (Queensborough Community College of CUNY)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import XrayDiffractionConstants from '../../common/XrayDiffractionConstants.js';
import xrayDiffraction from '../../xrayDiffraction.js';
import xrayDiffractionStrings from '../../xrayDiffractionStrings.js';
import XrayDiffractionModel from '../model/XrayDiffractionModel.js';

import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import CrystalNode from './CrystalNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import LightPathNode from './LightPathNode.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import MovableDragHandler from '../../../../scenery-phet/js/input/MovableDragHandler.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Panel from '../../../../sun/js/Panel.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Property from '../../../../axon/js/Property.js';
import ProtractorNode from './ProtractorNode.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Shape from '../../../../kite/js/Shape.js';
import ToolIconListener from './ToolIconListener.js';
import Utils from '../../../../dot/js/Utils.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import XrayControlPanel from './XrayControlPanel.js';
import XrayParameterPanel from './XrayParameterPanel.js';

//strings
const distanceString = xrayDiffractionStrings.distance;
const inPhaseString = xrayDiffractionStrings.inPhase;
const pathDifferenceEqualsString = xrayDiffractionStrings.pathDifferenceEquals;
  
const DIMENSION_ARROW_OPTIONS = { fill: 'black', stroke: null, tailWidth: 2, headWidth: 7, headHeight: 20, doubleHead: true };
const AMP = 10;
const scaleF = 8;

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

    this.crystalNode = new CrystalNode (model.lattice);
    this.crystalNode.centerX = 400;
    this.crystalNode.centerY = 450;

    this.addChild( this.crystalNode );
    
    this.drawLight(model, this.crystalNode);
  
    // update when angle changes
    model.sourceAngleProperty.changedEmitter.addListener( () => {
        this.redrawLight(model, this.crystalNode);
    } );


    const inPhaseText = new RichText( '', { maxWidth: 400 } );
    this.addChild( inPhaseText );
      
    model.pLDWavelengthsProperty.changedEmitter.addListener( () => {
      if (Math.abs( model.pLDWavelengthsProperty.value - Utils.roundSymmetric(model.pLDWavelengthsProperty.value) ) < 0.014 ) {

        //reorient text and make it visible
        const theta = model.sourceAngleProperty.get();
        const rayEnd = new Vector2(this.crystalNode.centerX,this.crystalNode.centerY).minus(model.lattice.sites[0].timesScalar(scaleF));
        let rayStart = new Vector2(200,0);
        rayStart = rayEnd.minus( rayStart.rotated( Math.PI - theta ) );
        if (model.showWaveFrontsProperty.value) {
          const raySep = 4 * ( model.lattice.latticeConstantsP.value.z * Math.cos(theta));
          rayStart = rayStart.addXY( - (raySep + AMP) * Math.sin(theta), - (raySep + AMP) * Math.cos(theta) );
        }
        else {
          rayStart = rayStart.addXY( - 2.2 * AMP * Math.sin(theta), - 2.2 * AMP * Math.cos(theta) );
        }
        inPhaseText.rotation = - model.sourceAngleProperty.value;
        inPhaseText.text = inPhaseString + ' ' + pathDifferenceEqualsString + Utils.toFixed( model.pLDWavelengthsProperty.value, 0 ) +' λ' ;
        inPhaseText.center = rayStart;
      }
      else {
        inPhaseText.text = '';
      }
    } );

    // update display when wavelength, ray grid, or path difference checkbox changes
    Property.multilink( [
      model.sourceWavelengthProperty,
      model.horizontalRaysProperty,
      model.verticalRaysProperty,
      model.showWaveFrontsProperty,
      model.pathDifferenceProperty
      ], () => { this.redrawLight(model, this.crystalNode); } );
    
    // update crystal when lattice parameters change
    Property.multilink( [
      model.lattice.aConstantProperty,
      model.lattice.cConstantProperty
      ], () => {
        model.lattice.latticeConstantsP.value.x = model.lattice.aConstantProperty.value;
        model.lattice.latticeConstantsP.value.z = model.lattice.cConstantProperty.value;
        model.lattice.updateSites();
        this.removeChild( this.crystalNode );
        this.crystalNode = new CrystalNode (model.lattice);
        this.crystalNode.centerX = 400;
        this.crystalNode.centerY = 450;
        this.addChild( this.crystalNode );
        this.redrawLight(model, this.crystalNode);
      } );
    
    this.controlPanel = new XrayControlPanel( model );
    this.controlPanel.centerX = 900;
    this.addChild( this.controlPanel );

    this.parameterPanel = new XrayParameterPanel( model );
    this.parameterPanel.centerX = 675;
    this.parameterPanel.bottom = this.layoutBounds.maxY - XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( this.parameterPanel );

    model.showParmsProperty.linkAttribute( this.parameterPanel, 'visible' );

    // update view on model step
    model.addStepListener( () => {
      if (model.animateProperty) {
        this.redrawLight(model, this.crystalNode);
      }
    } );

    // create the protractor node
    this.showProtractorProperty = new Property( false );
    const protractorNodeIcon = new ProtractorNode( this.showProtractorProperty, false, { scale: 0.24 } );
    protractorNodeIcon.mouseArea = Shape.bounds( protractorNodeIcon.localBounds );
    protractorNodeIcon.touchArea = Shape.bounds( protractorNodeIcon.localBounds );
    this.showProtractorProperty.link( showProtractor => { protractorNodeIcon.visible = !showProtractor; } );

    const protractorNode = new ProtractorNode( this.showProtractorProperty, false, { scale: 0.8 } );
    const protractorPosition = new Vector2( protractorNode.centerX, protractorNode.centerY );
    const protractorPositionProperty = new Property( protractorPosition );

    const protractorNodeListener = new MovableDragHandler( protractorPositionProperty, {
      endDrag: () => { if ( protractorNode.getGlobalBounds().intersectsBounds( this.toolbox.getGlobalBounds() ) ) {
        this.showProtractorProperty.value = false;
      } }
    } );

    // Add an input listener to the toolbox icon for the protractor, which forwards events to the MovableDragHander
    // for the node in the play area
    protractorNodeIcon.addInputListener( new ToolIconListener( [ protractorNodeListener ], event => {
      // Show the protractor in the play area and hide the icon
      this.showProtractorProperty.value = true;

      // Center the protractor on the pointer
      protractorPositionProperty.value = protractorNode.globalToParentPoint( event.pointer.point );
    } ) );

    this.showProtractorProperty.linkAttribute( protractorNode, 'visible' );

    protractorPositionProperty.link( protractorPosition => {
      protractorNode.center = protractorPosition;
    } );

    protractorNode.addInputListener( protractorNodeListener );

    // add tape measure
    const measuringTapeProperty = new Property( {name: 'Å', multiplier: 0.125} );
    const measuringTapeNode = new MeasuringTapeNode( measuringTapeProperty, new BooleanProperty( true ), {

      // translucent white background, same value as in Projectile Motion, see https://github.com/phetsims/projectile-motion/issues/156
      textBackgroundColor: 'rgba( 255, 255, 255, 0.6 )',
      textColor: 'black',
      basePositionProperty: new Property( new Vector2( 100, 100 ) ),
      tipPositionProperty:  new Property( new Vector2( 140, 100 ) ),

    // baseDragStarted: () => { grabSound.play(); },

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

   // toolboxNodes = toolboxNodes.concat( this.getAdditionalToolIcons() );
    this.toolbox = new Panel( new VBox( {
      spacing: 10,
      children: toolboxNodes,
      excludeInvisibleChildrenFromBounds: false
    } ), {
      xMargin: 10,
      yMargin: 10,
      stroke: '#696969',
      lineWidth: 1.5, fill: '#EEEEEE',
      left: this.layoutBounds.minX + XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN
    } );
    this.addChild( this.toolbox );
    this.addChild( protractorNode );
    this.addChild( measuringTapeNode );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
        measuringTapeNode.reset();
        model.lattice.updateSites();
        this.removeChild( this.crystalNode );
        this.crystalNode = new CrystalNode (model.lattice);
        this.crystalNode.centerX = 400;
        this.crystalNode.centerY = 450;
        this.addChild( this.crystalNode );
        this.redrawLight(model, this.crystalNode);
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

  redrawLight(model, crystalNode) {
    this.removeChild(this.lightPathsNode);
    this.drawLight(model, crystalNode);
  }
  
  drawLight(model, crystalNode) {
    const theta = model.sourceAngleProperty.get();
    const lamda = scaleF * model.sourceWavelengthProperty.get();
    const raySeparation = scaleF * ( model.lattice.latticeConstantsP.value.z * Math.cos(theta));
      
    const incidentRay1End = new Vector2(crystalNode.centerX,crystalNode.centerY).minus(model.lattice.sites[0].timesScalar(scaleF));
    let incidentRay1Start = new Vector2(400,0);
    incidentRay1Start = incidentRay1End.minus( incidentRay1Start.rotated(model.sourceAngleProperty.get() ) );
    
    this.lightPathsNode = new Node();
  
    // if checked, draw the Path Length Difference region
    if (model.pathDifferenceProperty.value) {
      const dSinTheta = scaleF * ( model.lattice.latticeConstantsP.value.z * Math.sin(theta));
      const lineStart = incidentRay1End;
      const lineInEnd = new Vector2(lineStart.x - (AMP + raySeparation) * Math.sin(theta), lineStart.y + (AMP + raySeparation) * Math.cos(theta));
      const lineOutEnd = new Vector2(lineStart.x + (AMP + raySeparation) * Math.sin(theta), lineStart.y + (AMP + raySeparation) * Math.cos(theta));
      //  

      const pLD = new Shape();
      pLD.moveToPoint( lineInEnd );
      pLD.lineToPoint( lineStart );
      pLD.lineToPoint( lineOutEnd );
      const pLDPath = new Path( pLD, {
        stroke: 'blue',
        lineWidth: 1
      });
      this.lightPathsNode.addChild( pLDPath );
   
      // Shade in the region of path length difference
      const pLDRegion1 = new Shape();
      const pLDRegion2 = new Shape();
      pLDRegion1.moveToPoint( lineInEnd );
      pLDRegion1.lineToRelative( dSinTheta * Math.cos(theta), dSinTheta * Math.sin(theta) );
      pLDRegion1.lineToRelative( 2 * AMP * Math.sin(theta), - 2 * AMP * Math.cos(theta) );
      pLDRegion1.lineToRelative( - dSinTheta * Math.cos(theta), - dSinTheta * Math.sin(theta) );

      pLDRegion2.moveToPoint( lineOutEnd );
      pLDRegion2.lineToRelative( - dSinTheta * Math.cos(theta), dSinTheta * Math.sin(theta) );
      pLDRegion2.lineToRelative( - 2 * AMP * Math.sin(theta), - 2 * AMP * Math.cos(theta) );
      pLDRegion2.lineToRelative( dSinTheta * Math.cos(theta), - dSinTheta * Math.sin(theta) );
      
      const pLDRegionPath1 = new Path( pLDRegion1, {
        lineWidth: 1,
        fill: 'rgba( 64, 0, 0, 0.25 )'
      });
      
      const pLDRegionPath2 = new Path( pLDRegion2, {
        lineWidth: 1,
        fill: 'rgba( 64, 0, 0, 0.25 )'
      });
      
      this.lightPathsNode.addChild( pLDRegionPath1 );
      this.lightPathsNode.addChild( pLDRegionPath2 );

      //add d sin(θ) and dimension arrow
      const pLDArrowStart = lineStart.plusXY((5 + AMP + raySeparation) * Math.sin(theta), (5 + AMP + raySeparation) * Math.cos(theta));
      const pLDArrowEnd = pLDArrowStart.plusXY( - dSinTheta * Math.cos(theta) , dSinTheta * Math.sin(theta) );
      const pLDLabelCenter = pLDArrowStart.plusXY(5 * Math.sin(theta) - (dSinTheta * Math.cos(theta))/2 , 5 * Math.cos(theta) + (dSinTheta * Math.sin(theta))/2 );
      const pLDDimensionArrow = new ArrowNode( pLDArrowStart.x , pLDArrowStart.y , pLDArrowEnd.x , pLDArrowEnd.y , DIMENSION_ARROW_OPTIONS );
      this.lightPathsNode.addChild( pLDDimensionArrow );
      const pLDDimensionLabel = new RichText( distanceString + '<i>sin</i>(θ)', { maxWidth: 400, left: pLDLabelCenter.x, centerY: pLDLabelCenter.y } );
      this.lightPathsNode.addChild( pLDDimensionLabel );
    }
  
  // Main logic to draw the light rays
    const horiz = Math.floor ( Math.min( model.horizontalRaysProperty.get() ,  20 / model.lattice.latticeConstantsP.get().x  ) );
    const vert = Math.min ( Math.floor( model.verticalRaysProperty.get() ) , 1 + 2 * Math.floor( 20 / model.lattice.latticeConstantsP.get().z ) );
    for (let i = - horiz; i <= horiz; i++) {
      for (let j = 0; j < vert; j++) {
        const shift = new Vector2( scaleF * i * model.lattice.latticeConstantsP.get().x, - scaleF * j * model.lattice.latticeConstantsP.get().z );
        const distance = scaleF * (i * model.lattice.latticeConstantsP.get().x * Math.sin(theta) + j * model.lattice.latticeConstantsP.get().z * Math.cos(theta));
        const incidentRayStart = new Vector2(incidentRay1Start.x - distance * Math.sin(theta),
                                             incidentRay1Start.y + distance * Math.cos(theta));
        const incidentRayEnd = incidentRay1End.minus(shift);
        const incidentRayLength = incidentRayEnd.minus(incidentRayStart).getMagnitude();
        const exitRayPhase = (incidentRayLength / lamda /*- Math.floor(incidentRayLength / lamda)*/) * 2 * Math.PI + model.startPhase;
        const extraLength = 2 * scaleF * Math.cos(theta) * i * model.lattice.latticeConstantsP.get().x;
        const exitRayEnd = new Vector2(2 * incidentRayEnd.x - incidentRayStart.x + extraLength * Math.cos(theta), incidentRayStart.y - extraLength * Math.sin(theta));
        this.lightPathsNode.addChild( new LightPathNode ( incidentRayStart , incidentRayEnd , scaleF * model.sourceWavelengthProperty.get(), {
          amplitude: AMP,
          startPhase: model.startPhase,
          waveFrontWidth: raySeparation * model.showWaveFrontsProperty.value
         } ) );
        this.lightPathsNode.addChild( new LightPathNode ( incidentRayEnd , exitRayEnd , scaleF * model.sourceWavelengthProperty.get(), {
          amplitude: AMP,
          startPhase: exitRayPhase,
          waveFrontWidth: raySeparation * model.showWaveFrontsProperty.value
         } ) );
      }
    }
    this.addChild( this.lightPathsNode );
  }

  /**
   * Steps the view.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    //stepping handeled in model
  }
}

/**
 * Initialize the icon for use in the toolbox.
 * @param {Node} node
 * @param {Property.<boolean>} inPlayAreaProperty
 * @param {Object} forwardingListener
 */
const initializeIcon = ( node, inPlayAreaProperty, forwardingListener ) => {
  node.cursor = 'pointer';
  inPlayAreaProperty.link( inPlayArea => { node.visible = !inPlayArea; } );
  node.addInputListener( DragListener.createForwardingListener( forwardingListener ) );
};

xrayDiffraction.register( 'XrayDiffractionScreenView', XrayDiffractionScreenView );
export default XrayDiffractionScreenView;