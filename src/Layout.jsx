import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import WorldScreen from './screens/WorldScreen';

const RootStack = createStackNavigator();

export default function Layout() {
  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      <RootStack.Group>
        <RootStack.Screen
          name="Home"
          component={WorldScreen}
          options={{title: ''}}
        />
      </RootStack.Group>
      <RootStack.Group screenOptions={{presentation: 'modal'}} />
    </RootStack.Navigator>
  );
}
