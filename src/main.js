import React, {useState, useEffect, useContext, useCallback} from 'react';
import {Text, View, TouchableHighlight, StatusBar, Alert, Platform} from 'react-native';
import {debounce} from 'debounce';
import {useKeepAwake} from 'expo-keep-awake';
import {usePermissions} from 'expo-media-library';
import {Audio} from 'expo-av';
import {Feather} from '@expo/vector-icons';
import {MaterialCommunityIcons} from '@expo/vector-icons';

import TimeContext from './context/timecontext';
import StyleContext from './context/stylecontext';

import Timer from './components/timer';
import EventLog, {FullscreenLog} from './components/eventlog';
import OptionList from './components/optionlist';
import OptionInput from './components/optioninput';
import Help from './components/help';
import ActionButtons from './components/actionbuttons';

//core app
const Main = () => {
    useKeepAwake(); //prevent device from sleeping
    const [permissions, requestPermissions] = usePermissions(); //access to camera roll (for saving image of log)

    //styles
    const {landscape, em, vh, container, main, bottomRight, bottomLeft, metronomeRow} = useContext(StyleContext);

    //timer
    const [startTime, setStartTime] = useState(); //timestamp
    const [timerActive, setTimerActive] = useState(false); //whether timer is active
    const [elaspedTime, setElapsedTime] = useState(0); //time elapsed in seconds
    const [timeInterval, setTimeInterval] = useState(); //contains timer loop

    //metronome
    const [player, setPlayer] = useState(); //plays metronome sound
    const [metronomeActive, setMetronomeActive] = useState(false); //whether metronome is active
    const [bpm, setBpm] = useState(100); //beats per minute

    //display
    const [actions, setActions] = useState({ //data for input buttons
        CPR: {color: '#114985', active: -1}, //[-1, 0, 1]: start, pause, restart
        Shock: {color: '#e06924'},
        Epinephrine: {color: '#cca300'},
        Medication: {color: '#898989', list: ['Vasopressin', 'Amiodarone', 'Lidocaine', 'Magnesium Sulfate', 'Other']},
        Rhythm: {color: '#208552', list: ['PEA', 'VT/vfib', 'Asystole']},
        Event: {color: '#5548ab', list: [
                'Oxygen', 'IV access', 'IO access', 'Advanced airway: Supraglottic airway',
                'Advanced airway: Endotracheal intubation', 'Waveform capnography', 'OPA (oropharyngeal airway)',
                'NPA (nasopharyngeal airway)', 'Backboard', 'Defibrillator: Pads applied', 'Other'
            ]},
        ROSC: {color: '#784124'},
        Other: {enterText: true},
    });
    const [events, setEvents] = useState([]); //list of events that have occurred
    const [displayOptions, setDisplayOptions] = useState(false); //options to display in fullscreen popup list
    const [displayInput, setDisplayInput] = useState(false); //visibility of text input
    const [displayHelp, setDisplayHelp] = useState(false); //visibility of help modal
    const [displayMetronome, setDisplayMetronome] = useState(false); //visibility of metronome bar

    //end screen
    const [endScreen, setEndScreen] = useState(false); //end status
    const [endActions, setEndActions] = useState({ //data for input buttons on end screen
        Notes: {color: '#6148b1'},
        Save: {color: '#239946'},
        Resume: {color: '#174b9e'},
        Clear: {color: '#dc2c1f'},
    });
    const [multilineInput, setMultilineInput] = useState(false); //whether text input is multiline
    const [notes, setNotes] = useState(false); //user input text (notes)
    const [fullscreenLogStatus, setFullscreenLogStatus] = useState(0); //fullscreen mode [0, 1, 2]: hidden, visible, screenshot


    /* metronome -------------------------------------------------- */

    //load metronome sound
    useEffect(() => {
        Audio.Sound.createAsync(require('./assets/metronome.mp3'), {
            isLooping: true,
            shouldCorrectPitch: true,
            pitchCorrectionQuality: Audio.PitchCorrectionQuality.Medium,
        }).then(({sound}) => {
            setPlayer(sound);
        });

        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true
        });
    }, []);

    //toggle metronome sound
    useEffect(() => {
        if (player) {
            if (endScreen) //pause on endscreen; allows for automatic resume
                player.pauseAsync();
            else if (metronomeActive)
                player.playAsync();
            else
                player.pauseAsync();
        }
    }, [metronomeActive, player, endScreen]);

    //cleanup
    useEffect(() => {
        return player
            ? () => {
                player.pauseAsync();
            }
            : undefined;
    }, [player]);

    //handle bpm changes
    useEffect(() => {
        if (player) {
            debouncedPauseMetronome(); //pause player after first bpm change
            debouncedChangeBpm(bpm/100); //set playback rate after last change
        }
    }, [bpm]);

    //temporarily pause player (does not update metronomeActive)
    const debouncedPauseMetronome = useCallback(debounce(() => {
        if (player)
            player.pauseAsync();
    }, 200, true), [player]);

    //change playback rate to match bpm then resume metronome
        //rate: new playback rate; passed as param to avoid bpm dependency interfering with debounce
    const debouncedChangeBpm = useCallback(debounce(async (rate) => {
        if (player) {
            await player.setStatusAsync({rate});
            if (metronomeActive)
                player.playAsync();
        }
    }, 200), [player, metronomeActive]);


    /* timer -------------------------------------------------- */

    //start or resume timer
    const startTimer = (resume = false) => {
        let start = resume ? startTime : Date.now();

        setTimerActive(true);
        setStartTime(start);

        setTimeInterval(setInterval(() => {
            //get accurate time elapsed by comparing to start time
            setElapsedTime(Date.now() - start);
        }, 250));
    }

    //ends timer and opens end screen
    const endTimer = () => {
        setTimerActive(false);
        clearInterval(timeInterval);

        setEndScreen(true);
        setMultilineInput(true);
    }

    //start/stop timer
        //auto: skip confirmation dialog
    const toggleTimer = (auto = false) => {
        if (!timerActive) {
            logEvent('Start');
        }
        else if (auto || (Platform.OS === 'web' && confirm('Are you sure you want to end the timer?'))) {
            logEvent('End');
        }
        else {
            Alert.alert(
                'Are you sure you want to end the timer?',
                'You cannot undo this action!',
                [
                    {text: 'No'},
                    {text: 'Yes', style: 'destructive', onPress: () => {logEvent('End')}},
                ],
                {cancelable: true},
            )
        }
    };

    /* event log -------------------------------------------------- */

    //add event to event log
        //name: name of event
        //input: if user input text
    const logEvent = (name, input = false) => {
        //end screen only ----------
        if (endScreen) {
            //set notes
            if (input) {
                setNotes(name);
                return;
            }

            //button actions
            switch (name) {
                case 'Save': //save image of event log
                    if (Platform.OS === 'web') {
                        alert('This feature is not available on web');
                    }

                    //must have camera roll permissions
                    if (permissions.granted)
                        setFullscreenLogStatus(2); //take screenshot
                    else
                        requestPermissions().then(({granted}) => {
                            if (granted)
                                setFullscreenLogStatus(2);
                            else //permissions not granted
                                Alert.alert(
                                    'Cannot save image',
                                    'Please allow camera roll permissions',
                                    [
                                        {text: 'Cancel', style: 'destructive'},
                                        {text: 'Try Again', onPress: () => {logEvent('Save')}}
                                    ]
                                )
                        });
                    break;

                case 'Resume': //resume timer, keeping events
                    //resetting variables
                    setEvents(events.slice(0, events.length - 1)); //remove "End" event
                    setEndScreen(false);
                    setMultilineInput(false);

                    startTimer(true);
                    break;

                case 'Clear': //restart timer, clearing events
                    //reset CPR status
                    let prevActions = {...actions};
                    prevActions['CPR'] = {...actions.CPR, active: -1};
                    setActions(prevActions);

                    //reset other items
                    setNotes(false);
                    setMultilineInput(false);
                    setEvents([]);
                    setElapsedTime(0);
                    setDisplayMetronome(false);
                    setMetronomeActive(false);
                    setEndScreen(false);

                    break;

                case 'Notes': //open text input
                    setDisplayInput(true);
                    break;

                default: //catch
                   console.log(name + ' is not an option');
            }

            return;
        }

        //main screen ----------

        //handle special events
        if (!input) {
            if (name.includes('CPR')) {
                //toggle CPR status
                let prevActions = {...actions};
                prevActions['CPR'] = {...actions.CPR, active: (actions.CPR.active < 1 ? 1 : 0)};
                setActions(prevActions);
            }
            else if (name === 'End') {
                //stop timer
                endTimer();
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
        }

        //get event log
        let previousEvents;
        if (!timerActive) {
            //start code
            startTimer();
            previousEvents = (name === 'Start') ? [] : [{name: 'Start', time: Date.now(), index: 0}];
        }
        else {
            previousEvents = [...events];
        }

        //add new event to log
        setEvents([...previousEvents, {
            name: name,
            time: Date.now(),
            index: previousEvents.length, //used as key in flatlist
        }]);
    }

    return (
        <View style={container}>
            <StatusBar barStyle={'light-content'} />
            <TimeContext.Provider value={startTime}>
                <View style={main}>
                    <View style={{marginRight: landscape ? 2*vh : null}}>
                        <Timer active={timerActive} toggleTimer={endScreen ? null : toggleTimer} elaspedTime={elaspedTime} />
                        <ActionButtons actions={(endScreen) ? endActions : actions} logEvent={logEvent} />
                    </View>
                    <EventLog events={events} short={displayMetronome} notes={notes} />
                </View>

                <TouchableHighlight onPress={() => setDisplayHelp(!displayHelp)} style={bottomRight}>
                    <Feather name={'help-circle'} size={1.8*em} color={'white'} />
                </TouchableHighlight>

                <TouchableHighlight onPress={() => setFullscreenLogStatus(true)} style={{
                    ...bottomLeft,
                    display: (endScreen) ? 'flex' : 'none',
                    position: (endScreen) ? 'absolute' : 'relative',
                }}>
                    <MaterialCommunityIcons name='arrow-expand' size={1.8*em} color={'white'} />
                </TouchableHighlight>

                <TouchableHighlight onPress={() => setDisplayMetronome(!displayMetronome)} style={{
                    ...bottomLeft,
                    display: (!endScreen) ? 'flex' : 'none',
                    position: (!endScreen) ? 'absolute' : 'relative',
                }}>
                    <MaterialCommunityIcons name={'metronome'} size={1.8*em} color={'white'} />
                </TouchableHighlight>
                <View style={{
                    ...metronomeRow,
                    display: displayMetronome && !endScreen ? 'flex' : 'none',
                    position: displayMetronome && !endScreen ? 'absolute' : 'relative',
                }}>
                    <TouchableHighlight onPress={() => setBpm(bpm + 4)}>
                        <Feather name={'plus'} size={1.8*em} color={'white'} />
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => setMetronomeActive(!metronomeActive)}>
                        <Feather name={metronomeActive ? 'pause' : 'play'} size={1.8*em} color={'white'}/>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => setBpm(bpm - 4)}>
                        <Feather name={'minus'} size={1.8*em} color={'white'} />
                    </TouchableHighlight>
                    <Text style={{color: 'white', fontSize: 1.4*em}}>{bpm} bpm</Text>
                </View>

                <OptionList
                    title={displayOptions.name}
                    options={displayOptions.options}
                    dismiss={() => setDisplayOptions(false)}
                    select={logEvent}
                />
                <OptionInput
                    visible={displayInput}
                    multiline={multilineInput}
                    submit={logEvent}
                    dismiss={() => setDisplayInput(false)}
                />

                <Help visible={displayHelp} dismiss={() => {setDisplayHelp(false)}} />

                {(fullscreenLogStatus !== 0) ? (
                    <FullscreenLog
                        events={events}
                        notes={notes}
                        dismiss={() => setFullscreenLogStatus(0)}
                        capture={fullscreenLogStatus === 2}
                    />
                ) : null}

            </TimeContext.Provider>
        </View>
    );
}

export default Main;