import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, TextInputChangeEventData, NativeSyntheticEvent } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const styles = StyleSheet.create({
    input:{
        width: "100%", height: 44,
        backgroundColor: '#e8e8e8', borderRadius: 8,
        paddingHorizontal: 10, display: "flex",
        flexDirection: "row", alignItems: "center"
    }
});

const Password = (props:{placeholder: string, iconSize?: number, width?: number | string, height?: number | string, onChange?: ((e: NativeSyntheticEvent<TextInputChangeEventData>) => void)}) =>{
    const [passwordSecured, setPasswordSecured] = useState(true);

    let iconSize = props.iconSize ?? 20;
    let width = props.width ?? "100%";
    let height = props.height ?? 44;
    
    return (
        <View style={{...styles.input, width: width, height: height}}>
            <Icon color="#333" name="lock-outline" size={iconSize} />
            <TextInput style={{flex: 1, paddingHorizontal: 12}} secureTextEntry={passwordSecured} placeholder={props.placeholder} textContentType="password" onChange={props.onChange}/>
            <TouchableOpacity style={{padding: 4}} onPress={()=>{ setPasswordSecured(!passwordSecured)}}>
                <Icon name={passwordSecured ? "eye-outline" : "eye-off-outline" } size={iconSize} />
            </TouchableOpacity>
        </View>);
}

const Input = (props:{placeholder: string, icon: string, iconSize?: number, width?: number | string, height?: number | string, inputType?: "emailAddress" | "none", onChange?: ((e: NativeSyntheticEvent<TextInputChangeEventData>) => void)}) =>{
    let iconSize = props.iconSize ?? 20;
    let width = props.width ?? "100%";
    let height = props.height ?? 44;
    let initInputType = props.inputType ?? "none";

    return (
        <View style={{...styles.input, width: width, height: height}}>
            <Icon color="#333" name={props.icon} size={ iconSize } />
            <TextInput style={{flex: 1, paddingHorizontal: 12}} placeholder={props.placeholder} textContentType={initInputType} onChange={props.onChange}/>
        </View>);
}

export { Password, Input }