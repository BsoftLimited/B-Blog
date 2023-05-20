import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Signin from './screens/signin';
import { Text, View } from 'react-native';
import Home from './screens/home';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Help from './screens/help';

const Stack = createNativeStackNavigator();

const SigninHeader = () =>{
  return (
    <View style={{flexDirection:"row", alignItems: "center", gap: 8}}>
      <Icon color="#333" name="account-plus-outline" size={24} />
      <Text  style={{fontSize: 18}}>Signin</Text>
    </View>
  );
}

const InfoHeader = () =>{
  return (
    <View style={{flexDirection:"row", alignItems: "center", gap: 8}}>
      <Icon color="#333" name="help-circle-outline" size={24} />
      <Text  style={{fontSize: 18}}>About</Text>
    </View>
  );
}

const headerOptions = { statusBarStyle:"dark", statusBarColor:"white", navigationBarColor:"white"};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="home" component={Home} options={{...headerOptions, headerShown: false}}/>
        <Stack.Screen name="signin" component={Signin} options={{...headerOptions, headerTitle:SigninHeader, headerTitleAlign: "left"}}/>
        <Stack.Screen name="help" component={Help} options={{...headerOptions, headerTitle:InfoHeader, headerTitleAlign: "left"}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;