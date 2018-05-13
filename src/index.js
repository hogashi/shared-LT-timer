// index.js

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
      this.operationButton.style.display = "flex";
      this.loginFormButton.innerHTML = "logout";
      this.loginInput.style.display = "none";
      this.login.style.display = "none";
      this.logout.style.display = "block";
      this.operationDescription.style.display = "flex";
    }
    else {
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


// timer

// indicator
// propTypes: {
//     id: string.isRequired,
//     onDatabaseUpdate: function,
//     onAuthStateChanged: function,
//   }
class TimerIndicator {
  constructor(props) {
    this.props = props;
    this.state = {
      startSecond: `${10 * 60}`,  // Dentoo.LT Standard
      second: `${10 * 60}`,
      // power: "OFF",
    };

    this.indicator = document.getElementById(this.props.id);
    this.fb = new Firebase({
      onUpdate: this._onDatabaseUpdate.bind(this),
      onAuthStateChanged: this._onAuthStateChanged.bind(this),
    });
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
  }

  // zero fill in 2 figures
  // returns: string
  _zfill(num) {
    return `00${num}`.slice(-2);
  }

  _onAuthStateChanged(authenticated) {
    this.props.onAuthStateChanged(authenticated);
    this.fb.updateView(authenticated);
  }

  _onDatabaseUpdate(data) {
    // this.setState(data);
    this.props.onDatabaseUpdate(data);
  }

  updateView(parentState) {
    const { authenticated, isRunning, nowSecond, startSecond, main } = parentState;
    this.setState(parentState);
    let second = parseInt(nowSecond, 10);
    const sec = second % 60;
    const min = Math.floor((second - sec) / 60);

    this.indicator.innerHTML = `${this._zfill(min)}:${this._zfill(sec)}`;

    if (DEBUG) {
      console.log(isRunning, nowSecond, startSecond, main);
    }
    if (isRunning) {
      if (second < parseInt(startSecond, 10) * 0.2) {
        main.setAttribute("class", "hurry");
      }
      else {
        main.setAttribute("class", "isRunning");
      }
    }
    else {
      main.setAttribute("class", "notRunning");
    }

    if (min > 0 || sec > 0) {
      this.indicator.setAttribute("class", null);
    }
    else {
      this.indicator.setAttribute("class", "end");
    }

    this.fb.updateView(authenticated);
  }
}

// button
// propTypes: {
//     id: string.isRequired,
//     onClick: func.isRequired
//   }
class Button {
  constructor(props) {
    this.props = props;

    this.button = document.getElementById(this.props.id);
    this.button.addEventListener("click", this._onClick.bind(this));
  }

  _onClick(e) {
    this.button.blur();
    this.props.onClick(e);
  }
}

// input
// propTypes: {
//     id: string.isRequired,
//     onTimeSubmit: func.isRequired
//   }
class TimerInput {
  constructor(props) {
    this.props = props;

    this.input = document.getElementById(this.props.id);
    this.input.focus();
  }

  // test for is 1 ~ 99
  // returns: boolean
  _isValidMinute(min) {
    if (Math.round(min) === min  // is integer
        && min >= 1
        && min <= 99) {
      return true;
    }
    return false;
  }

  onSubmit() {
    const minute = parseInt(this.input.value);
    const isValid = this._isValidMinute(minute);
    if (isValid) {
      this.input.setAttribute("class", "valid");
      this.input.blur();

      // pass second
      this.props.onTimeSubmit(minute * 60);
    }
    else {
      this.input.setAttribute("class", "invalid");
      this.input.focus();
    }
  }
}

// root controller
class TimerController {
  constructor() {
    this.state = {
      authenticated: false,
      isRunning: false,
      startSecond: `${10 * 60}`,
      nowSecond: `${10 * 60}`,
      timerId: null
    };

    // main container
    this.main = document.getElementById("main");
    // minute input
    this.minuteInput = document.getElementById("minuteInput");

    // timer indicator
    this.timerIndicator =
      new TimerIndicator({
        id: "indicator",
        onDatabaseUpdate: this._onDatabaseUpdate.bind(this),
        onAuthStateChanged: this._onAuthStateChanged.bind(this),
      });

    // time input
    this.timerInput =
      new TimerInput({
        id: "minuteInput",
        onTimeSubmit: this._resetTimer.bind(this)
      });

    // buttons
    this.resetButton =
      new Button({
        id: "resetButton",
        onClick: this._onPressResetButton.bind(this)
      });

    this.startStopButton =
      new Button({
        id: "startStopButton",
        onClick: this._switchTimer.bind(this)
      });

    document.addEventListener("keydown", this._onKeydown.bind(this));
    this._updateView();
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
  }

  // args: KeyboardEvent
  _onKeydown(e) {
    // no timer operations if inputting
    if (document.activeElement === this.timerInput.input) {
      if (e.key === "Enter") {
        this.timerInput.onSubmit();
      }
      return;
    }

    const keydownOperations = {
      " ":          () => { this._switchTimer(); },
      "s":          () => { this._switchTimer(); },
      "Escape":     () => { this._resetTimer(this.state.startSecond); },
      "r":          () => { this._resetTimer(this.state.startSecond); },
      "ArrowRight": () => { this._modifySecond(-10); },
      "ArrowLeft":  () => { this._modifySecond(10); },
      "ArrowDown":  () => { this._modifySecond(-1); },
      "ArrowUp":    () => { this._modifySecond(1); },
    };

    const key = Object.keys(keydownOperations)
      .filter(k => {
        return k === e.key;
      })[0];

    if (key) {
      keydownOperations[key]();
    }
  }

  _onPressResetButton() {
    this.timerInput.onSubmit();
  }

  _onAuthStateChanged(authenticated) {
    this.setState({ authenticated });
    this._updateView();
  }

  _onDatabaseUpdate(data) {
    if (DEBUG) {
      console.log('authenticated', this.state.authenticated);
    }
    if (this.state.authenticated) {
      return;
    }
    this.setState({
      isRunning: data.power === "ON",
      nowSecond: parseInt(data.second, 10),
      startSecond: parseInt(data.startSecond, 10),
    });
    this._updateView();
  }

  // update the timer view with the state
  _updateView() {
    const { authenticated, nowSecond, startSecond } = this.state;
    if (authenticated) {
      this.timerIndicator.fb.setData({
        second: `${nowSecond}`,
        startSecond: `${startSecond}`,
      });
    }
    else {
      this.minuteInput.value = Math.floor(startSecond / 60);
    }
    this.timerIndicator.updateView(
      Object.assign(this.state, { main: this.main })
    );
  }

  // modify the second of the state
  // args: integer
  _modifySecond(diff) {
    const nextSecond = this.state.nowSecond + diff;
    // time is allowed to be between 00:00-99:59
    if (0 <= nextSecond && nextSecond <= 99 * 60 + 59) {
      this.state.nowSecond = nextSecond;
      this._updateView();
    }
  }

  // (re)set the timer to startSecond
  _resetTimer(second) {
    this._stopTimer();

    this.setState({
      nowSecond  : second,
      startSecond: second
    });
    this._updateView();
  }

  _startTimer() {
    const { authenticated, nowSecond } = this.state;
    if (this.state.nowSecond > 0) {
      this.setState({
        isRunning: true,
      });
      if (this.state.authenticated) {
        this.timerIndicator.fb.setData({
          power: "ON",
        });
      }

      this.state.timerId = setInterval(() => {
        this.state.nowSecond -= 1;

        if (this.state.nowSecond <= 0) {
          // stop timer
          this.state.nowSecond = 0;
          this._stopTimer();
        }

        this._updateView();
      }, 1000);
    }

    // update view even not started
    this._updateView();
  }

  _stopTimer() {
    clearInterval(this.state.timerId);
    this.setState({
      isRunning: false,
    });
    if (this.state.authenticated) {
      this.timerIndicator.fb.setData({
        power: "OFF",
      });
    }

    this._updateView();
  }

  // if on  -> then off
  // if off -> then on
  _switchTimer() {
    if (this.state.isRunning) {
      this._stopTimer();
      return;
    }
    this._startTimer();
  }
}

let DEBUG = false;
const lttimer = new TimerController();
