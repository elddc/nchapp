import React, {useState, useEffect} from 'react';
import {Text, View, TouchableHighlight, Alert, Platform} from 'react-native';
import {Feather} from '@expo/vector-icons';

import s, {em} from './styles/styles';
import TimeContext from './context/timecontext';

import Timer from './components/timer';
import EventLog from './components/eventlog';
import OptionList from './components/optionlist';
import OptionInput from './components/optioninput';
import Help from './components/help';
import ActionButtons from './components/actionbuttons';

const App = () => {
	//timer
	const [startTime, setStartTime] = useState(); //timestamp
	const [active, setActive] = useState(false); //whether timer is active
	const [elaspedTime, setElapsedTime] = useState(0); //time elapsed in seconds
	const [timeInterval, setTimeInterval] = useState(); //contains timer loop

	//display
	const [actions, setActions] = useState({ //data for input buttons
		CPR: {color: '#114985', timer: true, active: -1}, //start, pause, restart
		Shock: {color: '#e06924', timer: true, count: 0},
		Epinephrine: {color: '#cca300', count: 0},
		Medication: {color: '#898989', list: ['Vasopressin', 'Amiodarone', 'Lidocaine', 'Magnesium Sulfate', 'Other']},
		Rhythm: {color: '#208552', list: ['VT', 'Pulseless VT', 'PEA', 'Asystole', 'Other']},
		Event: {color: '#5548AB', list: [
			'Oxygen', 'IV access', 'IO access', 'Advanced airway: Supraglottic airway',
			'Advanced airway: Endotracheal intubation', 'Waveform capnography', 'OPA (oropharyngeal airway)',
				'NPA (nasopharyngeal airway)', 'Backboard', 'Defibrillator: Pads applied', 'Other'
		],},
		ROSC: {color: '#784124'},
		Other: {enterText: true},
	});
	const [events, setEvents] = useState([]); //list of events that have occurred
	const [displayOptions, setDisplayOptions] = useState(false); //options to display in popup list
	const [displayInput, setDisplayInput] = useState(false); //visibility of text input
	const [displayHelp, setDisplayHelp] = useState(false); //visibility of help modal

	useEffect(() => {
		if (active) {
			let time = new Date();
			setStartTime(time);
			setTimeInterval(setInterval(() => {
				setElapsedTime(Math.floor((Date.now() - time) / 1000));
			}, 250));
		}
		else {
			clearInterval(timeInterval);
			setTimeInterval(false);
		}

		return () => clearInterval(timeInterval);
	}, [active]);

	const toggleTimer = (auto = false) => {
		if (!active) {
			setActive(true);
			logEvent('Start');
		}
		else if (auto) {
			setActive(false);
			logEvent('End');
		}
		else if (Platform.OS === 'web' && confirm('Are you sure you want to end the timer?')) {
			setActive(false);
			logEvent('End');
		}
		else {
			Alert.alert(
				'Are you sure you want to end the timer?',
				'',
				[
					{
						text: 'No',
						style: 'destructive',
					},
					{
						text: 'Yes',
						onPress: () => {
							setActive(false);
							logEvent('End');
						},
					},
				],
				{cancelable: true},
			)
		}
	};

	//add event to event log
	//note: name is not always key in actions!
	const logEvent = (name) => {
		if (name.includes('CPR')) {
			let prevActions = {...actions};
			prevActions['CPR'] = {...actions.CPR, active: (actions.CPR.active < 1 ? 1 : 0)};
			setActions(prevActions);
		}
		else if (name === 'End') {
			let prevActions = {...actions};
			prevActions['CPR'] = {...actions.CPR, active: -1};
			setActions(prevActions);
		}
		else if (name === 'Other') {
			setDisplayInput(true);
			return;
		}
		else if (actions[name] && actions[name].list) {
			openOptionList(name);
			return;
		}

		let previousEvents = (name === 'Start') ? [] : [...events];

		if (!active && name !== 'Start') {
			toggleTimer();
			previousEvents = [{name: 'Start', time: new Date()}];
		}

		setEvents([...previousEvents, {
			name: name,
			time: new Date(),
		}]);
	}

	const openOptionList = (name) => {
		setDisplayOptions({name, options: actions[name].list});
	}

	return (
		<View style={s.container}>
			<TimeContext.Provider value={startTime}>
				<View style={s.main}>
					<View>
						<Timer active={active} toggleTimer={toggleTimer} elaspedTime={elaspedTime} />
						<ActionButtons actions={actions} logEvent={logEvent} />
					</View>
					<EventLog events={events} />
				</View>
			</TimeContext.Provider>
			<TouchableHighlight onPress={() => {
				setDisplayHelp(!displayHelp)
			}} style={s.help}>
				<Feather name={'help-circle'} size={1.8 * em} color={'white'} />
			</TouchableHighlight>
			<OptionList
				title={displayOptions.name}
				options={displayOptions.options}
				visible={displayOptions}
				dismiss={() => setDisplayOptions(false)}
				select={logEvent}
			/>
			<OptionInput visible={displayInput} submit={logEvent} dismiss={() => setDisplayInput(false)} />
			<Help visible={displayHelp} dismiss={() => {setDisplayHelp(false)}} />
		</View>
	);
}

export default App;
