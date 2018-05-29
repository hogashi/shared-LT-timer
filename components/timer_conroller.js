

// root controller
export default class TimerController {
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
    if (!this.state.authenticated) {
      return;
    }
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
    this._stopTimer();
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
    console.log("working...");
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
