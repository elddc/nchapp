import React, {useContext, useEffect, useRef} from 'react';
import {View, Text, FlatList, ScrollView} from 'react-native';

import StyleContext from '../context/stylecontext';
import TimeContext from '../context/timecontext';
import {formatMilliseconds} from '../../util/formattime';

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
}

//items in table
const Row = ({name, time}) => {
	const {tableRow, cell} = useContext(StyleContext);
	const startTime = useContext(TimeContext);

	return (
		<View style={tableRow}>
			<Text style={cell}>{name}</Text>
			<Text style={cell}>{formatMilliseconds(time - startTime)}</Text>
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

//full table
const EventLog = ({events, short}) => {
	const {em, eventLog} = useContext(StyleContext);
	const list = useRef(false); //ref to FlatList

	//automatically scroll to end of list after new item added
	useEffect(() => {
		const timeout = setTimeout(scrollToEnd, 30);
		return () => clearTimeout(timeout);
	}, [events]);

	//scroll to last item
	const scrollToEnd = () => {
		if (list.current)
			list.current.scrollToIndex({
				index: events[events.length - 1].index,
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
			stickyHeaderIndices={[0]}
			directionalLockEnabled={true}
			onScrollToIndexFailed={() => { //last item not rendered
				list.current.scrollToEnd();
				setTimeout(scrollToEnd, 70);
			}}
			style={[eventLog, {marginBottom: short ? 2*em : null}]}
			ref={list}
		/>
	);
}

export default EventLog;
