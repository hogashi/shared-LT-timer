// timer_input.js

import React, { Component } from "react";
import PropTypes from "prop-types";

export default class TimerInput extends Component {
  componentDidMount() {
    this.inputRef.focus();
  }

  _onChange(e) {
    this.setState({
      minute: e.target.value,
    });
  }

  _onKeyDown(e) {
    if (e.key === "Enter") {
      e.stopPropagation();
      this._onMinuteInput();
    }
  }

  // test whether is 1 ~ 99
  // returns: boolean
  _isValidMinute(min) {
    return 1 <= min && min <= 99;
  }

  _onMinuteInput() {
    const minute = parseInt(this.state.minute);
    if (this._isValidMinute(minute)) {
      this.setState({
        inputClassName: "valid",
      });
      this.inputRef.blur();

      this.props.onMinuteSubmit(minute);
    }
    else {
      this.setState({
        inputClassName: "invalid",
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
                  onClick={this._onMinuteInput}>
            [re]<br />set
          </button>
          <button id="startStopButton"
                  onClick={this.props.onStartStopButtonPressed}>
            start<br />stop
          </button>
        </div>
      );
    }
    return null;
  }

  render() {
    const { authenticated, startSecond } = this.props;
    const { inputClassName, minute } = this.state;

    if (!authenticated) {
      this.setState({
        minute: authenticated ? `${Math.floor(startSecond / 60)}` : null,
      });
    }

    return (
      <div id="interaction">
        minute(s):
        <input id="minuteInput"
               ref={ref => this.inputRef = ref}
               className={inputClassName}
               type="text"
               placeholder="1~99"
               readOnly={!authenticated}
               value={minute}
               onChange={this._onChange}
               onKeyDown={this._onKeyDown} />
        {this._renderButtonContainter()}
      </div>
    );
  }
}
