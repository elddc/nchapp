import React, {useContext, useEffect, useRef, useState} from 'react';
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
	//time: timestamp in ms
const Row = ({name, time, fitWidth}) => {
	const {tableRow, cell, horiLine} = useContext(StyleContext);
	const startTime = useContext(TimeContext);

	return (
		<View style={fitWidth ? {...tableRow, width: horiLine.width} : tableRow}>
			<Text style={cell}>{name}</Text>
			<Text style={cell}>{formatTime(time - startTime)}</Text>
			<Text style={cell}>{new Date(time).toTimeString().split(' ')[0]}</Text>
		</View>
	);
}

//line separator between items
const Separator = () => {
	const {horiLine} = useContext(StyleContext);

	return (<View style={horiLine} />);
}

//displays additional notes
	//content: optional text to display under "notes"
	//date: optional Date object to display
const Footer = ({content, date}) => {
	const {em, text, horiLine} = useContext(StyleContext);

	return (
		<View style={{width: horiLine.width, alignSelf: date ? 'center' : null}}>
			{date ? (
				<Text style={text}>Date: {date.toLocaleDateString() + '\n'}</Text>
			) : null}

			{content ? (
				<Text style={{...text, lineHeight: 1.5 * em}} dataDetectorTypes={['phoneNumber', 'link', 'address']}>
					{content ? ('Notes:\n' + content) : ''}
				</Text>
			) : null}
		</View>
	);
}

//full table
	//events: data to display
	//short: whether to make list height smaller to accomodate other elements
	//notes: optional text to display at bottom
const EventLog = (({events, short, notes}) => {
	const {em, eventLog} = useContext(StyleContext);
	const listRef = useRef();

	//automatically scroll to end of list after new items added
	useEffect(() => {
		const timeout = setTimeout(scrollToEnd, 30); //allow for render time
		return () => clearTimeout(timeout); //cleanup
	}, [events]);

	//scroll to last item
	const scrollToEnd = () => {
		//uses scrollToIndex over scrollToEnd for accuracy
		//(variable height of items means getItemLayout cannot be used)
		//see onScrollToIndexFailed for handling items outside the render window
		if (listRef.current)
			listRef.current.scrollToIndex({
				index: events.length - 1, //same as key
				viewPosition: 1, //item at bottom
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

//fullscreen, scrollview, screenshot-capable version of EventLog (does not have auto-scroll)
	//events: data to display
	//dismiss: function to hide screen
	//notes: optional text to display at bottom
	//capture: whether to take screenshow
const FullscreenLog = (({events, dismiss, notes, capture}) => {
	const {em, eventLog, fullscreen, bottomLeft} = useContext(StyleContext);
	const viewShotRef = useRef();
	const [flash, setFlash] = useState(null);

	//take screenshot
	useEffect(() => {
		if (capture) {
			captureRef(viewShotRef.current).then(saveImage);
		}
	}, [capture]);

	//hide screen and display alert
	useEffect(() => {
		const dismissFlash = async () => {
			//flash animation
			await wait(180);
			setFlash(null);
			dismiss();
			await wait(120);

			Alert.alert('Image saved to camera roll', '', [{
				name: 'OK',
			}]);
		}

		if (flash)
			dismissFlash();
	}, [flash]);

	//save screenshot to camera roll and display flash
	const saveImage = async (uri) => {
		try {
			await saveToLibraryAsync(uri);
			await wait(10);
			setFlash(<View style={{...fullscreen, backgroundColor: 'white'}} />);
		}
		catch (err) {
			console.log(err);
			Alert.alert('Failed to save image', 'Please try again');
		}
	}

	//sleep for ms
	const wait = (ms) => {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	return (
		<View style={fullscreen}>
			<ScrollView
				directionalLockEnabled={true}
				style={eventLog}
			>
				<View ref={viewShotRef} style={{backgroundColor: 'black', alignSelf: 'center', paddingVertical: em}}>
					<Header/>
					{events.map((item) => {
						return (
							<View key={item.index}>
								<Separator />
								<Row name={item.name} time={item.time} fitWidth={true} />
							</View>
						)
					})}
					<Footer content={notes} date={new Date(events[0].time)} />
				</View>
			</ScrollView>

			<TouchableHighlight onPress={dismiss} style={bottomLeft}>
				<MaterialCommunityIcons name='arrow-collapse' size={1.8*em} color={'white'} />
			</TouchableHighlight>

			{flash}
		</View>
	);
});

export default EventLog;
export {FullscreenLog};