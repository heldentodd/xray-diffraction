# X-ray Diffraction - model description

This document is a high-level description of the model used in the _X-ray Diffraction_ simulation, which is based on PhET technology.

The xray-diffraction model sets up a crystal lattice, defines its orientation, and calculates the parameters needed to 
determine diffraction angles via Bragg's law or the Ewald sphere construction using reciprocol lattice vectors. More 
information can be found at http://en.wikipedia.org/wiki/Bragg's_law and http://en.wikipedia.org/wiki/Ewald's_sphere

## Units, Constants, and Symbols

First, a description of the units, constants, and symbols used in this sim. Use this section as a reference.

#### Units

Since we are at the atomic scale, all distances are in Angrom (1 Å = 10<sup>-10</sup> m). All angles are in 
radians although they are eventually converted to degrees when output to the user.

The units used in this sim are:
* angle: radians
* distance: Å
* time: as (= 10<sup>-18</sup> s - This slows down the light waves enough to allow for limitations in human perception)

#### Constants

* c = speed of light = 3 x 10<sup>8</sup> m/s (= 3 Å/As) 

#### Symbols

* (a, b, c) = lattice constants
* d = atomic interplance spacing
* θ = angle of incidence (realtive to atomic plane)
* λ = wavelength of light (X-ray)
* t = time
* T = temperature
* v = velocity
* |v| = velocity magnitude (aka speed)
* V = volume of the container

## Equations

This section enumerates the primary equations used in the sim. Use this section as a reference.

* Bragg's Law: 2d<i>sin</i>(θ) = nλ
* photon wavenumber: k = 2π/λ
* Reciprocal Lattice Constants: (h,k,l) = (2π/a, 2π/b, 2π/c) (for an orthorhombic lattice)
* Reciprocal Lattice Vectors: <b>G</b> = (n<sub>1</sub>·h,n<sub>2</sub>·k,n<sub>3</sub>·l), n<sub>1</sub>, n<sub>2</sub>, and n<sub>3</sub> are integers
* General Diffraction Condition: <b>K<sub>f</sub></b> - <b>K<sub>i</sub></b> = <b>G</b>

##  Crystal Lattice

Atoms are arrayed on a 2D rectangular lattice. The lattice is centered at 0,0 and points are added symmetrically 
(up and down or left and right) up to a size of 20 Å. The top center atom is placed as the first element of the 
cystal lattice sites array as it is the point where the first light ray hits. 

## Light Rays (X-Rays)

The first light ray enters at the proper angle and reflects specularly off the top center atom 
(transmitted rays, etc. are not currently shown). Rays bouncing off lower atoms travel a longer distance 
and thus can end up in-phase or out of phase depending on the lattice constant and incident angle. The 
transmitted ray can also be shown.

## Detection of Bragg Condition

When the additional path length differene (PLD) the lower ray travels is exactly an integer multiple of the 
light wavelength, the Bragg condition is met. When this is detected, the simulation is notified so that 
this can be displayed to the user. When the condition is met, the diffracted rays are made bold to indicate
that the condition for constructive interference is met and a diffraction peak will be seen at that angle.
If present, the transmitted ray is also made slightly less bold to indicate that some intensity is diffracted
away. 

## Vertical and Horizontal Rays

The simulation allows the student to display extra vertical and horizontal waves. This allows the student to see 
that the horizontal atoms do not determine the Bragg angle, since rays reflected from them are always-in phase. 
Likewise, the student can see that extra vertical layers will be in-phase if the first two are in-phase and 
will cause destructive interference otherwise.