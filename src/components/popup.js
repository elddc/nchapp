import React, {useEffect, useState, useContext} from 'react';
import {TouchableHighlight, Modal, View, Text, Image, Keyboard, Platform} from 'react-native';
import Carousel from 'react-native-snap-carousel';

import StyleContext from '../context/stylecontext';

//keyboard-avoiding modal, used as container for content
	//visible: whether component should display
	//dismiss: function to hide component
	//content: inner part of component
const Popup = ({visible, dismiss, children}) => {
	const {em, overlay, modal} = useContext(StyleContext);
	const [keyboardActive, setKeyboardActive] = useState(false); //whether keyboard is open

	//add keyboard listener
	useEffect(() => {
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
			animationType={'fade'} //may use 'none' instead for speed at the cost of smooth transitions
			statusBarTranslucent={true}
			supportedOrientations={['portrait', 'landscape']}
		>
			<TouchableHighlight onPress={dismiss} style={overlay} underlayColor={'transparent'}>
				<TouchableHighlight style={{...modal, marginBottom: keyboardActive ? 18*em : 0}}>
					{children}
				</TouchableHighlight>
			</TouchableHighlight>
		</Modal>
	);
}

//paged modal without keyboard listeners
const PagedPopup = ({data, dismiss}) => {
	const {overlay, modal, modalText, vh} = useContext(StyleContext);

	return (
		<Modal
			visible={true}
			transparent={true}
			animationType={'fade'} //may use 'none' instead for speed at the cost of smooth transitions
			statusBarTranslucent={true}
			supportedOrientations={['portrait', 'landscape']}
		>
			<TouchableHighlight onPress={dismiss} style={overlay} underlayColor={'transparent'}>
				<Carousel data={data} itemWidth={modal.width} sliderWidth={modal.width} renderItem={({item}) => (
					<TouchableHighlight style={modal}>
						<View>
							<Image source={item.path} style={{
								width: modal.width - 2 * modal.paddingHorizontal,
								height: (modal.width - 2 * modal.paddingHorizontal) / item.aspectRatio,
								resizeMode: 'contain',
								marginBottom: 2 * vh,
							}}/>
							<Text style={modalText}>{item.text}</Text>
						</View>
					</TouchableHighlight>
				)}/>
			</TouchableHighlight>
		</Modal>
	);
}

export default Popup;
export {PagedPopup};