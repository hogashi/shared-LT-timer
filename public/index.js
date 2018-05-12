"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// index.js

// firebase

// props
// {
//   onUpdate: function,
//   onAuthStateChanged: function,
// }
var Firebase = function () {
  function Firebase(props) {
    _classCallCheck(this, Firebase);

    this.props = props;
    this.state = {
      authenticated: false,
      showLoginForm: false
    };

    // Initialize Firebase
    var config = {
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

  _createClass(Firebase, [{
    key: "setState",
    value: function setState(state) {
      this.state = Object.assign(this.state, state);
    }
  }, {
    key: "_onUpdate",
    value: function _onUpdate(snapshot) {
      var val = snapshot.val();
      console.log(snapshot, val);
      this.data = val;
      this.props.onUpdate(val);
    }
  }, {
    key: "_onAuthStateChanged",
    value: function _onAuthStateChanged(user) {
      this.props.onAuthStateChanged(user);
    }
  }, {
    key: "setData",
    value: function setData(data) {
      this.db.set(Object.assign(this.data, data)).then(function (res) {
        console.log(res);
        console.log("db updated");
      }).catch(function (e) {
        console.log(e);
        console.log("db update failed");
      });
    }
  }, {
    key: "_onLoginFormButtonClick",
    value: function _onLoginFormButtonClick() {
      this.setState({
        showLoginForm: !this.state.showLoginForm
      });
      this._updateView();
    }
  }, {
    key: "_onLoginClick",
    value: function _onLoginClick() {
      var _this = this;

      var email = document.getElementById("email").value;
      var password = document.getElementById("password").value;

      this.loginForm.style.display = "none";
      this.loginFormMessage.innerHTML = "wait...";

      this.auth().signInWithEmailAndPassword(email, password).then(function (res) {
        console.log(res);
        console.log("logged in");
        _this._onLoginFormExitButtonClick();
      }, function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error, errorCode, errorMessage);

        console.log("login failed");
        _this._updateView();
      });
    }
  }, {
    key: "_onLogoutClick",
    value: function _onLogoutClick() {
      var _this2 = this;

      this.loginForm.style.display = "none";
      this.loginFormMessage.innerHTML = "wait...";

      this.auth().signOut().then(function (res) {
        console.log(res);
        console.log("logged out");
        _this2._onLoginFormExitButtonClick();
      }, function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error, errorCode, errorMessage);

        console.log("logout failed");
        _this2._updateView();
      });
    }
  }, {
    key: "_onLoginFormExitButtonClick",
    value: function _onLoginFormExitButtonClick() {
      this.setState({
        showLoginForm: false
      });
      this._updateView();
    }
  }, {
    key: "_updateView",
    value: function _updateView() {
      this.updateView(this.state.authenticated);
    }
  }, {
    key: "updateView",
    value: function updateView(authenticated) {
      this.setState({ authenticated: authenticated });
      if (authenticated) {
        this.operationButton.style.display = "flex";
        this.loginFormButton.innerHTML = "logout";
        this.loginInput.style.display = "none";
        this.login.style.display = "none";
        this.logout.style.display = "block";
        this.operationDescription.style.display = "flex";
      } else {
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
  }]);

  return Firebase;
}();

// timer

// indicator
// propTypes: {
//     id: string.isRequired,
//     onDatabaseUpdate: function,
//   }


