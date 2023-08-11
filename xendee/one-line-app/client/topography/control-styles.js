/****************************************************************************
 ** Styles for the GMap controls in the topographic map view.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/

const controlStyles = {
  controlInterface: {
    style: {
      background: 'rgba(40, 40, 40, .8)',
      border: '2 px solid #444',
      cursor: 'pointer',
      marginBottom: '20px',
      textAlign: 'center'
    },
    title: 'Map Control'
  },

  controlText: {
    style: {
      color: 'rgb(210, 210, 210)',
      fontFamily: 'Roboto, Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '30px',
      paddingLeft: '5px',
      paddingRight: '5px'
    }
  }
}

Object.freeze(controlStyles)

export default controlStyles