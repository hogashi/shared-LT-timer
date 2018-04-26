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

    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyDMdU74_4W-TmlYTPGWnE3-GM78rqKpey8",
      authDomain: "hoga-initial-cb665.firebaseapp.com",
      databaseURL: "https://hoga-initial-cb665.firebaseio.com",
      projectId: "hoga-initial-cb665",
      storageBucket: "hoga-initial-cb665.appspot.com",
      messagingSenderId: "429242556385"
    };
    firebase.initializeApp(config);

    // app start
    this.db = firebase.database().ref("/data");
    this.auth = firebase.auth;
    this.db.on('value', this._onUpdate.bind(this));
    this.auth().onAuthStateChanged(this._onAuthStateChanged.bind(this));
    document.getElementById('login').addEventListener('click', this._onLoginClick.bind(this));
    document.getElementById('logout').addEventListener('click', this._onLogoutClick.bind(this));
  }

  _onUpdate(snapshot) {
    const val = snapshot.val();
    console.log(snapshot, val);
    this.data = val;
    this.props.onUpdate(val);
  }

  _onAuthStateChanged(user) {
    this.props.onAuthStateChanged(user);
  }

  setData(data) {
    this.db.set(Object.assign(this.data, data))
      .then(res => {
        console.log(res);
        console.log('db updated');
      })
      .catch(e => {
        console.log(e);
        console.log('db update failed');
      });
  }

  _onLoginClick() {
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    this.auth().signInWithEmailAndPassword(email, password)
      .then(res => {
        console.log(res);
        console.log('logged in');
      })
      .catch(function(error) {
        const errorCode    = error.code;
        const errorMessage = error.message;
        console.log(error, errorCode, errorMessage);

        console.log('login failed');
    })
  }

  _onLogoutClick() {
    this.auth().signOut()
      .then(res => {
        console.log(res);
        console.log('logged out');
      })
      .catch(e => {
        console.log(e);
        console.log('logout failed');
      });
  }
}


// timer

// indicator
// propTypes: {
//     id: string.isRequired,
//     onDatabaseUpdate: function,
//   }
class TimerIndicator {
  constructor(props) {
    this.props = props
      this.state = {
        authenticated: false,
        startSecond: `${10 * 60}`,  // Dentoo.LT Standard
        second: '0',
        power: 'OFF',
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
    return `00${num}`.slice(-2)
  }

  _onAuthStateChanged(user) {
    console.log('auth changed:');
    console.log(user);
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
  }

  _onDatabaseUpdate(data) {
    this.setState(data);
    this.props.onDatabaseUpdate(data);
  }

  updateView(parentState) {
    const { isRunning, nowSecond, startSecond, main } = parentState;
    let second = nowSecond;
    if (this.state.authenticated) {
      this.fb.setData({
         second: `${second}`,
      });
    }
    else {
      second = parseInt(this.state.second, 10);
    }
    const sec = second % 60;
    const min = Math.floor((second - sec) / 60);

    this.indicator.innerHTML = `${this._zfill(min)}:${this._zfill(sec)}`;

    console.log(isRunning, nowSecond, startSecond, main);
    if (isRunning) {
      if (second < parseInt(startSecond, 10) * 0.2) {
        main.setAttribute('class', 'hurry')
      }
      else {
        main.setAttribute('class', 'isRunning')
      }
    }
    else {
      main.setAttribute('class', 'notRunning')
    }

    if (min > 0 || sec > 0) {
      this.indicator.setAttribute('class', null)
    }
    else {
      this.indicator.setAttribute('class', 'end')
    }
  }
}

// button
// propTypes: {
//     id: string.isRequired,
//     onClick: func.isRequired
//   }
class Button {
  constructor(props) {
    this.props = props

    this.button = document.getElementById(this.props.id)
    this.button.addEventListener('click', this._onClick.bind(this))
  }

  _onClick(e) {
    this.button.blur()
    this.props.onClick(e)
  }
}

// input
// propTypes: {
//     id: string.isRequired,
//     onTimeSubmit: func.isRequired
//   }
class TimerInput {
  constructor(props) {
    this.props = props

    this.input = document.getElementById(this.props.id)
    this.input.focus()
  }

  // test for is 1 ~ 99
  // returns: boolean
  _isValidMinute(min) {
    if (Math.round(min) === min  // is integer
        && min >= 1
        && min <= 99) {
      return true
    }
    return false
  }

