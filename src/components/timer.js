import React, {useContext} from 'react';
import {Text, View, TouchableHighlight} from 'react-native';

import StyleContext from '../context/stylecontext';

import formatTime from '../../util/formattime';

//maximum unit is in minutes (assumes will never need hours)
const Timer = ({toggleTimer, active, elaspedTime}) => {
	const s = useContext(StyleContext);

	return (
		<View style={s.timerContainer}>
			<TouchableHighlight
				onPress={() => toggleTimer(false)}
				onLongPress={() => toggleTimer(true)}
				style={{
					...s.timer,
					borderColor: (active ? '#de1245' : 'white'),
			}}
			>
				<Text style={s.timerText}>
					{formatTime(elaspedTime)}
				</Text>
			</TouchableHighlight>
		</View>
	);
}

export default Timer;
