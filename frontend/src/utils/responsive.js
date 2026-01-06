export const BREAKPOINTS = {
  PORTRAIT_SM: 650,
  LANDSCAPE_SM: 650,
}

export const isSmallScreen = () => {
  return window.innerWidth <= BREAKPOINTS.PORTRAIT_SM
}

export const isLandscape = () => {
  return window.innerWidth > window.innerHeight
}

export const getOrientation = () => {
  return isLandscape() ? 'landscape' : 'portrait'
}
