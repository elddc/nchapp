import React, {useContext, useEffect, useRef} from 'react';
import {View, Text, FlatList, ScrollView} from 'react-native';

import StyleContext from '../context/stylecontext';
import TimeContext from '../context/timecontext';
import formatTime from '../../util/formattime';

//table header
const Header = React.memo(() => {
	console.log('render')
	const {tableRow, headerCell} = useContext(StyleContext);

	return (
		<View style={tableRow} key={0}>
			<Text style={headerCell}>Event</Text>
			<Text style={headerCell}>Elapsed</Text>
			<Text style={headerCell}>Time</Text>
		</View>
	);
});

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
			<Text style={cell}>{time.toTimeString().split(' ')[0]}</Text>
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
		<View style={{paddingBottom: 2*em}}>
			<Text style={text} dataDetectorTypes={['phoneNumber', 'link', 'address']}>
				{content}
			</Text>
		</View>
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

	useEffect(() => {
		if (listRef.current)
		listRef.current.scrollToEnd();
	}, [notes]);

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
				ref.current.scrollToEnd();
				setTimeout(scrollToEnd, 70);
			}}
			style={[eventLog, {marginBottom: short ? 2*em : null}]}
			ref={listRef}
		/>
	);
});

//fullscreen, scrollview version of EventLog
const FullscreenLog = (({events, visible, notes}) => {
	const {em, eventLog} = useContext(StyleContext);

	return (
		<ScrollView
			ListHeaderComponent={Header}
			ItemSeparatorComponent={Separator}
			ListFooterComponent={<Footer content={notes} />}
			stickyHeaderIndices={[0]}
			directionalLockEnabled={true}
			style={[eventLog, {
				position: 'absolute',
				top: 0,
				left: 0,
			}]}
		>
			{events.map((item) => (<Row name={item.name} time={item.time} key={item.index} />))}
		</ScrollView>
	);
});

export default EventLog;
export {FullscreenLog};