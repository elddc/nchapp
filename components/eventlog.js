import React, {useContext} from 'react';
import {View, Text, FlatList} from 'react-native';

import s from '../styles/styles';
import TimeContext from '../context/timecontext';
import {formatMilliseconds} from '../util/formattime';

//table header
const Header = () => {
	return (
		<View style={[s.row, {backgroundColor: 'black'}]} key={0}>
			<Text style={s.header}>Event</Text>
			<Text style={s.header}>Elapsed</Text>
			<Text style={s.header}>Time</Text>
		</View>
	);
}

//each item in table
const Row = ({name, time}) => {
	const startTime = useContext(TimeContext);

	return (
		<View style={s.row}>
			<Text style={s.cell}>{name}</Text>
			<Text style={s.cell}>{formatMilliseconds(time - startTime)}</Text>
			<Text style={s.cell}>{time.toTimeString().split(' ')[0]}</Text>
		</View>
	);
}

//full table
const EventLog = ({events}) => {
	return (
		<FlatList
			data={events}
			renderItem={({item}) => (
				<Row name={item.name} time={item.time}/>
			)}
      keyExtractor={item => item.time}
			ListHeaderComponent={events.length > 0 ? Header : null}
			stickyHeaderIndices={[0]}
			directionalLockEnabled={true}
			style={s.eventLog}
		/>
  );
}

export default EventLog;
