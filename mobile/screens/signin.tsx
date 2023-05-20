import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {Text, View, StyleSheet, Button, TouchableOpacity, TouchableWithoutFeedback, Keyboard, NativeSyntheticEvent, TextInputChangeEventData, Dimensions, Image} from 'react-native';
import { LoginRequest, SignUpRequest } from '../utils/requests';
import { Input, Password } from '../components/input';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const styles = StyleSheet.create({
    bottomView: {
        backgroundColor: 'white',
        opacity: 0.95,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    },
    loginLabel: {
        fontSize: 18, fontWeight: '700', alignSelf: "flex-start"
    },
    forgottenButton:{
        alignSelf: "flex-end"
    },
    forgottenLabel:{

    },
    submitButton:{
        width: "100%",
        paddingVertical: 12,
        backgroundColor: "#37adf3",
        borderRadius: 10
    },
    optionsButton:{
        borderWidth: 2,
        borderColor: "#37adf3",
        flex: 1,
        paddingVertical: 10,
        borderRadius: 30
    },
    optionsButtonText:{
        textAlign: "center",
        fontWeight: "600",
    },
    title:{
        textAlign: "center",
        marginBottom: 40,
        fontSize: 80,
        fontWeight: "900"
    }
});

const Signin = () =>{
    const navigation = useNavigation();
    const [login,  setLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loginDetails, setLoginDetails] = useState<LoginRequest>({email: "", password: ""});
    const [signupDetails, setSignupDetails] = useState<SignUpRequest>({name:"", surname: "", email: "", password: "", repassword: ""})

    const openLoginForm = () => setLogin(true);
    const openSignupForm = () => setLogin(false);

    const loginEmailChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) =>{
        setLoginDetails({...loginDetails, email: event.nativeEvent.text});    
    }

    const loginPasswordChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) =>{
        setLoginDetails({...loginDetails, password: event.nativeEvent.text});
    }

    const signupNameChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) =>{
        setSignupDetails({...signupDetails, name: event.nativeEvent.text});    
    }

    const signupSurnameChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) =>{
        setSignupDetails({...signupDetails, surname: event.nativeEvent.text});
    }

    const signupEmailChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) =>{
        setSignupDetails({...signupDetails, email: event.nativeEvent.text});    
    }

    const signupPasswordChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) =>{
        setSignupDetails({...signupDetails, password: event.nativeEvent.text});
    }

    const toHelp = () =>{
        navigation.navigate("help");
    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{flex: 1, paddingTop: 15, justifyContent: "space-between"}}>
                <View style={{flexDirection:"row", justifyContent:"space-evenly", marginHorizontal: 36, marginBottom:  10}}>
                    <TouchableOpacity style={{...styles.optionsButton, marginEnd: 20, backgroundColor: login ? "#37adf3" : "white"}} onPress={openLoginForm}>
                        <Text style={{...styles.optionsButtonText, color: login ? "white" : "#37adf3"}}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{...styles.optionsButton, backgroundColor: login ? "white" : "#37adf3"}} onPress={openSignupForm}>
                        <Text style={{...styles.optionsButtonText, color: login ? "#37adf3" : "white"}}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
                { login && (<Image style={{alignSelf:  "center"}} source={require("../images/login.png")}/>) }
                { !login && (<Image style={{alignSelf:  "center"}} source={require("../images/signup.png")}/>) }
                <View>
                    {login && 
                        (<View style={{...styles.bottomView, rowGap: 15}}>
                            <Input placeholder={"Email Address"} icon={"email-outline"} onChange={loginEmailChange}/>
                            <Password placeholder={'Password'} onChange={loginPasswordChange}/>
                            <TouchableOpacity style={styles.forgottenButton}>
                                <Text style={styles.forgottenLabel}>forgotten password</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton}>
                                <Text style={{color: "white", letterSpacing: 1.5, fontWeight: "600", alignSelf:"center"}}>Login</Text>
                            </TouchableOpacity>
                        </View>) 
                    }
                    { !login  && 
                        (<View style={{...styles.bottomView, rowGap: 12}}>
                            <Input placeholder={"Name"} onChange={signupNameChange} icon={"card-account-details-outline"} />
                            <Input placeholder={"Surname"} onChange={signupSurnameChange} icon={"card-account-details-outline"} />
                            <Input placeholder={"Email Address"} onChange={signupEmailChange} icon={"email-edit-outline"} />
                            <Password placeholder={'Choose Password'} onChange={signupPasswordChange} />
                            <Password placeholder={'Confirm Password'} />
                            <TouchableOpacity style={styles.submitButton}>
                                <Text style={{color: "white", letterSpacing: 1.5, fontWeight: "600", alignSelf:"center"}}>Login</Text>
                            </TouchableOpacity>
                        </View>) 
                    }
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

export default Signin;