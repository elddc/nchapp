import React, {useEffect, useState, useContext} from 'react';
import {TouchableHighlight, Modal, Keyboard, Platform} from 'react-native';

import StyleContext from '../context/stylecontext';

//modal
//visible: whether component should display
//dismiss: function to hide component
//content: inner part of component
const Popup = ({visible, dismiss, content}) => {
	const {em, overlay, modal} = useContext(StyleContext);
	const [keyboardActive, setKeyboardActive] = useState(false); //whether keyboard is open

	//add keyboard listener
	useEffect(() => {
		console.log('adding keyboard listeners')
		const listeners = [
			Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => {
				setKeyboardActive(true);
			}),
			Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
				setKeyboardActive(false);
			})
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
			<TouchableHighlight onPress={dismiss} style={overlay} underlayColor={'transparent'}>
				<TouchableHighlight style={[modal, {marginBottom: keyboardActive ? 15*em : 0}]}>
					{content}
				</TouchableHighlight>
			</TouchableHighlight>
		</Modal>
	);
}

export default Popup;
