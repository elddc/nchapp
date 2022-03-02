import React, {useState, useEffect, useContext, useRef, useCallback} from 'react';
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
    //prevent device from sleeping
    useKeepAwake();

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
            ],},
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
    const [multilineInput, setMultilineInput] = useState(false);
    const [notes, setNotes] = useState(false);
    const [fullscreenLogStatus, setFullscreenLogStatus] = useState(0); //[0, 1, 2]: hidden, visible, screenshot
    const [permissions, requestPermissions] = usePermissions();

    /* metronome */

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
            if (metronomeActive)
                player.playAsync();
            else
                player.pauseAsync();
        }
    }, [metronomeActive, player]);

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

    //change playback rate to match bpm, resume metronome
    //rate: new playback rate; passed as param to avoid bpm dependency interfering with debounce
    const debouncedChangeBpm = useCallback(debounce(async (rate) => {
        if (player) {
            await player.setStatusAsync({rate});
            if (metronomeActive)
                player.playAsync();
        }
    }, 200), [player, metronomeActive]);

    /* timer */

    //start timer, optionally w/ elapsed time
    const startTimer = (elapsed = 0) => {
        let time = Date.now() - elapsed;

        setTimerActive(true);
        setStartTime(time);
        setEndScreen(false);
        setNotes(false);
        setMultilineInput(false);
        setTimeInterval(setInterval(() => {
            //get accurate time elapsed by comparing to start time
            setElapsedTime(Date.now() - time);
        }, 250));
    }

    const endTimer = () => {
        setTimerActive(false);
        clearInterval(timeInterval);
        setEndScreen(true);
        setMultilineInput(true);
    }

    //start/stop timer
    const toggleTimer = (auto = false) => {
        if (!timerActive) {
            logEvent('Start');
        }
        else if (auto) { //skip confirm dialog
            logEvent('End');
        }
        else if (Platform.OS === 'web' && confirm('Are you sure you want to end the timer?')) {
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

    /* event log */

    //add event to event log
    //todo make second param for text input
    const logEvent = async (name) => {
        if (endScreen) {
            switch (name) {
                case 'Save':
                    if (permissions.granted)
                        setFullscreenLogStatus(2);
                    else {
                        const {granted} = await requestPermissions();

                        if (granted)
                            setFullscreenLogStatus(2);
                        else
                            Alert.alert(
                                'Cannot save image',
                                'Please allow camera roll permissions',
                                [
                                    {text: 'Cancel', style: 'destructive'},
                                    {text: 'Try Again', onPress: () => {logEvent('Save')}}
                                ]
                            )
                    }
                    break;
                case 'Resume':
                    setEvents(events.slice(0, events.length - 1));
                    startTimer(elaspedTime);
                    break;
                case 'Clear':
                    //reset CPR status
                    let prevActions = {...actions};
                    prevActions['CPR'] = {...actions.CPR, active: -1};
                    setActions(prevActions);

                    //reset other items
                    setNotes(false);
                    setEvents([]);
                    setElapsedTime(0);

                    setEndScreen(false);
                    break;
                case 'Notes':
                    setDisplayInput(true);
                    break;
                default:
                   setNotes(name);
            }

            return;
        }

        //handle special events
        if (name.includes('CPR')) { //name is not always key in actions!
            //toggle CPR status
            let prevActions = {...actions};
            prevActions['CPR'] = {...actions.CPR, active: (actions.CPR.active < 1 ? 1 : 0)};
            setActions(prevActions);
        }
        else if (name === 'End') {
            //turn off metronome
            setDisplayMetronome(false);
            setMetronomeActive(false);

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

        //get event log
        let previousEvents;
        if (!timerActive) { //start code
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

    //save image of event log
    const saveLog = async () => {
       /* todo
       try {
            const uri = await captureRef(eventLogRef.current);
            await saveToLibraryAsync(uri);
            Alert.alert('Image saved to camera roll');
        }
        catch (err) {console.log(err)}
        */
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
                    display: displayMetronome ? 'flex' : 'none',
                    position: displayMetronome ? 'absolute' : 'relative',
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
                    visible={displayOptions}
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