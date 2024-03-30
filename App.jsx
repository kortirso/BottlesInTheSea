/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, ScrollView, StatusBar, Text, View} from 'react-native';

export default function App() {
  return (
    <SafeAreaView>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{backgroundColor: '#fff'}}>
        <View>
          <Text>Completed</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
