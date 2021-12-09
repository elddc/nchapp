import React, {useState, useEffect} from 'react';
import {Text, View, TouchableHighlight, Alert, Platform} from 'react-native';
import {Feather} from '@expo/vector-icons';

import s, {em} from './styles/styles';
import TimeContext from './context/timecontext';

import Timer from './components/timer';
import EventLog from './components/eventlog';
import OptionList from './components/optionlist';
import Help from './components/help';

const App = () => {
	//timer
	const [startTime, setStartTime] = useState();
	const [active, setActive] = useState(false);
	const [elaspedTime, setElapsedTime] = useState(0); //time in seconds
	const [timeInterval, setTimeInterval] = useState(); //contains timer loop

	//display
	const [actions, setActions] = useState({ //inputs
		CPR: {color: '#114985', timer: true, active: -1}, //start, pause, restart
		Shock: {color: '#e06924', timer: true, count: 0},
		Epinephrine: {color: '#cca300', count: 0},
		Medication: {color: '#898989', list: ['Vasopressin', 'Amiodarone', 'Lidocaine', 'Magnesium Sulfate', 'Other']},
		Rhythm: {color: '#208552', list: ['VT', 'Pulseless VT', 'PEA', 'Asystole', 'Other']},
		Event: {color: '#5548AB', list: [
			'Oxygen', 'IV access', 'IO access', 'Advanced airway: Supraglottic airway', 'Advanced airway: Endotracheal intubation',
			'Waveform capnography', 'OPA (oropharyngeal airway)', 'NPA (nasopharyngeal airway)', 'Backboard', 'Defibrillator: Pads applied',
		],},
		ROSC: {color: '#784124'},
		Other: {enterText: true},
	});
	const [events, setEvents] = useState([]); //list of events that have occurred
	const [displayOptions, setDisplayOptions] = useState(false)
	const [displayHelp, setDisplayHelp] = useState(false); //visibility of help modal

	//note: this will not handle pausing because it is not needed in the final use case
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

	const toggleTimer = () => {
		if (!active) {
			setActive(true);
			logEvent('Start');
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
			setActions({...actions, CPR: {...actions.CPR, active: (actions.CPR.active < 1 ? 1 : 0)}})
		}
		else if (name === 'End') {
			setActions({...actions, CPR: {...actions.CPR, active: -1}})
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
						<View style={s.wrapRow}>
							{Object.keys(actions).map((name) => {
								const {color, active} = actions[name];

								switch (active) {
									case -1:
										name = 'Start CPR';
										break;
									case 0:
										name = 'Restart CPR';
										break;
									case 1:
										name = 'Pause CPR';
										break;
								}

								return (
									<TouchableHighlight
										style={[s.actionButton, {backgroundColor: (active > 0) ? '#269399' : color}]}
										onPress={() => logEvent(name)}
										key={name}
									>
										<Text style={s.buttonText}>{name}</Text>
									</TouchableHighlight>
								);
							})}
						</View>
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
				dismiss={() => {
					setDisplayOptions(false)
				}}
				select={logEvent}
			/>
			<Help visible={displayHelp} dismiss={() => {
				setDisplayHelp(false)
			}} />
		</View>
	);
}

export default App;
