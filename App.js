import React, {useState} from 'react';
import {StyleSheet, Text, View, TouchableHighlight, Dimensions, Platform} from 'react-native';
import Constants from 'expo-constants';

import Timer from './components/timer';

//ensures reasonably consistent sizing
//assumes (mobile) app will always open in full screen (not split with another app)
let metric = Platform.OS === 'web' ? 'window' : 'screen';   //best fit for different platforms
let vw = Dimensions.get(metric).width / 100;
let vh = Dimensions.get(metric).height / 100;
if (vw > vh){   //swaps dimensions if opened in landscape
	[vw, vh] = [vh, vw];
}

const App = () => {
	const [timer, setTimer] = useState(false); //whether timer is active
	const [reset, setReset] = useState(0) //dev purposes only

	//must toggle in order of start, stop, reset (see timer component for more info)
	const toggleTimer = () => setTimer(!timer);

	return (
		<View style={s.container}>
			<Timer active={timer} reset={reset} />
			<TouchableHighlight style={[s.button, {backgroundColor: (timer ? '#de1245' : '#16c6a3')}]} onPress={toggleTimer}>
				<Text style={s.buttonText}>{timer ? 'Stop' : 'Start'}</Text>
			</TouchableHighlight>
			<TouchableHighlight style={[s.button]} onPress={() => setReset(reset + 1)}>
				<Text style={s.buttonText}>Reset</Text>
			</TouchableHighlight>
		</View>
	);
}

const s = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		paddingTop: Constants.statusBarHeight,
		backgroundColor: 'black',
		padding: 8,
	},
	timerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	button: {
		margin: 1*vh,
		padding: 3*vw,
		minHeight: 12*vw,
		minWidth: 25*vw,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 5*vh,
	},
	buttonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	timerText: {
		color: 'white',
		fontSize: 52,
	},
});

export default App;
