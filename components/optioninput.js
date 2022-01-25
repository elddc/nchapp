import React, {useState} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {Feather} from '@expo/vector-icons';
import s, {em} from '../styles/styles';
import Popup from './popup';

const OptionInput = ({visible, submit, dismiss}) => {
	const [text, setText] = useState('');

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
					<View style={s.textboxContainer}>
						<TextInput
							value={text}
							onChangeText={setText}
							onSubmitEditing={submitText}
							style={s.textbox}
							placeholder={'Type here'}
						/>
						<TouchableHighlight onPress={clearText} style={s.xButton}>
						    <Feather name={'x'} size={1.5 * em} color={'black'} />
						</TouchableHighlight>
					</View>
					<View style={[s.row, {width: '100%'}]}>
						<TouchableHighlight underlayColor={'transparent'} onPress={dismiss} style={s.dialogButton}>
							<Text style={[s.buttonText, {color: 'black', fontWeight: null}]}>Cancel</Text>
						</TouchableHighlight>
						<TouchableHighlight underlayColor={'transparent'} onPress={submitText} style={[s.dialogButton]}>
							<Text style={[s.buttonText, {color: 'black'}]}>Submit</Text>
						</TouchableHighlight>
					</View>
				</View>
			}
		/>
	);
}

export default OptionInput;
