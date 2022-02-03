import React, {useContext} from 'react';
import {Text, View, TouchableHighlight, FlatList} from 'react-native';
import {Feather} from "@expo/vector-icons";

import StyleContext from '../context/stylecontext';

const Option = ({name, select}) => {
	const s = useContext(StyleContext);

	return (
		<TouchableHighlight style={s.option} onPress={select}>
			<Text style={s.optionText}>{name}</Text>
		</TouchableHighlight>
	)
}

const OptionList = ({title, options, visible, dismiss, select}) => {
	const {em, ...s} = useContext(StyleContext);

	return (
		<View style={visible ? s.fullscreen : s.hidden}>
			<FlatList
				style={{width: '100%'}}
				data={options}
				renderItem={({item}) => (
					<Option name={item} select={() => {select(item); dismiss();}}/>
				)}
				keyExtractor={(name) => name}
				ListHeaderComponent={
					<TouchableHighlight onPress={dismiss}>
					    <View style={s.header}>
					        <Feather name={'chevron-left'} size={2 * em} color={'white'} />
    						<Text style={s.headerText}>{title}</Text>
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
