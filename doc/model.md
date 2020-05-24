Model for xray-diffraction 
Todd Holden
5/23/2020 

xray-diffraction model sets up a crystal lattice, defines its orientation, and calculates the parameters needed to determine diffraction angles via Bragg's law or the Ewald sphere construction using reciprocol lattice vectors.

http://en.wikipedia.org/wiki/Bragg's_law

http://en.wikipedia.org/wiki/Ewald's_sphere

The model also keeps track of the phase and wavelength of the incoming light wave. Light waves are propogated by 6 radians/s. Note that this means the speed varies by wavelength. A wavelength independent speed would make short wavelength wavefronts move too fast, but could be achieved by dividing the propagation amount by the wavelength.