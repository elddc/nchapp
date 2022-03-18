import React, {useState, useContext, useEffect} from 'react';
import {Text, Image, View} from 'react-native';

import StyleContext from '../context/stylecontext';
import {PagedPopup} from './popup'

//help text, displays in modal
//visible: whether component should display
//dismiss: function to hide component
const Help = ({visible, dismiss}) => {
	const {modalText, modal, vh} = useContext(StyleContext);
	const [cardData, setCardData] = useState([
		{
			path: require('../assets/help/timer.png'),
			text: 'Tap once to start the timer, and long press to stop.'
		}, {
			path: require('../assets/help/actions.png'),
			text: 'Tap any of the buttons to log an event. Some buttons will open an additional input screen.'
		}, {
			path: require('../assets/help/list.png'),
			text: 'Tap any of the options to add it to the event log, or tap the top to go back.'
		}, {
			path: require('../assets/help/textbox.png'),
			text: 'Tapping "other" on any screen will open a text input. Type text to add to the log.'
		}, {
			path: require('../assets/help/bottom.png'),
			text: 'Additional helpers are available on the bottom of the screen.\n' +
				'The metronome button opens the metronome bar, where you can play/pause the metronome, and change the BPM.\n' +
				'After the timer ends, it willl be replaced by the expand button, which enlarges the event log.\n' +
				'The help button opens this display.'
		}, {
			path: require('../assets/help/endactions.png'),
			text: 'After the timer ends, these actions will be available.\n' +
				'Tap "Notes" to enter additional text, added to the end of the event log.\n' +
				'Tap "Save" to save an image of the event log to the camera roll.\n' +
				'Tap "Resume" to go back and resume the timer.\n' +
				'Tap "Clear" to reset the timer and return to the main screen.'
		}
	]);

	useEffect(() => {
		if (cardData && !cardData.aspectRatio) {
			const newCardData = cardData.map((card) => {
				const {height, width} = Image.resolveAssetSource(card.path);
				return {...card, aspectRatio: width/height}
			});
			setCardData(newCardData);
		}
	}, []);

	if (!visible || !cardData || !modal)
		return null;

	return (
		<PagedPopup dismiss={dismiss} data={cardData} />
	);
}

/*
<PagerView showPageIndicator={true}>
			<View>
			{cardData.map(card => {return (
				<Popup visible={true} dismiss={dismiss} key={card.path} >
					<View>
						<Image style={{
							width: modal.width - 2 * modal.paddingHorizontal,
							height: (modal.width - 2 * modal.paddingHorizontal) / card.aspectRatio,
							resizeMode: 'contain',
						}} source={card.path}/>
						<View style={{height: 2 * vh}}/>
						<Text style={modalText}>
							{card.text}
						</Text>
					</View>
				</Popup>
			)})}
			</View>
	</PagerView>
 */

export default Help;
