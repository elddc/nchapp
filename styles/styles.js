import React from 'react';
import {Dimensions, Platform} from 'react-native';
import Constants from 'expo-constants';
//react-native StyleSheet does not offer improved performance or notable utility, replaced by JS objects

//dynamic sizing
const metric = 'window'; //alternative: 'screen'
let vw = Dimensions.get(metric).width / 100;
let vh = Dimensions.get(metric).height / 100;
let landscape = (vw > vh);
if (landscape) {   //swaps dimensions if opened in landscape
	[vw, vh] = [vh, vw];
}

let em = 20;

let center = {
	justifyContent: 'center',
	alignItems: 'center',
};
let text = {
	color: 'white',
	fontSize: em,
	//fontFamily: 'Avenir', //iOS only
};
let row = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	alignSelf: 'center',
	width: (landscape ? null : 95 * vw),
};
let tableRow = {
	...row,
	paddingVertical: .75*em,
	backgroundColor: 'black',
};
let wrapRow = {
	...row,
	...center,
	flexWrap: 'wrap',
	width: (landscape ? 55 * vw : row.width),
	marginTop: .2 * em,
};
let button = {
	...center,
	minHeight: 2 * vh,
	margin: vh,
	padding: 2.5 * vw,
	borderRadius: 5 * vh,
	alignSelf: 'center',
};
let actionButton = {
	...button,
	flexBasis: '45%',
};
let buttonText = {
	...text,
	fontWeight: 'bold',
	alignSelf: 'center',
};
let container = {
	flex: 1,
	alignItems: 'center',
	backgroundColor: 'black',
	paddingTop: (Platform.OS === 'web' ? 2 * vh : Constants.statusBarHeight),
};
let main = {
	flexDirection: (landscape ? 'row' : 'column'),
	alignSelf: 'center',
	padding: 2 * vh,
};
let timerContainer = {
	padding: .8 * em,
	alignSelf: 'center',
};
let fullscreen = {
	...container,
	position: 'absolute',
	top: 0,
	left: 0,
	height: '100%',
	width: '100%',
	backgroundColor: 'black',
};
let timer = {
	borderWidth: 4,
	borderRadius: 2.2 * em,
	padding: .5 * em,
	width: (landscape ? 50 * vw : 80 * vw),
};
let timerText = {
	...text,
	fontSize: 4 * em,
	textAlign: 'center',
	fontVariant: ['tabular-nums'],
};
let cell = {
	...text,
	flex: 1,
	flexWrap: 'wrap',
	minHeight: 1.4 * em,
	textAlign: 'center',
	fontSize: em,
};
let headerCell = {
	...cell,
	fontWeight: 'bold',
};
let eventLog = {
	marginVertical: 1.2 * em,
};
let help = {
	position: 'absolute',
	bottom: 2 * em,
	right: 2 * em,
};
let overlay = {
	height: '100%',
	width: '100%',
	backgroundColor: '#555555AA',
	...center,
};
let modal = {
	backgroundColor: 'white',
	width: 80 * vw,
	borderRadius: 2 * em,
	alignSelf: 'center',
	padding: 2 * em,
};
let modalText = {
	...text,
	color: 'black',
};
let hidden = {
	display: 'none',
};
let option = {
	padding: .6*em,
	paddingLeft: .8*em,
	textAlign: 'left',
	width: '100%',
	borderBottomWidth: 2,
	borderColor: 'white',
}
let optionText = {
	...text,
	fontSize: 1.5*em,
};
let header = {
	...row,
	justifyContent: 'flex-start',
	width: '100%',
	paddingBottom: .8*em,
	borderBottomWidth: 2,
	borderColor: 'white',
};
let headerText = {
	...text,
	fontSize: 2*em,
	fontWeight: 'bold',
	marginLeft: .5*em,
};
let horiLine = {
	borderBottomWidth: 1,
	borderColor: 'white',
	width: 95*vw,
	alignSelf: 'center',
}

//doesn't cause re-render
Dimensions.addEventListener('change', ({window}) => {
	vw = window.width / 100;
	vh = window.height / 100;
	landscape = (vw > vh);
	if (landscape) {   //swaps dimensions if opened in landscape
		[vw, vh] = [vh, vw];
	}
	console.log(landscape); //proves listener is firing
});

const styles = {
	center, text, row, tableRow, wrapRow,
	button, buttonText, actionButton,
	container, main, fullscreen,
	timerContainer, timer, timerText,
	cell, headerCell, eventLog,
	help, overlay, modal, modalText,
	option, optionText, header, headerText,
	hidden,
	horiLine,
};

export default styles;
export {vw, vh, em};