var TimerIndicator = function () {
  function TimerIndicator(props) {
    _classCallCheck(this, TimerIndicator);

    this.props = props;
    this.state = {
      authenticated: false,
      startSecond: "" + 10 * 60, // Dentoo.LT Standard
      second: "0",
      power: "OFF"
    };

    this.indicator = document.getElementById(this.props.id);
    this.fb = new Firebase({
      onUpdate: this._onDatabaseUpdate.bind(this),
      onAuthStateChanged: this._onAuthStateChanged.bind(this)
    });
  }

  _createClass(TimerIndicator, [{
    key: "setState",
    value: function setState(state) {
      this.state = Object.assign(this.state, state);
    }

    // zero fill in 2 figures
    // returns: string

  }, {
    key: "_zfill",
    value: function _zfill(num) {
      return ("00" + num).slice(-2);
    }
  }, {
    key: "_onAuthStateChanged",
    value: function _onAuthStateChanged(user) {
      console.log("auth changed:");
      console.log(user);
      if (user) {
        this.setState({
          authenticated: true
        });
      } else {
        this.setState({
          authenticated: false
        });
      }
      this.fb.updateView(this.state.authenticated);
    }
  }, {
    key: "_onDatabaseUpdate",
    value: function _onDatabaseUpdate(data) {
      this.setState(data);
      this.props.onDatabaseUpdate(data);
    }
  }, {
    key: "updateView",
    value: function updateView(parentState) {
      var isRunning = parentState.isRunning,
          nowSecond = parentState.nowSecond,
          startSecond = parentState.startSecond,
          main = parentState.main;

      var second = nowSecond;
      if (this.state.authenticated) {
        this.fb.setData({
          second: "" + second
        });
      } else {
        second = parseInt(this.state.second, 10);
      }
      var sec = second % 60;
      var min = Math.floor((second - sec) / 60);

      this.indicator.innerHTML = this._zfill(min) + ":" + this._zfill(sec);

      console.log(isRunning, nowSecond, startSecond, main);
      if (isRunning) {
        if (second < parseInt(startSecond, 10) * 0.2) {
          main.setAttribute("class", "hurry");
        } else {
          main.setAttribute("class", "isRunning");
        }
      } else {
        main.setAttribute("class", "notRunning");
      }

      if (min > 0 || sec > 0) {
        this.indicator.setAttribute("class", null);
      } else {
        this.indicator.setAttribute("class", "end");
      }

      this.fb.updateView(this.state.authenticated);
    }
  }]);

  return TimerIndicator;
}();

// button
// propTypes: {
//     id: string.isRequired,
//     onClick: func.isRequired
//   }


var Button = function () {
  function Button(props) {
    _classCallCheck(this, Button);

    this.props = props;

    this.button = document.getElementById(this.props.id);
    this.button.addEventListener("click", this._onClick.bind(this));
  }

  _createClass(Button, [{
    key: "_onClick",
    value: function _onClick(e) {
      this.button.blur();
      this.props.onClick(e);
    }
  }]);

  return Button;
}();

// input
// propTypes: {
//     id: string.isRequired,
//     onTimeSubmit: func.isRequired
//   }


var TimerInput = function () {
  function TimerInput(props) {
    _classCallCheck(this, TimerInput);

    this.props = props;

    this.input = document.getElementById(this.props.id);
    this.input.focus();
  }

  // test for is 1 ~ 99
  // returns: boolean


  _createClass(TimerInput, [{
    key: "_isValidMinute",
    value: function _isValidMinute(min) {
      if (Math.round(min) === min // is integer
      && min >= 1 && min <= 99) {
        return true;
      }
      return false;
    }
  }, {
    key: "onSubmit",
    value: function onSubmit() {
      var minute = parseInt(this.input.value);
      var isValid = this._isValidMinute(minute);
      if (isValid) {
        this.input.setAttribute("class", "valid");
        this.input.blur();

        // pass second
        this.props.onTimeSubmit(minute * 60);
      } else {
        this.input.setAttribute("class", "invalid");
        this.input.focus();
      }
    }
  }]);

  return TimerInput;
}();

// root controller


