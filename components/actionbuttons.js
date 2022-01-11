import s from '../styles/styles';
import {Text, TouchableHighlight, View} from 'react-native';
import React from 'react';

const ActionButtons = ({actions, logEvent}) => {
	return (
		<View style={s.wrapRow}>
			{Object.keys(actions).map((name) => {
				const {color, active} = actions[name];

				switch (active) {
					case -1:
						name = 'Start CPR';
						break;
					case 0:
						name = 'Restart CPR';
						break;
					case 1:
						name = 'Pause CPR';
						break;
				}

				return (
					<TouchableHighlight
						style={[s.actionButton, {backgroundColor: (active > 0) ? '#269399' : color}]}
						onPress={() => logEvent(name)}
						key={name}
					>
						<Text style={s.buttonText}>{name}</Text>
					</TouchableHighlight>
				);
			})}
		</View>
	);
}

export default ActionButtons;