import React, {useState, useEffect, useContext, useRef, useCallback} from 'react';
import {Text, View, TouchableHighlight, StatusBar, Alert, Platform} from 'react-native';
import {debounce} from 'debounce';
import {ViewShot} from 'react-native-view-shot';
import {useKeepAwake} from 'expo-keep-awake';
import {Audio} from 'expo-av';
import {saveToLibraryAsync} from 'expo-media-library';
import {Feather} from '@expo/vector-icons';
import {MaterialCommunityIcons} from '@expo/vector-icons';

import TimeContext from './context/timecontext';
import StyleContext from './context/stylecontext';

import Timer from './components/timer';
import EventLog from './components/eventlog';
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
        CPR: {color: '#114985', active: -1}, //(-1, 1): start, pause, restart
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
        'Add Notes': {color: '#5548ab'},
        Save: {color: '#189d42'},
        Resume: {color: '#114985'},
        New: {color: '#de1245'}
    });

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

    //run timer
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
            if (events.length > 1)
                setEndScreen(true);
        }

        return () => { clearInterval(timeInterval) }
    }, [timerActive]);

    //start/stop timer
    const toggleTimer = (auto = false) => {
        if (!timerActive) {
            setTimerActive(true);
            logEvent('Start');
        }
        else if (auto) { //skip confirm dialog
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
                'You cannot undo this action!',
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
    const logEvent = (name) => {
        if (endScreen) {
            switch (name) {
                case 'Save':
                    break;
                case 'Resume':
                    break;
                case 'Start':
                    break;
                case 'Fullscreen':
                    break;
                default:
                    console.log(name);
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
            //reset CPR status
            let prevActions = {...actions};
            prevActions['CPR'] = {...actions.CPR, active: -1};
            setActions(prevActions);

            //turn off metronome
            setDisplayMetronome(false);
            setMetronomeActive(false);
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
        catch (err) {console.log(err)}*/
    }

    return (
        <View style={container}>
            <StatusBar barStyle={'light-content'} />

            <TimeContext.Provider value={startTime}>
                <View style={main}>
                    <View style={{marginRight: landscape ? 2*vh : null}}>
                        <Timer active={timerActive} toggleTimer={toggleTimer} elaspedTime={elaspedTime} />
                        <ActionButtons actions={(endScreen) ? endActions : actions} logEvent={logEvent} />
                    </View>
                    <EventLog events={events} short={displayMetronome}/>
                </View>
            </TimeContext.Provider>

            <TouchableHighlight onPress={() => setDisplayHelp(!displayHelp)} style={bottomRight}>
                <Feather name={'help-circle'} size={1.8*em} color={'white'} />
            </TouchableHighlight>

            <TouchableHighlight style={{
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
            <OptionInput visible={displayInput} submit={logEvent} dismiss={() => setDisplayInput(false)} />

            <Help visible={displayHelp} dismiss={() => {setDisplayHelp(false)}} />
        </View>
    );
}

export default Main;