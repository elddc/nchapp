import React, {useEffect, useState, useContext, useRef} from 'react';
import {TouchableHighlight, Modal, View, Text, Image, Keyboard, Platform} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';

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
	const {overlay, carousel, dot, modal, modalText, image, landscape, vh, vw} = useContext(StyleContext);
	const [currentIndex, setCurrentIndex] = useState(0);
	const carouselRef = useRef();

	/*const next = () => {
		carouselRef.current.snapToNext();
	}

	const prev = () => {
		carouselRef.current.snapToPrev();
	}*/

	return (
		<Modal
			visible={true}
			transparent={true}
			animationType={'fade'} //may use 'none' instead for speed at the cost of smooth transitions
			statusBarTranslucent={true}
			supportedOrientations={['portrait', 'landscape']}
		>
			<TouchableHighlight onPress={dismiss} style={overlay} underlayColor={'transparent'}>
				<View>
					<Carousel
						data={data}
						itemWidth={modal.width}
						sliderWidth={100 * (landscape ? vh : vw)}
						contentContainerCustomStyle={carousel}
						inactiveSlideScale={0}
						inactiveSlideOpacity={1}
						onBeforeSnapToItem={(i) => setCurrentIndex(i)}
						renderItem={({item}) => (
							<TouchableHighlight style={modal}>
								<View>
									<Image source={item.path} style={{...image, height: image.width/item.aspectRatio}}/>
									<Text style={modalText}>{item.text}</Text>
								</View>
							</TouchableHighlight>
						)}
						ref={carouselRef}
					/>
					<Pagination
						dotsLength={data.length}
						activeDotIndex={currentIndex}
						dotStyle={dot}
						inactiveDotOpacity={.5}
						inactiveDotScale={.7}
						animatedDuration={200}
						animatedFriction={2.5}
						animatedTension={60}
						tappableDots={true}
						carouselRef={carouselRef}
					/>
				</View>
			</TouchableHighlight>
		</Modal>
	);
}

export default Popup;
export {PagedPopup};