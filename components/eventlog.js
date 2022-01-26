import React, {useContext, useEffect, useRef} from 'react';
import {View, Text, FlatList, ScrollView} from 'react-native';

import s, {em} from '../styles/styles';
import TimeContext from '../context/timecontext';
import {formatMilliseconds} from '../util/formattime';

//table header
const Header = () => {
	return (
		<View style={[s.tableRow]} key={0}>
			<Text style={s.headerCell}>Event</Text>
			<Text style={s.headerCell}>Elapsed</Text>
			<Text style={s.headerCell}>Time</Text>
		</View>
	);
}

//items in table
const Row = ({name, time}) => {
	const startTime = useContext(TimeContext);

	return (
		<View style={s.tableRow}>
			<Text style={s.cell}>{name}</Text>
			<Text style={s.cell}>{formatMilliseconds(time - startTime)}</Text>
			<Text style={s.cell}>{time.toTimeString().split(' ')[0]}</Text>
		</View>
	);
}

//line separator between items
const Separator = () => {
	return (
		<View style={s.horiLine} />
	)
}

//full table
const EventLog = ({events, short}) => {
	const list = useRef(false); //ref to FlatList

	//automatically scroll to end of list after new item added
	useEffect(() => {
		const timeout = setTimeout(scrollToEnd, 50);
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
			style={[s.eventLog, {marginBottom: short ? 2*em : null}]}
			ref={list}
		/>
	);
}

export default EventLog;
