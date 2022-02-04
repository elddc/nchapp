import React, {useContext} from 'react';
import {Text, View, TouchableHighlight, FlatList} from 'react-native';
import {Feather} from "@expo/vector-icons";

import StyleContext from '../context/stylecontext';

const Option = ({name, select}) => {
	const {option, optionText} = useContext(StyleContext);

	return (
		<TouchableHighlight style={option} onPress={select}>
			<Text style={optionText}>{name}</Text>
		</TouchableHighlight>
	)
}

const OptionList = ({title, options, visible, dismiss, select}) => {
	const {em, fullscreen, hidden, header, headerText} = useContext(StyleContext);

	return (
		<View style={visible ? fullscreen : hidden}>
			<FlatList
				style={{width: '100%'}}
				data={options}
				renderItem={({item}) => (
					<Option name={item} select={() => {select(item); dismiss();}}/>
				)}
				keyExtractor={(name) => name}
				ListHeaderComponent={
					<TouchableHighlight onPress={dismiss}>
					    <View style={header}>
					        <Feather name={'chevron-left'} size={2 * em} color={'white'} />
    						<Text style={headerText}>{title}</Text>
					    </View>
					</TouchableHighlight>
				}
				stickyHeaderIndices={[0]}
				directionalLockEnabled={true}
			/>
		</View>
	);
}

export default OptionList;
