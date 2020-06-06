Implementation Notes for 'xray-diffraction' sim

This repository contains the code for one simulation, but eventually three are planned: bragg-law, Single Crystal Diffraction, and Powder Diffraction.

Source code directory structure will be as follows (in the future):
    common - contains code that is used by >1 screen
    bragg-law - contains code used by the "bragg-law" screen
    single-crystal - contains code used by "single-crystal" screen
    powder - contains code used by "powder" screen

Each of the above directories is further divided into model and view packages.

To map between model and view coordinate frames a simple scale factor is used. The default origin for the model is at the center of the crystal. In model positive x is to the right, positive y is up. In view the default origin is at (0,0) and positive x
is to the right, positive y is down.

The simulation is mainly for Bragg angles, which are when the path length difference (PLD) is equal to an integral number
 of wavelengths, and thus we have constructive interference. We can also express this as Bragg's Law, which is
 2 d sin(θ) = n λ (where d is the distance between atomic planes, θ is the angle of incidence, λ is the wavelength, and
 n is any integer).

Properties are named with the suffix 'Property', e.g. positionProperty.