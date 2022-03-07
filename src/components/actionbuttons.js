import React, {useContext} from 'react';
import {Text, TouchableHighlight, View} from 'react-native';

import StyleContext from '../context/stylecontext';

//group of buttons used to log events
//actions: data used to generate buttons
//logEvent: onPress callback
const ActionButtons = ({actions, logEvent}) => {
	const {wrapRow, actionButton, buttonText} = useContext(StyleContext);

	return (
		<View style={wrapRow}>
			{Object.keys(actions).map((name) => { //generate buttons
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
						style={{...actionButton, backgroundColor: (active > 0) ? '#268f99' : color}}
						onPress={() => logEvent(name)}
						key={name}
					>
						<Text style={buttonText}>{name}</Text>
					</TouchableHighlight>
				);
			})}
		</View>
	);
}

export default ActionButtons;