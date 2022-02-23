import React, {useState, useContext, useEffect} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {Feather} from '@expo/vector-icons';

import StyleContext from '../context/stylecontext';
import Popup from './popup';

//todo check position on devices of differing screen sizes for button visibility

//text input dialog
//visible: whether component should display
//submit: onPress callback
//dismiss: function to hide component
const OptionInput = ({visible, multiline, submit, dismiss}) => {
	const {em, vh, textboxContainer, textbox, buttonText, xButton, dialogButton, row} = useContext(StyleContext);
	const [text, setText] = useState(''); //user entered text

	//clear input when input switches from single to multi-line text
	useEffect(() => {
	    clearText();
	}, [multiline]);

	//send text to event log and close popup
	const submitText = () => {
		submit(text);
		dismiss();
	}

	//clear text input
	const clearText = () => {
		setText('');
	}

	const foo = (ev) => {
		console.log(ev.nativeEvent);
	}

	return (
		<Popup
			visible={visible}
			dismiss={dismiss}
			content={
				<View>
					<View style={textboxContainer}>
						<View style={{maxHeight: 30*vh}}>
							<TextInput
								value={text}
								onChangeText={setText}
								onSubmitEditing={multiline ? null : submitText}
								style={textbox}
								placeholder={'Type here'}
								multiline={multiline}
								autoFocus={true}
								onSelectionChange={foo}
							/>
						</View>
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
