// timerIndicator

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