  onSubmit() {
    const minute = parseInt(this.input.value)
    const isValid = this._isValidMinute(minute)
    if (isValid) {
      this.input.setAttribute('class', 'valid')
      this.input.blur()

      // pass second
      this.props.onTimeSubmit(minute * 60)
    }
    else {
      this.input.setAttribute('class', 'invalid')
      this.input.focus()
    }
  }
}

// root controller
class TimerController {
  constructor() {
    this.state = {
      isRunning: false,
      startSecond: 0,
      nowSecond: 0,
      timerId: null
    }

    // main container
    this.main = document.getElementById('main')

    // timer indicator
    this.timerIndicator =
      new TimerIndicator({
        id: 'indicator',
        onDatabaseUpdate: this._onDatabaseUpdate.bind(this),
      })

    // time input
    this.timerInput =
      new TimerInput({
        id: 'input',
        onTimeSubmit: this._resetTimer.bind(this)
      })

    // buttons
    this.resetButton =
      new Button({
        id: 'resetButton',
        onClick: this._onPressResetButton.bind(this)
      })

    this.startStopButton =
      new Button({
        id: 'startStopButton',
        onClick: this._switchTimer.bind(this)
      })

    document.addEventListener('keydown', this._onKeydown.bind(this))
  }

  setState(state) {
    this.state = Object.assign(this.state, state);
  }

  // args: KeyboardEvent
  _onKeydown(e) {
    // no timer operations if inputting
    if (document.activeElement === input) {
      if (e.key === 'Enter') {
        this.timerInput.onSubmit()
      }
      return
    }

    const keydownOperations = {
      ' ':          () => { this._switchTimer() },
      's':          () => { this._switchTimer() },
      'Escape':     () => { this._resetTimer(this.state.startSecond) },
      'r':          () => { this._resetTimer(this.state.startSecond) },
      'ArrowRight': () => { this._modifySecond(-10) },
      'ArrowLeft':  () => { this._modifySecond(10) },
      'ArrowDown':  () => { this._modifySecond(-1) },
      'ArrowUp':    () => { this._modifySecond(1) },
    }

    const key = Object.keys(keydownOperations)
      .filter(k => {
        return k === e.key
      })[0]

    if (key) {
      keydownOperations[key]()
    }
  }

  _onPressResetButton() {
    this.timerInput.onSubmit()
  }

  _onDatabaseUpdate(data) {
    this.setState({
      isRunning: data.power === 'ON',
      startSecond: parseInt(data.startSecond, 10),
    });
    this._updateView();
  }

  // update the timer view with the state
  _updateView() {
    this.timerIndicator.updateView(
      Object.assign(this.state, { main: this.main })
    );
  }

  // modify the second of the state
  // args: integer
  _modifySecond(diff) {
    const nextSecond = this.state.nowSecond + diff
    // time is allowed to be between 00:00-99:59
    if (0 <= nextSecond && nextSecond <= 99 * 60 + 59) {
      this.state.nowSecond = nextSecond
      this._updateView()
    }
  }

  // (re)set the timer to startSecond
  _resetTimer(second) {
    this._stopTimer();

    this.state.startSecond = second;
    this.timerIndicator.fb.setData({
      startSecond: `${this.state.startSecond}`,
    });
    this.state.nowSecond = this.state.startSecond;
    this._updateView();
  }

  _startTimer() {
    if (this.state.nowSecond > 0) {
      this.state.isRunning = true
      this.timerIndicator.fb.setData({
        power: 'ON',
      });

      this.state.timerId = setInterval(() => {
        this.state.nowSecond -= 1

        if (this.state.nowSecond <= 0) {
          // stop timer
          this.state.nowSecond = 0
          this._stopTimer()
        }

        this._updateView()
      }, 1000)
    }

    // update view even not started
    this._updateView()
  }

  _stopTimer() {
    clearInterval(this.state.timerId)
    this.state.isRunning = false
    this.timerIndicator.fb.setData({
      power: 'OFF',
    });

    this._updateView()
  }

  // if on  -> then off
  // if off -> then on
  _switchTimer() {
    if (this.state.isRunning) {
      this._stopTimer()
      return
    }
    this._startTimer()
  }
}

const lttimer = new TimerController();


