// timer_input
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
