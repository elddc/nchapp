import React, {useContext} from 'react';
import {View, Text, FlatList} from 'react-native';

import s from '../styles/styles';
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

//each item in table
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

const Separator = () => {
	return (
		<View style={s.horiLine} />
	)
}

//full table
const EventLog = ({events}) => {
	if (events.length < 1) {
		return null;
	}

	return (
		<FlatList
			data={events}
			renderItem={({item}) => (
				<Row name={item.name} time={item.time} />
			)}
			keyExtractor={item => `${item.name} @ ${item.time}`}
			ListHeaderComponent={events.length > 0 ? Header : null}
			ItemSeparatorComponent={Separator}
			stickyHeaderIndices={[0]}
			directionalLockEnabled={true}
			style={s.eventLog}
		/>
	);
}

export default EventLog;
