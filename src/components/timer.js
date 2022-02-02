import React, {useContext} from 'react';
import {Text, View, TouchableHighlight} from 'react-native';
import s, {vw} from '../styles/styles';

import formatTime from '../../util/formattime';
import LandscapeContext from '../context/landscapecontext';

//maximum unit is in minutes (assumes will never need hours)
const Timer = ({toggleTimer, active, elaspedTime}) => {
	const landscape = useContext(LandscapeContext);

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
