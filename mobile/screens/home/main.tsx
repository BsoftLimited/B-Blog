import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-elements";

const Main = () =>{
    const navigation = useNavigation();

    const toSignIn = () =>{
        navigation.navigate('signin');
    }
    return (
        <SafeAreaView>
            <View>
                <Text>Main</Text>
                <TouchableOpacity onPress={toSignIn}>
                    <Text>Sign In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Main;