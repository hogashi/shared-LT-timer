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
