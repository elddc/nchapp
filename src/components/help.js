import React, {useState, useContext, useEffect} from 'react';
import {Image} from 'react-native';

import StyleContext from '../context/stylecontext';
import {PagedPopup} from './popup'

//help text, displays in modal
	//visible: whether component should display
	//dismiss: function to hide component
const Help = ({visible, dismiss}) => {
	const {modal} = useContext(StyleContext);
	const [cardData, setCardData] = useState([ //images and text for each card
		{
			path: require('../assets/help/timer.png'),
			text: 'Tap once to start the timer, and long press to stop.'
		}, {
			path: require('../assets/help/actions.png'),
			text: 'Tap any of the buttons to log an event. Some buttons will open an additional input screen.'
		}, {
			path: require('../assets/help/list.png'),
			text: 'Tap any of the options in the list to add it to the event log, or tap the top to go back.'
		}, {
			path: require('../assets/help/textbox.png'),
			text: 'Tapping "other" on any screen will open a text input. Type text to add to the log.'
		}, {
			path: require('../assets/help/bottom.png'),
			text: 'Additional helpers are available on the bottom of the screen.\n\n' +
				'The expand button enlarges the event log.\n\n' +
				'The metronome button opens metronome controls, including play, pause, and change BPM.\n\n' +
				'The help button opens this display.'
		}, {
			path: require('../assets/help/endactions.png'),
			text: 'After the timer ends, these actions will be available.\n\n' +
				'- Tap "Notes" to enter text after the event log.\n\n' +
				'- Tap "Save" to save the event log to the camera roll.\n\n' +
				'- Tap "Resume" to resume the timer and go back.\n\n' +
				'- Tap "Clear" to reset the timer and return to the main screen.'
		}
	]);

	//set up image height using aspect ratios
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

export default Help;
