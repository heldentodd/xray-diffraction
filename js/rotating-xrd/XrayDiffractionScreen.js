// Copyright 2020, University of Colorado Boulder

/**
 * @author Todd Holden (https://tholden79.wixsite.com/mysite2)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import xrayDiffraction from '../xrayDiffraction.js';
import XrayDiffractionModel from './model/XrayDiffractionModel.js';
import XrayDiffractionScreenView from './view/XrayDiffractionScreenView.js';

class XrayDiffractionScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      //TODO if you include homeScreenIcon or navigationBarIcon, use JOIST/ScreenIcon
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new XrayDiffractionModel( tandem.createTandem( 'model' ) ),
      model => new XrayDiffractionScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

xrayDiffraction.register( 'XrayDiffractionScreen', XrayDiffractionScreen );
export default XrayDiffractionScreen;