import React from 'react';
import {Text} from 'react-native';
import s from '../styles/styles';
import Popup from './popup'

const Help = ({visible, dismiss}) => {
	return (
		<Popup
			visible={visible}
			dismiss={dismiss}
			content={
				<Text style={s.modalText}>
					{'Click the timer to start, and long press to stop.\nClick any of the buttons to log an event.\n\nTry this app on your phone by clicking the "my device" tab on the right!\nThis app is still incomplete, but feel free to let me know if you find any bugs.'}
				</Text>
			}
			color={'white'}
		/>
	);
}

export default Help;