var TimerController = function () {
  function TimerController() {
    _classCallCheck(this, TimerController);

    this.state = {
      isRunning: false,
      startSecond: 0,
      nowSecond: 0,
      timerId: null
    };

    // main container
    this.main = document.getElementById("main");
    // minute input
    this.minuteInput = document.getElementById("minuteInput");

    // timer indicator
    this.timerIndicator = new TimerIndicator({
      id: "indicator",
      onDatabaseUpdate: this._onDatabaseUpdate.bind(this)
    });

    // time input
    this.timerInput = new TimerInput({
      id: "minuteInput",
      onTimeSubmit: this._resetTimer.bind(this)
    });

    // buttons
    this.resetButton = new Button({
      id: "resetButton",
      onClick: this._onPressResetButton.bind(this)
    });

    this.startStopButton = new Button({
      id: "startStopButton",
      onClick: this._switchTimer.bind(this)
    });

    document.addEventListener("keydown", this._onKeydown.bind(this));
  }

  _createClass(TimerController, [{
    key: "setState",
    value: function setState(state) {
      this.state = Object.assign(this.state, state);
    }

    // args: KeyboardEvent

  }, {
    key: "_onKeydown",
    value: function _onKeydown(e) {
      var _this3 = this;

      // no timer operations if inputting
      if (document.activeElement === this.timerInput.input) {
        if (e.key === "Enter") {
          this.timerInput.onSubmit();
        }
        return;
      }

      var keydownOperations = {
        " ": function _() {
          _this3._switchTimer();
        },
        "s": function s() {
          _this3._switchTimer();
        },
        "Escape": function Escape() {
          _this3._resetTimer(_this3.state.startSecond);
        },
        "r": function r() {
          _this3._resetTimer(_this3.state.startSecond);
        },
        "ArrowRight": function ArrowRight() {
          _this3._modifySecond(-10);
        },
        "ArrowLeft": function ArrowLeft() {
          _this3._modifySecond(10);
        },
        "ArrowDown": function ArrowDown() {
          _this3._modifySecond(-1);
        },
        "ArrowUp": function ArrowUp() {
          _this3._modifySecond(1);
        }
      };

      var key = Object.keys(keydownOperations).filter(function (k) {
        return k === e.key;
      })[0];

      if (key) {
        keydownOperations[key]();
      }
    }
  }, {
    key: "_onPressResetButton",
    value: function _onPressResetButton() {
      this.timerInput.onSubmit();
    }
  }, {
    key: "_onDatabaseUpdate",
    value: function _onDatabaseUpdate(data) {
      this.setState({
        isRunning: data.power === "ON",
        startSecond: parseInt(data.startSecond, 10)
      });
      this._updateView();
    }

    // update the timer view with the state

  }, {
    key: "_updateView",
    value: function _updateView() {
      var _state = this.state,
          authenticated = _state.authenticated,
          startSecond = _state.startSecond;

      if (!authenticated) {
        this.minuteInput.value = Math.floor(startSecond / 60);
      }
      this.timerIndicator.updateView(Object.assign(this.state, { main: this.main }));
    }

    // modify the second of the state
    // args: integer

  }, {
    key: "_modifySecond",
    value: function _modifySecond(diff) {
      var nextSecond = this.state.nowSecond + diff;
      // time is allowed to be between 00:00-99:59
      if (0 <= nextSecond && nextSecond <= 99 * 60 + 59) {
        this.state.nowSecond = nextSecond;
        this._updateView();
      }
    }

    // (re)set the timer to startSecond

  }, {
    key: "_resetTimer",
    value: function _resetTimer(second) {
      this._stopTimer();

      this.state.startSecond = second;
      this.timerIndicator.fb.setData({
        startSecond: "" + this.state.startSecond
      });
      this.state.nowSecond = this.state.startSecond;
      this._updateView();
    }
  }, {
    key: "_startTimer",
    value: function _startTimer() {
      var _this4 = this;

      if (this.state.nowSecond > 0) {
        this.state.isRunning = true;
        this.timerIndicator.fb.setData({
          power: "ON"
        });

        this.state.timerId = setInterval(function () {
          _this4.state.nowSecond -= 1;

          if (_this4.state.nowSecond <= 0) {
            // stop timer
            _this4.state.nowSecond = 0;
            _this4._stopTimer();
          }

          _this4._updateView();
        }, 1000);
      }

      // update view even not started
      this._updateView();
    }
  }, {
    key: "_stopTimer",
    value: function _stopTimer() {
      clearInterval(this.state.timerId);
      this.state.isRunning = false;
      this.timerIndicator.fb.setData({
        power: "OFF"
      });

      this._updateView();
    }

    // if on  -> then off
    // if off -> then on

  }, {
    key: "_switchTimer",
    value: function _switchTimer() {
      if (this.state.isRunning) {
        this._stopTimer();
        return;
      }
      this._startTimer();
    }
  }]);

  return TimerController;
}();

var lttimer = new TimerController();