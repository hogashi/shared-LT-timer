// login_container

import React, { Component } from "react";
import firebase from "firebase";

import * as Constants from "./constants";

const app = firebase.initializeApp(firebaseConfig);
const dbRef  = app.database().ref("/data");

// props
// {
//   onUpdate: function,
//   onAuthStateChanged: function,
// }
export default class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      showLoginForm: false,
    };

    this.data = {};
  }

  componentDidMount() {
    dbRef.on("value", this._onDbUpdate.bind(this));
    app.auth().onAuthStateChanged(this._onAuthStateChanged.bind(this));
  }

  _isObjectEqual(a, b) {
    return Object.keys(a).every(key => a[key] === b[key]);
  }

  componentWillReceiveProps(nextProps) {
    const { power, second, startSecond } = nextProps;

    if (this.state.authenticated
      || this._isObjectEqual({power, second, startSecond}, this.data)) {
      return;
    }

    const newData = Object.assign(this.data, {power, second, startSecond});
    if (Constants.DEBUG) {
      console.log(newData);
    }
    this._setData(newData);
  }

  // firebase from here
  // on firebase db updated
  _onDbUpdate(snapshot) {
    const val = snapshot.val();
    if (Constants.DEBUG) {
      console.log(snapshot, val);
    }
    this.data = Object.assign(this.data, val);
    this.props.onDbUpdate(this.data);
  }

  // on firebase auth changed
  _onAuthStateChanged(user) {
    if (Constants.DEBUG) {
      console.log("auth changed:");
      console.log(user);
    }
    this.setState({
      authenticated: user ? true : false,
    });
    this.props.onAuthStateChanged(this.state.authenticated);
  }

  // set data to firebase
  _setData(newData) {
    dbRef.set(newData).then(
      res => {
        if (Constants.DEBUG) {
          console.log(res);
          console.log("db updated");
        }
      },
      err => {
        if (Constants.DEBUG) {
          console.log(err);
          console.log("db update failed");
        }
      }
    );
  }

  // login container from here
  _onModalShowButtonClick() {
    this.setState({
      showLoginForm: true,
    });
  }

  _onLoginClick() {
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    this.setState({
      showLoginForm: false,
      isProsessing: true,
    });

    app.auth().signInWithEmailAndPassword(email, password).then(
      res => {
        if (Constants.DEBUG) {
          console.log(res);
          console.log("logged in");
        }
        this._onFormExitButtonClick();
      },
      error => {
        const errorCode    = error.code;
        const errorMessage = error.message;
        if (Constants.DEBUG) {
          console.log(error, errorCode, errorMessage);
          console.log("login failed");
        }
      }
    ).finally(() => {
      this.setState({
        isProsessing: false,
      });
    });
  }

  _onLogoutClick() {
    this.setState({
      isProsessing: true,
    });

    app.auth().signOut().then(
      res => {
        if (Constants.DEBUG) {
          console.log(res);
          console.log("logged out");
        }
        this._onFormExitButtonClick();
      },
      error => {
        const errorCode    = error.code;
        const errorMessage = error.message;
        if (Constants.DEBUG) {
          console.log(error, errorCode, errorMessage);
          console.log("logout failed");
        }
      }
    ).finally(() => {
      this.setState({
        isProsessing: false,
      });
    });
  }

  _onFormExitButtonClick() {
    this.setState({
      showLoginForm: false,
    });
  }

  _loginLogoutText() {
    return this.state.authenticated ? "logout" : "login";
  }

  _renderFormMessage() {
    let message = "login/logout";
    if (propsessFailed) {
      message = Constants.MESSAGE_FAIL;
    }
    else if (isProsessing) {
      message = Constants.MESSAGE_WAIT;
    }
    return (
      <div id="loginFormMessage">
        {message}
      </div>
    );
  }

  _renderForm() {
    if (!this.state.showLoginForm) {
      return null;
    }

    let onButtonClick = this._onLoginClick.bind(this);
    let loginInput;

    if (!this.state.authenticated) {
      onButtonClick = this._onLogoutClick.bind(this);
      loginInput = (
        <div id="loginInput" key="loginInput">
          <div>
            <input id="email"
                    type="text"
                    placeholder="email address" />
          </div>
          <div>
            <input id="password"
                    type="password"
                    placeholder="password" />
          </div>
        </div>
      );
    }

    return (
      <div id="loginForm">
        {loginInput}
        <button id="loginLogoutButton"
                key="loginLogoutButton"
                onClick={onButtonClick}>
          {this._loginLogoutText()}
        </button>
      </div>
    );
  }

  render() {
    const { message, showLoginForm, isProsessing } = this.state;

    return (
      <div id="loginContainer">
        <button id="loginModalShowButton"
                onClick={this._onModalShowButtonClick.bind(this)}>
          {this._loginLogoutText()}
        </button>
        <div id="loginModal">
          <div id="loginFormContainer">
            {this._renderFormMessage()}
            {this._renderForm()}
            <button id="loginFormExitButton"
                    onClick={this._onFormExitButtonClick.bind(this)}>
              back
            </button>
          </div>
        </div>
      </div>
    );
  }
}
