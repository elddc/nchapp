import React, {useState, useContext} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {Feather} from '@expo/vector-icons';

import StyleContext from '../context/stylecontext';
import Popup from './popup';

//text input dialog
	//visible: whether component should display
	//submit: onPress callback
	//dismiss: function to hide component
const OptionInput = ({visible, multiline, submit, dismiss}) => {
	const {landscape, em, vh, vw, textboxContainer, textbox, buttonText, xButton, dialogButton, row} = useContext(StyleContext);
	const [singleText, setSingleText] = useState(''); //user entered text, single line
	const [multiText, setMultiText] = useState(''); //user entered text, multi line

	//send text to event log and close popup
	const submitText = () => {
		submit(multiline ? multiText : singleText, true);
		dismiss();
	}

	//clear text input
	const clearText = () => {
		if (multiline)
			setMultiText('');
		else
			setSingleText('')
	}

	return (
		<Popup
			visible={visible}
			dismiss={dismiss}
			content={
				<View>
					<View style={textboxContainer}>
						<View style={{maxHeight: landscape? 20*vw : 30*vh}}>
							{multiline ? (
								<TextInput
									value={multiText}
									onChangeText={setMultiText}
									multiline={multiline}
									style={textbox}
									placeholder={'Type here'}
									autoFocus={true}
								/>
							) : (
								<TextInput
									value={singleText}
									onChangeText={setSingleText}
									onSubmitEditing={submitText}
									style={textbox}
									placeholder={'Type here'}
									autoFocus={true}
								/>
							)}
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
