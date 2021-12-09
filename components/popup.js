import React from 'react';
import {TouchableHighlight, Modal} from 'react-native';
import s from '../styles/styles';

const Popup = ({visible, dismiss, content}) => {
	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType={'fade'} //may use 'none' instead for speead at the cost of smooth transitions
			statusBarTranslucent={true}
			supportedOrientations={['portrait', 'landscape']}
		>
			<TouchableHighlight onPress={dismiss} style={s.overlay} underlayColor={'transparent'}>
			    <TouchableHighlight style={s.modal}>
    				{content}
    			</TouchableHighlight>
			</TouchableHighlight>
		</Modal>
	);
}

export default Popup;
