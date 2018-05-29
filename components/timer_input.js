// timer_input.js

import React, { Component } from "react";
import PropTypes from "prop-types";

export default class TimerInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputState: "",
      minute:     "10",
    };
  }

  componentDidMount() {
    this.inputRef.focus();
  }

  componentWillReceiveProps(nextProps) {
    const startSecond = nextProps.startSecond;
    if (!nextProps.authenticated) {
      this.setState({
        minute: `${Math.floor(startSecond ? startSecond / 60 : 10)}`,
      });
    }
  }

  _onChange(e) {
    console.log(e, e.target, e.target.value);
    this.setState({
      minute: e.target.value,
    });
  }

  _onKeyDown(e) {
    e.stopPropagation();
    if (e.key === "Enter") {
      this._onMinuteSubmit();
    }
  }

  // test whether is 1 ~ 99
  // returns: boolean
  _isValidMinute(min) {
    return 1 <= min && min <= 99;
  }

  _onMinuteSubmit() {
    if (!this.props.authenticated) {
      return;
    }

    const minute = parseInt(this.state.minute);
    if (this._isValidMinute(minute)) {
      this.setState({
        inputState: "valid",
      });
      this.inputRef.blur();

      this.props.onMinuteSubmit(minute);
    }
    else {
      this.setState({
        inputState: "invalid",
      });
      this.inputRef.focus();
    }
  }

  _renderButtonContainter() {
    const { authenticated, onStartStopButtonPressed } = this.props;

    if (authenticated) {
      return (
        <div id="buttonContainer">
          <button id="resetButton"
                  onClick={this._onMinuteSubmit.bind(this)}>
            [re]<br />set
          </button>
          <button id="startStopButton"
                  onClick={this.props.onStartStopButtonPressed.bind(this)}>
            start<br />stop
          </button>
        </div>
      );
    }
    return null;
  }

  render() {
    const { authenticated, startSecond } = this.props;
    const { inputState, minute } = this.state;

    return (
      <div id="interaction">
        minute(s):
        <input id="minuteInput"
               ref={ref => this.inputRef = ref}
               className={inputState}
               type="text"
               placeholder="1~99"
               readOnly={!authenticated}
               value={minute}
               onChange={this._onChange.bind(this)}
               onKeyDown={this._onKeyDown.bind(this)} />
        {this._renderButtonContainter()}
      </div>
    );
  }
}
