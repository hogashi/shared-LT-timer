// timer_controller.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import * as LoginForm from "./login_form";
import * as Constants from '../components/constants';

export default class TimerController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      isRunning:     false,
      startSecond:   `${10 * 60}`,
      nowSecond:     `${10 * 60}`,
      timerId:       null,
    };

    // time input
    this.timerInput =
      new TimerInput({
        id: "minuteInput",
        onMinuteSubmit: this._onMinuteSubmit.bind(this)
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
  }

  componentDidMount() {
    document.addEventListener("keydown", this._onKeydown.bind(this));
  }

  // args: KeyboardEvent
  _onKeydown(e) {
    if (!this.state.authenticated) {
      return;
    }

    switch (e.key) {
      case " ":
      case "s":
        this._switchTimer();
        break;
      case "Escape":
      case "r":
        this._resetTimer(this.state.startSecond);
        break;
      case "ArrowRight":
        this._modifySecond(-10);
        break;
      case "ArrowLeft":
        this._modifySecond(10);
        break;
      case "ArrowDown":
        this._modifySecond(-1);
        break;
      case "ArrowUp":
        this._modifySecond(1);
        break;
    };
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
    if (Constants.DEBUG) {
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

  _onMinuteSubmit(min) {
    this._resetTimer(min * 60);
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

  _makeMainClassName() {
    const { isRunning, startSecond, nowSecond } = this.state;
    if (isRunning) {
      return "isRunning";
    }
    return "notRunning";
  }

  _renderIndicator() {
    const second = parseInt(this.state.nowSecond, 10);
    const sec = `00${second % 60}`.slice(-2);
    const min = `00${Math.floor(second / 60)}`.slice(-2);

    return (
      <div id="indicator" className={second <= 0 ? "end" : null}>
        {min}:{sec}
      </div>
    );
  }

  _renderOperationDescription() {
    if (this.state.authenticated) {
      return (
        <div id="description">
          <b>Space/S</b>: start/stop,&nbsp;&nbsp;
          <b>Escape/R</b>: reset,&nbsp;&nbsp;
          <b>C-r/F5</b>: init,&nbsp;&nbsp;
          <b>Arrows</b>: [in/de]crease time
        </div>
      );
    }
    return null;
  }

  render() {
    console.log("working...");

    const { authenticated, isRunning, nowSecond, startSecond } = this.state;

    if (authenticated) {
      Firebase.setData({
        second:      `${nowSecond}`,
        startSecond: `${startSecond}`,
      });
    }

    let hurry;
    if (second < parseInt(startSecond, 10) * 0.2) {
      hurry = "hurry";
    }

    return (
      <main id="main"
            className={classNames(isRunning ? "on" : "off", hurry)}>
        <TimerInput onMinuteInput={this._onMinuteInput.bind(this)} />
        {this._renderIndicator()}
        <footer>
          {this._renderOperationDescription()}
          <LoginContainer />
        </footer>
        <Firebase />
      </main>
    );
  }
}
