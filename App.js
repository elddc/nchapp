import React, {useState, useEffect} from 'react';
import {useWindowDimensions, StyleSheet} from 'react-native';
import Main from './src/main';
import StyleContext from './src/context/stylecontext';

const App = () => {
	const [styles, setStyles] = useState({landscape: false, vw: 0, vh: 0, em: 0});
	const dm = useWindowDimensions();

	useEffect(() => {
		let vw = dm.width/100;
		let vh = dm.height/100;
		const landscape = vw > vh;
		const em = 20;

		if (landscape) //swaps dimensions in landscape
			[vw, vh] = [vh, vw];

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
			width: (landscape ? 55*vw : row.width),
			marginTop: .2*em,
		};
		const button = {
			...center,
			minHeight: 2*vh,
			margin: vh,
			padding: 2.5*vw,
			borderRadius: 5*vh,
			alignSelf: 'center',
		};
		const actionButton = {
			...button,
			flexBasis: '45%',
		};
		const dialogButton = {
			...actionButton,
			marginVertical: 0,
		};
		const xButton = {
			position: 'absolute',
			top: .5*em,
			right: .5*em,
		};
		const buttonText = {
			...text,
			fontWeight: 'bold',
			alignSelf: 'center',
		};
		const container = {
			flex: 1,
			alignItems: 'center',
			backgroundColor: 'black',
			paddingTop: 1.2*vh,
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
			height: '100%',
			width: '100%',
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
			marginVertical: 1*em,
		};
		const help = {
			position: 'absolute',
			bottom: .5*em,
			right: .5*em,
		};
		const metronome = {
			position: 'absolute',
			bottom: .5*em,
			left: .5*em,
		}
		const metronomeRow = {
			...row,
			width: 70*vw,
			position: 'absolute',
			bottom: .5*em,
			left: 4*em,
		};
		const overlay = {
			height: '100%',
			width: '100%',
			backgroundColor: '#555555AA',
			...center,
		};
		const modal = {
			backgroundColor: 'white',
			width: 80*vw,
			borderRadius: 4*vh,
			alignSelf: 'center',
			paddingVertical: 2*vh,
			paddingHorizontal: 5*vw,
		};
		const modalText = {
			...text,
			color: 'black',
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
		}
		const optionText = {
			...text,
			fontSize: 1.5*em,
		};
		const header = {
			...row,
			justifyContent: 'flex-start',
			width: '100%',
			paddingBottom: .8*em,
			borderBottomWidth: 2,
			borderColor: 'white',
			backgroundColor: 'black',
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
			width: 95*vw,
			alignSelf: 'center',
		};
		const textbox = {
			...text,
			color: 'black',
			//outlineStyle: (Platform.OS === 'web' ? 'none' : null),
		};
		const textboxContainer = {
			padding: .5*em,
			marginTop: 2*vh,
			marginBottom: 2.5*vh,
			borderBottomWidth: 2,
			borderColor: 'black',
			paddingRight: 2.5*em,
		};

		setStyles({
			em, vw, vh, landscape,
			center, text, row, tableRow, wrapRow,
			button, buttonText, actionButton, dialogButton, xButton,
			container, main, fullscreen,
			timerContainer, timer, timerText,
			cell, headerCell, eventLog,
			help, metronome, metronomeRow,
			overlay, modal, modalText,
			option, optionText, header, headerText,
			textbox, textboxContainer,
			hidden,
			horiLine,
		});
	}, [dm])

	return (
		<StyleContext.Provider value={styles}>
			<Main />
		</StyleContext.Provider>
	);
}

export default App;
