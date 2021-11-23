import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';

//maximum unit is in minutes (assumes will never need hours)
const Timer = ({active, reset}) => {
	const [elaspedTime, setElapsedTime] = useState(0); //time in seconds
	const [timer, setTimer] = useState();

	//note: this will not handle pausing (stopping after a reset) because it is not needed in the final use case
	//display an "are you sure" alert before ending in final version, in case of accidental misclicks
	useEffect(() => {
	    if (active) {
		    let time = Date.now();
		    setTimer(setInterval(() => {
			    setElapsedTime(Math.floor((new Date() - time)/1000));
		    }, 250));
	    }
		else if (!active) {
		    clearInterval(timer);
		    setTimer(false);
	    }

		return () => clearInterval(timer);
	}, [active]);

	return (
		<View style={s.timerContainer}>
			<Text style={s.timerText}>
				{Math.floor(elaspedTime / 60).toString().padStart(2, '0')}
				:
				{(elaspedTime % 60).toString().padStart(2, '0')}
			</Text>
		</View>
	);
}

const s = StyleSheet.create({
	timerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 15,
	},
	timerText: {
		color: 'white',
		fontSize: 52,
	},
});

export default Timer;
