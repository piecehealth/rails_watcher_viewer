function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i) {
  var c = (i & 0x00FFFFFF).toString(16).toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

function getColor(str) {
  return "#" + intToRGB(hashCode(str));
}

class CallStacks extends React.Component {

  constructor(props) {
    super(props);
    this.updatePath = this.updatePath.bind(this);
    this.state = {
      paths: ["root"],
      msThreshold: 0,
      enableSameWidth: false,
      sameWidth: 100
    };
  }

  updatePath(currentId, id) {
    let paths = this.state.paths;
    if (paths[paths.length - 1] === currentId) {
      paths.push(id);
    } else if (paths.includes(currentId)) {
      const idx = paths.indexOf(currentId);
      paths = paths.slice(0, idx + 1);
      paths.push(id);
    }
    this.setState({ paths: paths });
  }

  render() {
    const msInput = React.createElement("input", { type: "text", size: "3", value: this.state.msThreshold,
      onChange: e => {
        this.setState({ msThreshold: e.target.value });
      } });

    const sameWidthInput = React.createElement("input", { type: "checkbox", value: this.state.enableSameWidth,
      onChange: e => {
        this.setState({ enableSameWidth: e.target.checked });
      } });

    let threshold = parseFloat(this.state.msThreshold);
    if (!threshold) threshold = 0;

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        null,
        "Same width for each bar ",
        sameWidthInput,
        this.state.enableSameWidth && React.createElement(
          "span",
          null,
          React.createElement("input", { type: "text", size: "3", value: this.state.sameWidth,
            onChange: e => {
              this.setState({ sameWidth: e.target.value });
            } }),
          " px"
        )
      ),
      React.createElement(
        "div",
        null,
        "Ignore method call faster than ",
        msInput,
        "ms"
      ),
      this.state.paths.map(current => {
        let stack;
        if (current === "root") {
          stack = this.props.stack;
        } else {
          stack = window.methodCallTable[current].children;
        }
        return React.createElement(CallStack, {
          key: stack[0],
          stack: stack,
          current: current,
          threshold: threshold,
          enableSameWidth: this.state.enableSameWidth,
          sameWidth: this.state.sameWidth,
          updatePath: this.updatePath
        });
      })
    );
  }
}

class CallStack extends React.Component {

  constructor(props) {
    super(props);
    let duration = 0;
    props.stack.forEach(stack => {
      duration += window.methodCallTable[stack].duration;
    });
    this.defaultMsThreshold = 0;
    this.defaultScaleValue = 600 / duration;
    this.state = {
      scaleValue: this.defaultScaleValue
    };
  }

  expand(methodID) {
    if (window.methodCallTable[methodID].children.length !== 0) {
      this.props.updatePath(this.props.current, methodID);
    }
  }

  render() {
    const scaleInput = React.createElement("input", { type: "text", size: "3", value: this.state.scaleValue,
      onChange: e => {
        this.setState({ scaleValue: e.target.value });
      } });

    let currentMethod, netCost;

    if (this.props.current === "root") {
      currentMethod = {
        tag: "root",
        duration: this.props.stack.reduce((accumulator, methodCall) => {
          return accumulator + window.methodCallTable[methodCall].duration;
        }, 0)
      };
    } else {
      currentMethod = window.methodCallTable[this.props.current];
      netCost = currentMethod.duration;
      currentMethod.children.forEach(id => {
        netCost -= window.methodCallTable[id].duration;
      });
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        null,
        currentMethod.tag,
        ": duration: ",
        parseFloat(currentMethod.duration).toFixed(4),
        "ms, ",
        netCost && React.createElement(
          "span",
          null,
          "net cost: ",
          netCost.toFixed(4),
          "ms"
        ),
        !this.props.enableSameWidth && React.createElement(
          "span",
          null,
          ", Scale: Display 1ms as ",
          scaleInput,
          "px "
        )
      ),
      React.createElement(
        "div",
        null,
        this.props.stack.filter(ele => {
          const methodCall = window.methodCallTable[ele];
          return methodCall.duration >= this.props.threshold;
        }).map(ele => {
          const methodCall = window.methodCallTable[ele];
          let width;
          if (this.props.enableSameWidth) {
            width = parseFloat(this.props.sameWidth);
            if (!width) width = 100;
          } else {
            let scaleValue = parseFloat(this.state.scaleValue);
            if (!scaleValue) scaleValue = this.defaultScaleValue;
            width = methodCall.duration * scaleValue;
          }

          var tag = methodCall.tag;

          if (tag.length > 50) {
            tag = tag.substring(0, 50) + '...'
          }

          return React.createElement(
            "div",
            { key: ele, className: "call-stack",
              style: {
                backgroundColor: getColor(methodCall.tag),
                width: width
              },
              duration: methodCall.duration,
              onClick: () => {
                this.expand(ele);
              }
            },
            tag
          );
        })
      )
    );
  }
}

