import React, {useState} from 'react';
import {StyleSheet, Text, View, TouchableHighlight, Dimensions, Platform, Alert} from 'react-native';
import Constants from 'expo-constants';

import Timer from './components/timer';
import EventLog from './components/eventlog.js';

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
	const [events, setEvents] = useState([]);

	//must toggle in order of start, stop, reset (see timer component for more info)
	const toggleTimer = () => {
		if (!timer) {
			setTimer(true);
		}
		else {
			Alert.alert(
				'Are you sure you want to end the timer?',
				'You will not be able to return to this page',
				[
					{
						text: 'No',
						style: 'destructive'
					},
					{
						text: 'Yes',
						onPress: () => {
							setTimer(!timer)
						}
					}
				],
				{ cancelable: true }
			)
		}
	};

	const logEvent = (number) => {
		setEvents([...events, number]);
	}

	return (
		<View style={s.container}>
			<Timer active={timer} />
			<TouchableHighlight style={[s.button, {backgroundColor: (timer ? '#de1245' : '#16c6a3')}]} onPress={toggleTimer}>
				<Text style={s.buttonText}>{timer ? 'Stop' : 'Start'}</Text>
			</TouchableHighlight>
			<TouchableHighlight style={[s.button]} onPress={() => logEvent(1)}>
				<Text style={s.buttonText}>Event 1</Text>
			</TouchableHighlight>
			<TouchableHighlight style={[s.button]} onPress={() => logEvent(2)}>
				<Text style={s.buttonText}>Event 2</Text>
			</TouchableHighlight>
			<TouchableHighlight style={[s.button]} onPress={() => logEvent(3)}>
				<Text style={s.buttonText}>Event 3</Text>
			</TouchableHighlight>
			<EventLog t={events} />
		</View>
	);
}

const s = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignContent: 'center',
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
		width: 50*vw,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
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
