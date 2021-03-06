import React, {useState, useEffect} from 'react';
import {useWindowDimensions, StyleSheet, Platform} from 'react-native';
import {useKeepAwake} from 'expo-keep-awake';
import Main from './src/main';
import StyleContext from './src/context/stylecontext';

//houses styling
const App = () => {
	useKeepAwake(); //prevent device from sleeping
	const [styles, setStyles] = useState({landscape: false, vw: 0, vh: 0, em: 0});
	const dm = useWindowDimensions();

	//generates styles when dimensions update
	useEffect(() => {
		//units, similar to CSS vw, vh, em
		let vw = dm.width/100;
		let vh = dm.height/100;
		const em = 20;

		//determine orientation and update dimensions as needed
		const landscape = vw > vh;
		if (landscape) //swaps dimensions in landscape
			[vw, vh] = [vh, vw];

		//style objects
		const center = {
			justifyContent: 'center',
			alignItems: 'center',
		};
		const text = {
			color: 'white',
			fontSize: em,
		};
		const row = {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			alignSelf: 'center',
			width: (landscape ? null : 95*vw),
		};
		const tableRow = {
			...row,
			paddingVertical: .75*em,
			backgroundColor: 'black',
		};
		const wrapRow = {
			...row,
			...center,
			flexWrap: 'wrap',
			width: (landscape ? 55*vw : 95*vw),
			marginTop: .2*em,
		};
		const button = {
			...center,
			margin: 1.3*vw,
			padding: 2.5*vw,
			borderRadius: 5*em,
			alignSelf: 'center',
		};
		const actionButton = {
			...button,
			width: '45%'
		};
		const dialogButton = {
			...actionButton,
			marginVertical: 0,
		};
		const xButton = {
			position: 'absolute',
			top: .4*em,
			right: .4*em,
		};
		const buttonText = {
			...text,
			fontWeight: 'bold',
			alignSelf: 'center',
		};
		const container = {
			flex: 1,
			alignItems: 'center',
			backgroundColor: 'black'
		};
		const main = {
			flexDirection: (landscape ? 'row' : 'column'),
			alignSelf: 'center',
			padding: 2*vh,
		};
		const timerContainer = {
			padding: .6*em,
			alignSelf: 'center',
		};
		const fullscreen = {
			...container,
			position: 'absolute',
			top: 0,
			left: 0,
			height: 100 * (landscape ? vw : vh), //'100%' leaves small gap at bottom
			width: '100%',
			paddingTop: vh,
			backgroundColor: 'black',
		};
		const timer = {
			borderWidth: 4,
			borderRadius: 2.2*em,
			padding: .5*em,
			width: (landscape ? 50*vw : 88*vw),
		};
		const timerText = {
			...text,
			fontSize: 4*em,
			textAlign: 'center',
			fontVariant: ['tabular-nums'],
		};
		const cell = {
			...text,
			flex: 1,
			flexWrap: 'wrap',
			minHeight: 1.4*em,
			textAlign: 'center',
			fontSize: em,
		};
		const headerCell = {
			...cell,
			fontWeight: 'bold',
		};
		const eventLog = {
			marginVertical: em,
			width: '100%',
		};
		const bottomRight = {
			position: 'absolute',
			bottom: .5*em,
			right: .5*em,
		};
		const bottomLeft = {
			position: 'absolute',
			bottom: .5*em,
			left: .5*em,
		};
		const metronomeRow = {
			...row,
			width: '65%',
			position: 'absolute',
			bottom: .5*em,
			marginHorizontal: 'auto',
		};
		const overlay = {
			height: '100%',
			width: '100%',
			backgroundColor: '#555555AA',
			...center,
		};
		const carousel = {
			alignItems: 'center',
			paddingBottom: 5*vh,
			flexGrow: 0,
		};
		const dot = {
			height: 15,
			width: 15,
			borderRadius: 15,
			backgroundColor: 'white',
			marginHorizontal: 3,
		};
		const modal = {
			backgroundColor: 'white',
			width: landscape ? 60*vh : 80*vw,
			borderRadius: 4*vh,
			alignSelf: 'center',
			padding: Math.min(5*vw, 1.4*em),
		};
		const modalText = {
			...text,
			color: 'black',
		};
		const image = {
			width: modal.width - 2*modal.padding,
			resizeMode: 'contain',
			marginBottom: modal.padding - 2,
			borderRadius: 2*vh,
		};
		const hidden = {
			display: 'none',
		};
		const option = {
			padding: .6*em,
			paddingLeft: .8*em,
			textAlign: 'left',
			width: '100%',
			borderBottomWidth: 2,
			borderColor: 'white',
		};
		const optionText = {
			...text,
			fontSize: 1.5*em,
		};
		const header = {
			...row,
			justifyContent: 'flex-start',
			width: '100%',
			paddingVertical: .8*em,
			borderBottomWidth: 2,
			borderColor: 'white',
		};
		const headerText = {
			...text,
			fontSize: 2*em,
			fontWeight: 'bold',
			marginLeft: .5*em,
		};
		const horiLine = {
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderColor: 'white',
			width: landscape ? 90*vh : 95*vw,
			alignSelf: 'center',
		};
		const textboxContainer = {
			padding: .5*em,
			marginTop: 2*vh,
			marginBottom: 2.5*vh,
			borderBottomWidth: 2,
			borderColor: 'black',
			paddingRight: 2.5*em,
		};
		let textbox = {
			...text,
			color: 'black',
		};
		if (Platform.OS === 'web')
			textbox.outlineStyle = 'none';

		setStyles({
			em, vw, vh, landscape,
			center, text, row, tableRow, wrapRow,
			button, buttonText, actionButton, dialogButton, xButton,
			container, main, fullscreen,
			timerContainer, timer, timerText,
			cell, headerCell, eventLog,
			bottomLeft, metronomeRow, bottomRight,
			overlay, carousel, dot, image, modal, modalText,
			option, optionText, header, headerText,
			textboxContainer, textbox,
			hidden,
			horiLine,
		});
	}, [dm])

	//pass styles to context
	return (
		<StyleContext.Provider value={styles}>
			<Main />
		</StyleContext.Provider>
	);
}

export default App;
