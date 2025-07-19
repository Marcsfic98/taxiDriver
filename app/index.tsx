
import { useRouter } from 'expo-router';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';


export default function HomeScreen() {

  const router = useRouter()

  function handleToApp () {
    router.navigate("/taximeterApp")
  }
  return (
    <ImageBackground source={require("../assets/images/bg.jpg")} style={styles.container}>
      <Image style={styles.logo} source={require("../assets/images/taxi.png")}></Image>
      <Text style={styles.text}>TAXI DRIVER</Text>
      <Text>Suas corridas com preço justo</Text>
      <TouchableOpacity onPress={handleToApp} style={styles.button} ><Text style={styles.buttonTxt} >Entrar</Text></TouchableOpacity>
    </ImageBackground>
  );
}


export const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  }
  ,
  logo:{
    width:200,
    height:200,
    marginBottom:50
  },
  text:{
    fontSize:35,
    fontWeight:"bold"
  },
  button:{
    borderRadius:8,
    borderWidth:2,
    paddingHorizontal:40,
    paddingVertical:10,
    marginTop:50,
    elevation:8,
    
  },
  buttonTxt:{
    fontSize:18,
    fontWeight:"bold"
  }
})

