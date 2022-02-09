import React, {useContext, useEffect, useRef, forwardRef} from 'react';
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
//name: name to display
//time: timestamp
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
//events: data to display
//short: whether to make list height smaller to accomodate other elements
const EventLog = forwardRef(({events, short}, ref) => {
	const {em, eventLog} = useContext(StyleContext);

	//automatically scroll to end of list after new items added
	useEffect(() => {
		const timeout = setTimeout(scrollToEnd, 30); //allow for render time
		return () => clearTimeout(timeout);
	}, [events]);

	//scroll to last item
	const scrollToEnd = () => {
		if (ref.current)
			ref.current.scrollToIndex({
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
			stickyHeaderIndices={[0]}
			directionalLockEnabled={true}
			onScrollToIndexFailed={() => { //if last item not rendered
				list.current.scrollToEnd();
				setTimeout(scrollToEnd, 70);
			}}
			style={[eventLog, {marginBottom: short ? 2*em : null}]}
			ref={ref}
		/>
	);
});

export default EventLog;
