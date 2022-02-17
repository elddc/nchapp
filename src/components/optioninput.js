import React, {useState, useContext} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {Feather} from '@expo/vector-icons';

import StyleContext from '../context/stylecontext';
import Popup from './popup';

//todo check position on devices of differing screen sizes for button visibility

//text input dialog
//visible: whether component should display
//submit: onPress callback
//dismiss: function to hide component
const OptionInput = ({visible, submit, dismiss}) => {
	const {em, textboxContainer, textbox, buttonText, xButton, dialogButton, row} = useContext(StyleContext);
	const [text, setText] = useState(''); //user entered text

	//send text to event log and close popup
	const submitText = () => {
		submit(text);
		dismiss();
	}

	//clear text input
	const clearText = () => {
		setText('');
	}

	return (
		<Popup
			visible={visible}
			dismiss={dismiss}
			content={
				<View>
					<View style={textboxContainer}>
						<TextInput
							value={text}
							onChangeText={setText}
							onSubmitEditing={submitText}
							style={textbox}
							placeholder={'Type here'}
							autoFocus={true}
						/>
						<TouchableHighlight onPress={clearText} underlayColor={'transparent'} style={xButton}>
						    <Feather name={'x'} size={1.5 * em} color={'black'} />
						</TouchableHighlight>
					</View>
					<View style={{...row, width: '100%'}}>
						<TouchableHighlight underlayColor={'transparent'} onPress={dismiss} style={dialogButton}>
							<Text style={[buttonText, {color: 'black', fontWeight: null}]}>Cancel</Text>
						</TouchableHighlight>
						<TouchableHighlight underlayColor={'transparent'} onPress={submitText} style={[dialogButton]}>
							<Text style={[buttonText, {color: 'black'}]}>Submit</Text>
						</TouchableHighlight>
					</View>
				</View>
			}
		/>
	);
}

export default OptionInput;
