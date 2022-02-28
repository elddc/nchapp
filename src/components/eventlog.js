import React, {useContext, useEffect, useRef} from 'react';
import {View, Text, FlatList, ScrollView, TouchableHighlight, Alert} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {saveToLibraryAsync} from 'expo-media-library';
import {captureRef} from 'react-native-view-shot';

import StyleContext from '../context/stylecontext';
import TimeContext from '../context/timecontext';
import formatTime from '../../util/formattime';

//table header
const Header = () => {
	const {tableRow, headerCell} = useContext(StyleContext);

	return (
		<View style={tableRow} key={0}>
			<Text style={headerCell}>Event</Text>
			<Text style={headerCell}>Elapsed</Text>
			<Text style={headerCell}>Time</Text>
		</View>
	);
};

//items in table
//name: name to display
//time: timestamp
const Row = ({name, time}) => {
	const {tableRow, cell} = useContext(StyleContext);
	const startTime = useContext(TimeContext);

	return (
		<View style={tableRow}>
			<Text style={cell}>{name}</Text>
			<Text style={cell}>{formatTime(time - startTime)}</Text>
			<Text style={cell}>{new Date(time).toTimeString().split(' ')[0]}</Text>
		</View>
	);
}

//line separator between items
const Separator = () => {
	const {horiLine} = useContext(StyleContext);

	return (
		<View style={horiLine} />
	)
}

//displays additional notes
const Footer = ({content}) => {
	const {text, em} = useContext(StyleContext);

	if (!content)
		return null;

	return (
		<Text style={{...text, lineHeight: 1.5*em}} dataDetectorTypes={['phoneNumber', 'link', 'address']}>
			{content ? 'Notes:\n' + content : ''}
		</Text>
	)
}

//full table
//events: data to display
//short: whether to make list height smaller to accomodate other elements
//ref: ref to flatlist, used in auto-scroll as well
const EventLog = (({events, short, notes}) => {
	const {em, eventLog} = useContext(StyleContext);
	const listRef = useRef();

	//automatically scroll to end of list after new items added
	useEffect(() => {
		const timeout = setTimeout(scrollToEnd, 30); //allow for render time
		return () => clearTimeout(timeout);
	}, [events]);

	//scroll to last item
	const scrollToEnd = () => {
		if (listRef.current)
			listRef.current.scrollToIndex({
				index: events.length - 1, //same as key
				viewPosition: 1,
			});
	}

	if (events.length < 1) { //placeholder; useful for maintaining layout in landscape
		return <ScrollView />;
	}
	return (
		<FlatList
			data={events}
			renderItem={({item}) => (
				<Row name={item.name} time={item.time} />
			)}
			keyExtractor={item => item.index}
			ListHeaderComponent={Header}
			ItemSeparatorComponent={Separator}
			ListFooterComponent={<Footer content={notes} />}
			stickyHeaderIndices={[0]}
			directionalLockEnabled={true}
			onScrollToIndexFailed={() => { //if last item not rendered
				listRef.current.scrollToEnd();
				setTimeout(scrollToEnd, 70);
			}}
			style={[eventLog, {marginBottom: short ? 2*em : null}]}
			ref={listRef}
		/>
	);
});

//fullscreen, scrollview version of EventLog
const FullscreenLog = (({events, dismiss, notes, capture}) => {
	const {em, eventLog, fullscreen, bottomLeft, ...s} = useContext(StyleContext);
	const viewShotRef = useRef();

	useEffect(() => {
		if (capture) {
			captureRef(viewShotRef.current).then(saveImage);
		}
	}, [capture]);

	const saveImage = async (uri) => {
		try {
			await saveToLibraryAsync(uri);
			Alert.alert('Image saved to camera roll');
			dismiss();
		}
		catch (err) {
			console.log(err);
			Alert.alert('Failed to save image');
		}
	}

	return (
		<View style={fullscreen}>
			<ScrollView
				directionalLockEnabled={true}
				style={{...eventLog, height: 500}}
			>
				<View ref={viewShotRef} style={{backgroundColor: 'black', flexGrow: 1}}>
					<Header/>
					{events.map((item) => {
						return (
							<View key={item.index}>
								<Separator/>
								<Row name={item.name} time={item.time}/>
							</View>
						)
					})}
					<Text style={s.text}>
						Date: {new Date(events[0].time).toLocaleDateString() + '\n'}
					</Text>
					<Footer content={notes}/>
				</View>
			</ScrollView>

			<TouchableHighlight onPress={dismiss} style={bottomLeft}>
				<MaterialCommunityIcons name='arrow-collapse' size={1.8*em} color={'white'} />
			</TouchableHighlight>
		</View>
	);
});

export default EventLog;
export {FullscreenLog};