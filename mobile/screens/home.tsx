import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Main from './home/main';
import Notifications from './home/notifications';
import Settings from './home/settings';
import { Text } from 'react-native';


const MainIcon = (props: { focused: boolean, color: string, size: number}) =>{
    return (<Icon name={"home-variant-outline"} size={props.size} color={props.color} />)
}

const NotificationIcon = (props: { focused: boolean, color: string, size: number}) =>{
    return (<Icon name={"alarm-bell"} size={props.size} color={props.color} />)
}

const SettingsIcon = (props: { focused: boolean, color: string, size: number}) =>{
    return (<Icon name={"cog-outline"} size={props.size} color={props.color} />)
}

const Tabs = createBottomTabNavigator();
const Home = () =>{
    return (<Tabs.Navigator screenOptions={{tabBarActiveTintColor: "#37adf3"}}>
            <Tabs.Screen name="main" component={Main} options={{tabBarIcon: MainIcon}}/>
            <Tabs.Screen name="nofications" component={Notifications} options={{tabBarIcon: NotificationIcon}}/>
            <Tabs.Screen name="settings" component={Settings} options={{tabBarIcon: SettingsIcon}}/>
        </Tabs.Navigator>);
}

export default Home;