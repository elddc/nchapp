import React, {useContext} from 'react';
import s, {vw} from '../styles/styles';
import {Text, TouchableHighlight, View} from 'react-native';
import LandscapeContext from '../context/landscapecontext';

const ActionButtons = ({actions, logEvent}) => {
	const landscape = useContext(LandscapeContext)

	return (
		<View style={{...s.wrapRow, width: (landscape ? 55*vw : 95*vw)}}>
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
						style={[s.actionButton, {backgroundColor: (active > 0) ? '#268f99' : color}]}
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