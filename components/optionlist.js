import React, {useEffect} from 'react';
import {Text, View, TouchableHighlight, FlatList} from 'react-native';
import s from '../styles/styles';
import Popup from './popup';

const Option = ({name, select}) => {
  return (
    <TouchableHighlight style={s.row} onPress={select}>
      <Text style={s.text}>{name}</Text>
    </TouchableHighlight>
  )
}

const OptionList = ({title, options, visible, dismiss}) => {
  useEffect(() => {
    
  console.log(visible)
  }, [visible])

  if (!visible) {
    return null;
  }
  
	return (
    <Popup 
      visible={visible} 
      dismiss={dismiss}
      content={
        <FlatList
          data={options}
          renderItem={({item}) => (
            <Option name={item}/>
          )}
          keyExtractor={(name) => name}
          ListHeaderComponent={<View style={s.row}>
            <Text style={s.buttonText}>{title}</Text>
          </View>}
          stickyHeaderIndices={[0]}
          directionalLockEnabled={true}
        />
      }
    />
	);
}

export default OptionList;
