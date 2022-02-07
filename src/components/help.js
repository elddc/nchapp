import React, {useContext} from 'react';
import {Text} from 'react-native';

import StyleContext from '../context/stylecontext';
import Popup from './popup'

//help text, displays in modal
//visible: whether component should display
//dismiss: function to hide component
const Help = ({visible, dismiss}) => {
	const {modalText} = useContext(StyleContext);

	return (
		<Popup
			visible={visible}
			dismiss={dismiss}
			content={
				<Text style={modalText}>
					{'Tap the timer to start, and long press to stop.\nTap any of the buttons to log an event.\n\nTap the metronome icon to open and close the metronome controls, where you can play/pause sound and change the BPM.'}
				</Text>
			}
		/>
	);
}

export default Help;
