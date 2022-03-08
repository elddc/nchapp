import React, {useContext} from 'react';
import {Text, View, TouchableHighlight} from 'react-native';

import StyleContext from '../context/stylecontext';

import formatTime from '../../util/formattime';

//timer display (MM:SS)
	//toggleTimer: onPress callback
	//active: whether timer is running (contols styling only)
	//elapsedTime: time in seconds to display
const Timer = ({toggleTimer, active, elaspedTime}) => {
	const {timer, timerContainer, timerText} = useContext(StyleContext);

	return (
		<View style={timerContainer}>
			<TouchableHighlight
				disabled={!toggleTimer}
				onPress={() => toggleTimer(false)}
				onLongPress={() => toggleTimer(true)}
				style={{...timer, borderColor: (active ? '#de1245' : 'white')}}
			>
				<Text style={timerText}>
					{formatTime(elaspedTime)}
				</Text>
			</TouchableHighlight>
		</View>
	);
}

export default Timer;
