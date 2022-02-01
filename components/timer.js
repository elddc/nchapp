import React from 'react';
import {Text, View, TouchableHighlight} from 'react-native';
import s, {landscape, vw} from '../styles/styles';

import formatTime from '../util/formattime';

//maximum unit is in minutes (assumes will never need hours)
const Timer = ({toggleTimer, active, elaspedTime}) => {
	return (
		<View style={s.timerContainer}>
			<TouchableHighlight
				onPress={() => toggleTimer(false)}
				onLongPress={() => toggleTimer(true)}
				style={{
					...s.timer,
					borderColor: (active ? '#de1245' : 'white'),
					width: (landscape ? 50*vw : 88*vw),
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
