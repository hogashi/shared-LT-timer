// timer_controller.js

import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import TimerInput from "./timer_input";
import LoginContainer from "./login_container";
import * as Constants from './constants';

export default class TimerController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      isRunning:     false,
      startSecond:   10 * 60,
      nowSecond:     10 * 60,
      timerId:       null,
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this._onKeydown.bind(this));
  }

  // args: KeyboardEvent
  _onKeydown(e) {
    if (!this.state.authenticated || e.target.getAttribute("id") === "minuteInput") {
      return;
    }

    switch (e.key) {
      case " ":
      case "s":
        this._switchTimer();
        break;
      case "Escape":
      case "r":
        this._resetStartSecond(this.state.startSecond);
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

  _onAuthStateChanged(authenticated) {
    this.setState({ authenticated });
    this._stopTimer();
  }

  _onDbUpdate(data) {
    if (Constants.DEBUG) {
      console.log('authenticated', this.state.authenticated);
    }
    if (this.state.authenticated) {
      return;
    }
    this.setState({
      isRunning: data.power === Constants.POWER_ON,
      nowSecond: parseInt(data.second, 10),
      startSecond: parseInt(data.startSecond, 10),
    });
  }

  _onMinuteSubmit(min) {
    this._resetStartSecond(min * 60);
  }

  // modify the second of the state
  // args: integer
  _modifySecond(diff) {
    const nextSecond = this.state.nowSecond + diff;
    // time is allowed to be between 00:00-99:59
    if (0 <= nextSecond && nextSecond <= 99 * 60 + 59) {
      this.setState({
        nowSecond: nextSecond
      });
    }
  }

  // (re)set the timer second to startSecond
  _resetStartSecond(second) {
    this._stopTimer();

    this.setState({
      nowSecond  : second,
      startSecond: second
    });
  }

  _reduceSecond() {
    const { nowSecond } = this.state;

    this.setState({
      nowSecond: nowSecond - 1,
    });
    if (nowSecond - 1 <= 0) {
      // stop timer
      this.setState({
        nowSecond: 0,
      });
      this._stopTimer();
      return;
    }
  }

  _startTimer() {
    const { authenticated, nowSecond } = this.state;
    if (nowSecond > 0) {
      this.setState({
        isRunning: true,
      });

      const timerId = setInterval(this._reduceSecond.bind(this), 1000);

      this.setState({
        timerId: timerId,
      });
    }
  }

  _stopTimer() {
    const { authenticated, timerId } = this.state;

    clearInterval(timerId);
    this.setState({
      isRunning: false,
    });
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
    return this.state.isRunning ? "isRunning" : "notRunning";
  }

  _renderIndicator() {
    const { nowSecond } = this.state;

    const sec = `00${nowSecond % 60}`.slice(-2);
    const min = `00${Math.floor(nowSecond / 60)}`.slice(-2);

    return (
      <div id="indicator" className={nowSecond <= 0 ? "end" : null}>
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

    const newData = {
      power:       isRunning ? Constants.POWER_ON : Constants.POWER_OFF,
      second:      `${nowSecond}`,
      startSecond: `${startSecond}`,
    };

    let hurry;
    if (nowSecond < parseInt(startSecond, 10) * 0.2) {
      hurry = "hurry";
    }

    return (
      <main id="main"
            className={classNames(isRunning ? "on" : "off", hurry)}>
        <TimerInput authenticated={authenticated}
                    onMinuteSubmit={this._onMinuteSubmit.bind(this)}
                    onStartStopButtonPressed={this._switchTimer.bind(this)} />
        {this._renderIndicator()}
        <footer>
          {this._renderOperationDescription()}
          <LoginContainer {...newData}
                          onDbUpdate={this._onDbUpdate.bind(this)}
                          onAuthStateChanged={this._onAuthStateChanged.bind(this)} />
        </footer>
      </main>
    );
  }
}
