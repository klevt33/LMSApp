import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Image,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as SecureStore from "expo-secure-store";

const baseUrl = "https://cookchildrensscormstaging.certpointstaging.com/";

export default function App() {
  const [firstRun, setFirstRun] = useState(true);
  const [loggedOut, setLoggedOut] = useState(true);
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [webViewUrl, setWebViewUrl] = useState("");
  const [showWebView, setShowWebView] = useState(false);
  const [portrait, setPortrait] = useState(true);

  const doLogin = (login, pass, save) => {
    const encodedLoginName = encodeURIComponent(login);
    const encodedPassword = encodeURIComponent(pass);
    const url = `${baseUrl}Portal/LoginCheck.aspx?loginname=${encodedLoginName}&password=${encodedPassword}`;
    save && saveCredentials(login, pass);
    setLoggedOut(false);
    setWebViewUrl(url);
    setShowWebView(true);
    setLoginName(login);
    setPassword(pass);
  };

  const handleLogin = () => {
    doLogin(loginName, password, true);
  };

  const handleHome = () => {
    let homeUrl = baseUrl + "lms";
    webViewUrl === homeUrl && (homeUrl += "/");
    setWebViewUrl(homeUrl);
  };

  const handleLogout = () => {
    setLoggedOut(true);
    setWebViewUrl(baseUrl + "logoutLocal.asp?CMDACTION=logoutSystem");
  };

  const handleProfile = () => {
    setShowWebView(false);
    setWebViewUrl("");
  };

  const getOrientation = () => {
    setPortrait(
      Dimensions.get("window").width < Dimensions.get("window").height
    );
  };

  useEffect(() => {
    Dimensions.addEventListener("change", getOrientation);
    return () => {
      Dimensions.removeEventListener("change", getOrientation);
    };
  }, []);

  useEffect(() => {
    if (firstRun) {
      setFirstRun(false);
      retrieveCredentials().then(([savedLogin, savedPass]) => {
        savedLogin && savedPass && doLogin(savedLogin, savedPass, false);
      });
    }
  }, [firstRun]);

  return (
    <SafeAreaView style={styles.topContainer}>
      {showWebView ? (
        <>
          {portrait && (
            <View style={styles.navBar}>
              <Button title="Home" onPress={handleHome} disabled={loggedOut} />
              <Button
                title="Logout"
                onPress={handleLogout}
                disabled={loggedOut}
              />
              <Button title="Login" onPress={handleProfile} />
            </View>
          )}
          <WebView source={{ uri: webViewUrl }} style={styles.webView} />
        </>
      ) : (
        <View style={styles.container}>
          <Image source={require("./img/infor-logo.png")} style={styles.logo} />
          <Text style={styles.title}>
            Welcome to the Infor LMS App for TTI!
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Login Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Login Name"
              value={loginName}
              onChangeText={(text) => setLoginName(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              value={password}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
          </View>
          <Button title="Save & Login" onPress={handleLogin} />
        </View>
      )}
    </SafeAreaView>
  );
}

async function saveCredentials(login, pass) {
  if (login) {
    await SecureStore.setItemAsync("login", login);
  } else {
    await SecureStore.deleteItemAsync("login");
  }

  if (pass) {
    await SecureStore.setItemAsync("pass", pass);
  } else {
    await SecureStore.deleteItemAsync("pass");
  }
}

function retrieveCredentials() {
  return new Promise(async (resolve, reject) => {
    try {
      const login = await SecureStore.getItemAsync("login");
      const pass = await SecureStore.getItemAsync("pass");
      resolve([login, pass]);
    } catch (error) {
      reject(error);
    }
  });
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginBottom: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    width: "80%",
  },
  label: {
    marginRight: 10,
    width: "30%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    width: "70%",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    padding: 10,
    width: "100%",
  },
  webView: {
    flex: 1,
    width: "100%",
  },
});
