I# X-Ray Diffraction - implementation notes

This document contains notes related to the implementation of X-ray diffraction. This is not an exhaustive description
 of the implementation.  The intention is to provide a high-level overview, and to supplement the internal documentation 
(source code comments).  

Before reading this document, you should read:
* [model.md](https://github.com/heldentodd/xray-diffraction/blob/master/doc/model.md), a high-level description of the simulation model

In addition to this document, you are encouraged to read: 
* [PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md)  
* [PhET Software Design Patterns](https://github.com/phetsims/phet-info/blob/master/doc/phet-software-design-patterns.md)

## Overview

This repository contains the code for one simulation, but eventually three are planned: bragg-law, Single Crystal 
Diffraction, and Powder Diffraction.

Source code directory structure will be as follows (in the future):
    common - contains code that is used by >1 screen
    bragg-law - contains code used by the "bragg-law" screen
    single-crystal - contains code used by "single-crystal" screen (in the near future)
    powder - contains code used by "powder" screen (in the near future)

Each of the above directories is further divided into model and view packages.

To map between model and view coordinate frames a simple scale factor is used. The default origin for the model is at 
the center of the crystal. In model positive x is to the right, positive y is up. In view the default origin is at 
(0,0) and positive x is to the right, positive y is down.

The simulation is mainly for Bragg angles, which are when the path length difference (PLD) is equal to an integral number
 of wavelengths, and thus we have constructive interference. We can also express this as Bragg's Law, which is
 2 d sin(θ) = n λ (where d is the distance between atomic planes, θ is the angle of incidence, λ is the wavelength, and
 n is any integer).

Properties are named with the suffix 'Property', e.g. positionProperty.

## Terminology

This section defines terminology that you'll see used throughout the internal and external documentation. Skim this 
section once, and refer back to it as you explore the implementation.

Much of the terminology for this sim is identified by labels that are visible in the user interface (Stopwatch, 
Collision Detector, Particle Flow Rate, Divider, ...) and those terms are not included here.

Here's the (relatively short) list of terms that might be unclear:

* _model.lattice_ - defines the lattice that is acting as an X-ray diffraction grating. The atomic sites are in _lattice.sites_ 
and other properties, such as the real-space and reciprocal lattice basis vectors are also stored here.
* _model.pLDProperty_ - this property stores the path length difference (PLD) which can be compared to the wavelength
 to see if we have met the Bragg condition.

## General Considerations

This section describes how this simulation addresses implementation considerations that are typically encountered in PhET simulations.

**Coordinate Transforms**: The model coordinate frame is in Angstrom (Å), with +x right, +y down. The standard
 (scenery) view coordinate frame has +x right, +y down. The transform is therefore a simple scale factor currently set 
  to 8 just to make things look good.

**Time Transforms**: light is very fast. To slow things down enough to see a light wave waving (in the distance of a 
few Angstrom) we need to greatly slow down time (by a factor of 10<sup>18</sup>). Alternatively, this can be thought of 
as letting the speed of light to be 3 Å/s rather than 3x10<sup>18</sup> m/s.

**Memory Management**:  Light rays are drawn as a node that is removed at each timestep and not referenced outside of 
 the XrayDiffractionScreenView. All other object instances (model and view) persist for the 
lifetime of the sim.  There is no need to call `unlink`, `removeListener`, `dispose`, etc. 

**Query Parameters**: Only the standard PhET Query Parameters are implemented at this time.

**Color Profiles**: No special color profiles are implemented at this time. 

**Assertions**: The implementation makes use of `assert` to verify pre/post assumptions and perform type checking. 
This sim performs type-checking for most function arguments via `assert`.  If you are making modifications to this sim, do so with assertions enabled via the `ea` query parameter.

## Detailed code descriptions

This section describes base classes that are common to all screens.  You'll find these classes in `js/xray-diffraction/`.

### Model

[XrayDiffractionModel](https://github.com/phetsims/phet-info/blob/master/js/xray-diffraction/model/XrayDiffractionModel.js) 
is the model base class. It calculates the path length difference (PLD) and reciprocal lattice vectors needed to 
calculate the diffraction angles via Bragg's law or the Ewald sphere. 

[Lattice](https://github.com/phetsims/phet-info/blob/master/js/xray-diffraction/model/Lattice.js) 
defines the lattice that is acting as an X-ray diffraction grating. The atomic sites are in _lattice.sites_ 
and other properties, such as the real-space and reciprocal lattice basis vectors are also stored here.

### View

[BaseScreenView](https://github.com/phetsims/phet-info/blob/master/js/xray-diffraction/view/XrayDiffractionScreenView.js) 
is the base `ScreenView`. It takes care of displaying everything.

[CrystalNode](https://github.com/phetsims/phet-info/blob/master/js/xray-diffraction/view/CrystalNode.js) 
renders the crystal, including dimensions, at the bottom of the view.

[LightPathNode](https://github.com/phetsims/phet-info/blob/master/js/xray-diffraction/view/LightPathNode.js) 
renders a light ray (sine wave, baseline, and optional wavefronts).

[ProtractorNode](https://github.com/phetsims/phet-info/blob/master/js/xray-diffraction/view/ProtractorNode.js) 
renders a protractor tool. This was copied from the Bending Light PhET.

[XrayControlPanel](https://github.com/phetsims/phet-info/blob/master/js/xray-diffraction/view/XrayControlPanel.js) 
renders a control panel that allows the user to control the various sim parameters.

[XrayParameterPanel](https://github.com/phetsims/gas-properties/blob/master/js/common/view/XrayParameterPanel.js) 
renders a display panel that shows detailed numerical information.
