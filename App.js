import React, {useState, useEffect} from 'react';
import {Text, View, TouchableHighlight, StatusBar, Alert, Platform} from 'react-native';
import {Audio} from 'expo-av';
import {Feather} from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
	const [timerActive, setTimerActive] = useState(false); //whether timer is active
	const [elaspedTime, setElapsedTime] = useState(0); //time elapsed in seconds
	const [timeInterval, setTimeInterval] = useState(); //contains timer loop

	//metronome
	const [player, setPlayer] = useState(false); //plays metronome sound
	const [metronomeActive, setMetronomeActive] = useState(false); //whether metronome is active
	const [bpm, setBpm] = useState(100); //beats per minute

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
		//Metronome: {color: '#7c933e'},
	});
	const [events, setEvents] = useState([]); //list of events that have occurred
	const [displayOptions, setDisplayOptions] = useState(false); //options to display in popup list
	const [displayInput, setDisplayInput] = useState(false); //visibility of text input
	const [displayHelp, setDisplayHelp] = useState(false); //visibility of help modal
	const [displayMetronome, setDisplayMetronome] = useState(false); //visibility of metronome bar

	//load metronome sound
	useEffect(() => {
		const sound = new Audio.Sound();
		sound.loadAsync(
			require('./assets/metronome.mp3')
		).then(() => {
			setPlayer(sound);
		});

		Audio.setAudioModeAsync({
			playsInSilentModeIOS: true
		});
	}, []);

	//set playbackspeed to match bpm
	useEffect(() => {
		if (player)
			player.setRateAsync(bpm/100, true);
	}, [bpm, player]);

	//unload metronome sound
	useEffect(() => {
		return player
			? () => {
				player.unloadAsync();
			}
			: undefined;
	}, [player]);

	const toggleMetronome = () => {
		if (metronomeActive) {
			setMetronomeActive(false);
			player.pauseAsync();
		} else {
			setMetronomeActive(true);
			player.setIsLoopingAsync(true);
			player.playAsync();
		}
	}

	//run timer interval
	useEffect(() => {
		if (timerActive) {
			let time = new Date();
			setStartTime(time);
			setTimeInterval(setInterval(() => {
				//get accurate time elapsed by comparing to start time
				setElapsedTime(Math.floor((Date.now() - time) / 1000));
			}, 250));
		}
		else {
			clearInterval(timeInterval);
			setTimeInterval(false);
		}

		return () => clearInterval(timeInterval);
	}, [timerActive]);

	//start/stop timer
	const toggleTimer = (auto = false) => {
		if (!timerActive) {
			setTimerActive(true);
			logEvent('Start');
		}
		else if (auto) {
			setTimerActive(false);
			logEvent('End');
		}
		else if (Platform.OS === 'web' && confirm('Are you sure you want to end the timer?')) {
			setTimerActive(false);
			logEvent('End');
		}
		else {
			Alert.alert(
				'Are you sure you want to end the timer?',
				'',
				[
					{
						text: 'No',
					},
					{
						text: 'Yes',
						style: 'destructive',
						onPress: () => {
							setTimerActive(false);
							logEvent('End');
						},
					},
				],
				{cancelable: true},
			)
		}
	};

	//add event to event log
	const logEvent = (name, clear = false) => {
		if (name.includes('CPR')) { //name is not always key in actions!
			//toggle CPR status
			let prevActions = {...actions};
			prevActions['CPR'] = {...actions.CPR, active: (actions.CPR.active < 1 ? 1 : 0)};
			setActions(prevActions);
		}
		else if (name === 'End') {
			//reset CPR status
			let prevActions = {...actions};
			prevActions['CPR'] = {...actions.CPR, active: -1};
			setActions(prevActions);
		}
		else if (name === 'Other') {
			//open text input
			setDisplayInput(true);
			return;
		}
		else if (actions[name] && actions[name].list) {
			//open list of options stored in actions
			setDisplayOptions({name, options: actions[name].list});
			return;
		}

		let previousEvents;
		if (name === 'Start') { //clear event log
			previousEvents = [];
		}
		else if (!timerActive) { //start code
			setTimerActive(true);
			previousEvents = [{name: 'Start', time: new Date(), index: 0}];
		}
		else {
			previousEvents = [...events];
		}

		//add new event to log
		setEvents([...previousEvents, {
			name: name,
			time: new Date(),
			index: previousEvents.length,
		}]);
	}

	return (
		<View style={s.container}>
			<StatusBar barStyle={'light-content'} />
			<TimeContext.Provider value={startTime}>
				<View style={s.main}>
					<View>
						<Timer active={timerActive} toggleTimer={toggleTimer} elaspedTime={elaspedTime} />
						<ActionButtons actions={actions} logEvent={logEvent} />
					</View>
					<EventLog events={events} short={displayMetronome} />
				</View>
			</TimeContext.Provider>
			<TouchableHighlight onPress={() => setDisplayHelp(!displayHelp)} style={[s.help, {display: displayMetronome ? 'none' : 'flex'}]}>
				<Feather name={'help-circle'} size={1.8 * em} color={'white'} />
			</TouchableHighlight>
			<TouchableHighlight onPress={() => setDisplayMetronome(!displayMetronome)} style={s.metronome}>
				<MaterialCommunityIcons name={'metronome'} size={1.8 * em} color={'white'} />
			</TouchableHighlight>
			<View style={[s.metronomeRow, {display: displayMetronome ? 'flex' : 'none'}]}>
				<TouchableHighlight onPress={() => setBpm(bpm + 4)}>
					<Feather name={'plus'} size={1.8 * em} color={'white'} />
				</TouchableHighlight>
				<TouchableHighlight onPress={() => setMetronomeActive(!metronomeActive)}>
					<Feather name={metronomeActive ? 'pause' : 'play'} size={1.8 * em} color={'white'}/>
				</TouchableHighlight>
				<TouchableHighlight onPress={() => setBpm(bpm + 4)}>
					<Feather name={'minus'} size={1.8 * em} color={'white'} />
				</TouchableHighlight>
				<Text style={{color: 'white', fontSize: 1.4*em}}>{bpm} bpm</Text>
			</View>
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
