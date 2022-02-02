import React, {useEffect, useState} from 'react';
import {TouchableHighlight, Modal, Keyboard} from 'react-native';
import s, {em} from '../styles/styles';

const Popup = ({visible, dismiss, content}) => {
	const [keyboardActive, setKeyboardActive] = useState(false);

	useEffect(() => {
		const listeners = [
			Keyboard.addListener('keyboardWillShow', () => {
				setKeyboardActive(true);
			}),
			Keyboard.addListener('keyboardWillHide', () => {
				setKeyboardActive(false);
			}),
		];
		return () => {
			listeners[0].remove();
			listeners[1].remove();
		}
	}, [])

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType={'fade'} //may use 'none' instead for speead at the cost of smooth transitions
			statusBarTranslucent={true}
			supportedOrientations={['portrait', 'landscape']}
		>
			<TouchableHighlight onPress={dismiss} style={s.overlay} underlayColor={'transparent'}>
				<TouchableHighlight style={[s.modal, {marginBottom: keyboardActive ? 10*em : 0}]}>
					{content}
				</TouchableHighlight>
			</TouchableHighlight>
		</Modal>
	);
}

export default Popup;