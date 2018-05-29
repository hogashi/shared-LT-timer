// firebase

// props
// {
//   onUpdate: function,
//   onAuthStateChanged: function,
// }
class Firebase {
  constructor(props) {
    this.props = props;
    this.state = {
      authenticated: false,
      showLoginForm: false,
    };

    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyBqWQysX_EMyRY_g5CnXi6aUCQnIU_SnBY",
      authDomain: "shared-lt-timer.firebaseapp.com",
      databaseURL: "https://shared-lt-timer.firebaseio.com",
      projectId: "shared-lt-timer",
      storageBucket: "shared-lt-timer.appspot.com",
      messagingSenderId: "482122259784"
    };
    firebase.initializeApp(config);

    // app start
    this.db = firebase.database().ref("/data");
    this.auth = firebase.auth;
    this.db.on("value", this._onUpdate.bind(this));
    this.data = {};
    this.auth().onAuthStateChanged(this._onAuthStateChanged.bind(this));
    this.minuteInput = document.getElementById("minuteInput");
    this.operationButton = document.getElementById("buttonContainer");
    this.loginFormButton = document.getElementById("loginFormButton");
    this.loginFormButton.addEventListener("click", this._onLoginFormButtonClick.bind(this));
    this.loginModal = document.getElementById("loginModal");
    this.loginForm = document.getElementById("loginForm");
    this.loginFormMessage = document.getElementById("loginFormMessage");
    this.loginInput = document.getElementById("loginInput");
    this.login = document.getElementById("login");
    this.login.addEventListener("click", this._onLoginClick.bind(this));
    this.logout = document.getElementById("logout");
    this.logout.addEventListener("click", this._onLogoutClick.bind(this));
    this.loginFormExitButton = document.getElementById("loginFormExitButton");
    this.loginFormExitButton.addEventListener("click", this._onLoginFormExitButtonClick.bind(this));
    this.operationDescription = document.getElementById("description");
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
  }

  _onUpdate(snapshot) {
    const val = snapshot.val();
    if (DEBUG) {
      console.log(snapshot, val);
    }
    this.data = Object.assign(this.data, val);
    this.props.onUpdate(val);
  }

  _onAuthStateChanged(user) {
    if (DEBUG) {
      console.log("auth changed:");
      console.log(user);
    }
    if (user) {
      this.setState({
        authenticated: true,
      });
    }
    else {
      this.setState({
        authenticated: false,
      });
    }
    this.props.onAuthStateChanged(this.state.authenticated);
  }

  setData(data) {
    this.db.set(Object.assign(this.data, data))
      .then(res => {
        if (DEBUG) {
          console.log(res);
          console.log("db updated");
        }
      })
      .catch(e => {
        if (DEBUG) {
          console.log(e);
          console.log("db update failed");
        }
      });
  }

  _onLoginFormButtonClick() {
    this.setState({
      showLoginForm: !this.state.showLoginForm,
    });
    this._updateView();
  }

  _onLoginClick() {
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    this.loginForm.style.display = "none";
    this.loginFormMessage.innerHTML = "wait...";

    this.auth().signInWithEmailAndPassword(email, password)
      .then(
        res => {
          if (DEBUG) {
            console.log(res);
            console.log("logged in");
          }
          this._onLoginFormExitButtonClick();
        },
        error => {
          const errorCode    = error.code;
          const errorMessage = error.message;
          if (DEBUG) {
            console.log(error, errorCode, errorMessage);
            console.log("login failed");
          }
          this._updateView();
        }
      );
  }

  _onLogoutClick() {
    this.loginForm.style.display = "none";
    this.loginFormMessage.innerHTML = "wait...";

    this.auth().signOut()
      .then(
        res => {
          if (DEBUG) {
            console.log(res);
            console.log("logged out");
          }
          this._onLoginFormExitButtonClick();
        },
        error => {
          const errorCode    = error.code;
          const errorMessage = error.message;
          if (DEBUG) {
            console.log(error, errorCode, errorMessage);
            console.log("logout failed");
          }
          this._updateView();
        }
      );
  }

  _onLoginFormExitButtonClick() {
    this.setState({
      showLoginForm: false,
    });
    this._updateView();
  }

  _updateView() {
    this.updateView(this.state.authenticated);
  }

  updateView(authenticated) {
    this.setState({ authenticated });
    if (authenticated) {
      this.minuteInput.removeAttribute("readonly");
      this.operationButton.style.display = "flex";
      this.loginFormButton.innerHTML = "logout";
      this.loginInput.style.display = "none";
      this.login.style.display = "none";
      this.logout.style.display = "block";
      this.operationDescription.style.display = "flex";
    }
    else {
      this.minuteInput.setAttribute("readonly", true);
      this.operationButton.style.display = "none";
      this.loginFormButton.innerHTML = "login";
      this.loginInput.style.display = "block";
      this.login.style.display = "block";
      this.logout.style.display = "none";
      this.operationDescription.style.display = "none";
    }

    this.loginForm.style.display = "flex";
    this.loginFormMessage.innerHTML = "";
    this.loginModal.style.display = this.state.showLoginForm ? "flex" : "none";
  }
}
