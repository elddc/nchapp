import React, {useState} from 'react';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import s, {em} from '../styles/styles';
import Popup from './popup'

const OptionInput = ({visible, submit, dismiss}) => {
	const [text, setText] = useState('');

	const submitText = () => {
		submit(text);
		dismiss();
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
                            onEndEditing={submitText}
                            style={s.textbox}
                            placeholder={'Type here'}
                        />
			        </View>
					<View style={[s.row, {width: '100%', }]}>
						<TouchableHighlight underlayColor={'transparent'} onPress={dismiss} style={s.actionButton}>
							<Text style={[s.buttonText, {color: 'black', fontWeight: null}]}>Cancel</Text>
						</TouchableHighlight>
						<TouchableHighlight underlayColor={'transparent'} onPress={submitText} style={[s.actionButton]}>
							<Text style={[s.buttonText, {color: 'black'}]}>Submit</Text>
						</TouchableHighlight>
					</View>
				</View>
			}
		/>
	);
}

export default OptionInput;
